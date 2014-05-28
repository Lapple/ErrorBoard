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
            return <div className='notice' onClick={ this.refreshOrder }>
                Actual table order has changed after update. Click this message to refresh order.
                <svg className='notice__icon' version='1.2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M8 16.184v-.684c0-.848.512-1.595 1.287-2.047-.667-.282-1.279-.667-1.822-1.131-.904.814-1.465 1.938-1.465 3.178v.684c-1.161.415-2 1.514-2 2.816 0 1.654 1.346 3 3 3s3-1.346 3-3c0-1.302-.839-2.401-2-2.816zm-1 3.816c-.552 0-1-.449-1-1s.448-1 1-1 1 .449 1 1-.448 1-1 1zM16 7.815v.351c0 .985-.535 1.852-1.345 2.36.665.274 1.279.646 1.823 1.1.936-.878 1.522-2.102 1.522-3.459v-.351c1.161-.415 2-1.514 2-2.816 0-1.654-1.346-3-3-3s-3 1.346-3 3c0 1.302.839 2.401 2 2.815zm1-3.815c.552 0 1 .449 1 1s-.448 1-1 1-1-.449-1-1 .448-1 1-1zM17.935 16.164c-.41-2.913-2.911-5.164-5.935-5.164-1.936 0-3.552-1.381-3.92-3.209 1.12-.436 1.92-1.519 1.92-2.791 0-1.654-1.346-3-3-3s-3 1.346-3 3c0 1.326.87 2.44 2.065 2.836.41 2.913 2.911 5.164 5.935 5.164 1.936 0 3.552 1.381 3.92 3.209-1.12.436-1.92 1.519-1.92 2.791 0 1.654 1.346 3 3 3s3-1.346 3-3c0-1.326-.87-2.44-2.065-2.836zm-10.935-12.164c.552 0 1 .449 1 1s-.448 1-1 1-1-.449-1-1 .448-1 1-1zm10 16c-.552 0-1-.449-1-1s.448-1 1-1 1 .449 1 1-.448 1-1 1z' transform="rotate(90, 12, 12)"/>
                </svg>
            </div>
        }
    },
    componentDidMount: function() {
        this._interval = setInterval(this.forceUpdate.bind(this), HOUR);
        this.fetchData(this.props);
    },
    componentWillReceiveProps: function(props) {
        if (this.props.type !== props.type) {
            this.setState(this.getInitialState());
        }

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
