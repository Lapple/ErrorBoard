var _ = require('lodash');
var React = require('react');

var Reports = require('./reports');
var ReportItem = require('./component-report-item.jsx');

var HOUR = 60 * 60 * 1000;

module.exports = React.createClass({
    getInitialState: function() {
        return {
            index: [],
            newCount: 0,
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
            { this.notice() }
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
    notice: function() {
        if (this.state.newCount) {
            var phrase = this.state.newCount === 1 ? 'item is not shown' : 'items are not shown';

            return <div className='notice' onClick={ this.createIndex }>
                { this.state.newCount } new { phrase }. Click this message to refresh the list.
                <svg className='notice__icon' version='1.2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M12 5.511c.561 0 1.119.354 1.544 1.062l5.912 9.854c.851 1.415.194 2.573-1.456 2.573h-12c-1.65 0-2.307-1.159-1.456-2.573l5.912-9.854c.425-.708.983-1.062 1.544-1.062m0-2c-1.296 0-2.482.74-3.259 2.031l-5.912 9.856c-.786 1.309-.872 2.705-.235 3.83s1.879 1.772 3.406 1.772h12c1.527 0 2.77-.646 3.406-1.771s.551-2.521-.235-3.83l-5.912-9.854c-.777-1.294-1.963-2.034-3.259-2.034zM13.5 16.748s-.711.361-1.075.182c-.362-.184-.434-.541-.229-1.152l.406-1.221c.403-1.221-.121-2.076-1.082-2.131-1.258-.07-2.02.826-2.02.826s.71-.365 1.075-.182c.362.184.432.541.229 1.152l-.406 1.221c-.405 1.221.119 2.074 1.082 2.131 1.258.071 2.02-.826 2.02-.826z'/>
                    <circle cx='12' cy='10' r='1.301'/>
                </svg>
            </div>
        } else if (this.state.hasOrderBroken) {
            return <div className='notice' onClick={ this.createIndex }>
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
        if (_.isEmpty(this.state.index)) {
            this.createIndex();
        } else {
            this.updateIndex();
        }
    },
    fetchData: function(props) {
        Reports.fetch(props.type).done(this.updateData);
    },
    createIndex: function() {
        var data = Reports.get(this.props.type);

        this.setState({
            index: toArray(data).sort(sortByLatestReport),
            hasOrderBroken: false,
            newCount: 0
        });
    },
    updateIndex: function() {
        var data = Reports.get(this.props.type);
        var index = this.state.index;

        var byCurrentIndex = function(a, b) {
            return getCurrentIndex(index, a.key) - getCurrentIndex(index, b.key);
        };

        var isIndexed = function(item) {
            return getCurrentIndex(index, item.key) !== -1;
        };

        var rows = partition(toArray(data), isIndexed);
        var index = rows[0].sort(byCurrentIndex);

        this.setState({
            index: index,
            hasOrderBroken: !isSortedByLatest(index),
            newCount: rows[1].length
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

function partition(list, fn) {
    return _.reduce(list, function(memo, item) {
        memo[fn(item) ? 0 : 1].push(item);
        return memo;
    }, [[], []]);
}
