var _ = require('lodash');
var React = require('react');

var Reports = require('./reports');
var ReportItem = require('./component-report-item.jsx');

var HOUR = 60 * 60 * 1000;

module.exports = React.createClass({
    getInitialState: function() {
        return {
            index: [],
            hasOrderBroken: false
        };
    },
    render: function() {
        var that = this;

        var now = Date.now();
        var earliest = _.reduce(this.state.index, getEarliest, now);

        var items = _.map(this.state.index, function(data) {
            return ReportItem({
                key: data.key,
                type: this.props.type,
                data: data,
                timespan: {
                    earliest: earliest,
                    latest: now
                },
                onClick: _.partial(this.props.onClick, data)
            });
        }, this);

        return <div className="report">
            { this.orderUpdateNotice() }
            <table className="report__table">
                { this.thead() }
                <tbody>
                    { _.isEmpty(items) ? this.empty() : items }
                </tbody>
            </table>
        </div>;
    },
    empty: function() {
        return <tr>
            <td colSpan='3'>Empty</td>
        </tr>;
    },
    thead: function() {
        var title = 'Message';

        if (this.props.type === 'browsers') {
            title = 'Browser';
        } else if (this.props.type === 'scripts') {
            title = 'Script';
        } else if (this.props.type === 'pages') {
            title = 'Page URL';
        }

        return <thead>
            <tr className='report__row report__row_head'>
                <th className='report__cell report__cell_head'>{ title }</th>
                <th className='report__cell report__cell_head report__cell_count'>Count</th>
                <th className='report__cell report__cell_head report__cell_timespan'>Timespan</th>
            </tr>
        </thead>;
    },
    orderUpdateNotice: function() {
        if (this.state.hasOrderBroken) {
            return <div className='notice'>
                <div className='button notice__button' onClick={ this.refreshOrder }>
                    Refresh order
                </div>
                Note: Actual table order has changed after update.
            </div>
        }
    },
    componentDidMount: function() {
        this._interval = setInterval(this.forceUpdate.bind(this), HOUR);
        this.fetchData(this.props);
    },
    componentWillReceiveProps: function(props) {
        this.fetchData(props);
    },
    componentWillUnmount: function() {
        clearInterval(this._interval);
    },
    updateData: function() {
        var data = Reports.get(this.props.type);
        var isIndexEmpty = _.isEmpty(this.state.index);
        var index = isIndexEmpty ? this.getFreshIndex(data) : this.getUpdatedIndex(data);

        this.setState({
            index: index,
            hasOrderBroken: !isSortedByLatest(index)
        });
    },
    refreshOrder: function() {
        this.setState({
            state: this.getFreshIndex(this.state.index),
            hasOrderBroken: false
        });
    },
    fetchData: function(props) {
        Reports.fetch(props.type).done(this.updateData);
    },
    getFreshIndex: function(data) {
        var rows = _.isArray(data) ? data : toArray(data);

        return rows.sort(sortByLatestReport);
    },
    getUpdatedIndex: function(data) {
        var index = this.state.index;

        return toArray(data).sort(function(a, b) {
            return getCurrentIndex(index, a.key) - getCurrentIndex(index, b.key);
        });
    }
});

function getEarliest(memo, item) {
    return _.min([memo, item.earliest]);
}

function sortByLatestReport(a, b) {
    return b.latest - a.latest;
}

function toArray(object) {
    return _.map(object, function(value, key) {
        return _.extend(_.clone(value), {key: key});
    });
}

function getCurrentIndex(index, key) {
    return _.findIndex(index, {key: key});
}

function isSortedByLatest(list) {
    return _.every(list, function(item, index, list) {
        return index === 0 || list[index - 1].latest > item.latest;
    });
}
