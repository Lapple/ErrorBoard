var _ = require('lodash');
var React = require('react');

var Reports = require('./reports');
var ReportItem = require('./component-report-item.jsx');
var Notice = require('./component-notice.jsx');
var UpdateCounter = require('./component-update-counter.jsx');

var HOUR = 60 * 60 * 1000;

module.exports = React.createClass({
    getInitialState: function() {
        return {
            index: null,
            lastRefreshed: Date.now(),
            timespanLatest: Date.now(),
            updatesCount: 0,
            newCount: 0,
            hasOrderBroken: false,
            filterValue: ''
        };
    },
    render: function() {
        var latest = this.state.timespanLatest;
        var earliest = _.reduce(this.state.index, getEarliest, latest);

        var items = _.map(this.state.index, function(data) {
            return <ReportItem
                key={ data.key }
                type={ this.props.type }
                data={ data }
                timespan={ {
                    earliest: earliest,
                    latest: latest
                } }
                onClick={ _.partial(this.props.onClick, data) } />;
        }, this);

        return <div className='report'>
            <div className='report__head'>
                <UpdateCounter
                    count={ this.state.updatesCount }
                    since={ this.state.lastRefreshed }
                    onClick={ this.createIndex } />
                { this.notice() }
                { this.filterForm() }
            </div>
            <table className='report__table'>
                { this.thead() }
                <tbody>
                    { items.length ? items: this.empty() }
                </tbody>
            </table>
        </div>;
    },
    empty: function() {
        var label = _.isNull(this.state.index) ? 'Loading…' : 'Nothing to display';

        return <tr>
            <td colSpan='4' className='report__cell report__cell_single'>
                { label }
            </td>
        </tr>;
    },
    thead: function() {
        var title = 'Message';
        var type = this.props.type;

        if (type === 'browsers') {
            title = 'Browser';
        } else if (type === 'scripts') {
            title = 'Script';
        } else if (type === 'pages') {
            title = 'Page URL';
        } else if (type === 'meta') {
            title = 'Metadata';
        }

        return <thead>
            <tr className='report__row report__row_head'>
                <th className='report__cell report__cell_head'>{ title }</th>
                <th className='report__cell report__cell_head report__cell_count'>Count</th>
                <th className='report__cell report__cell_head report__cell_delta' />
                <th className='report__cell report__cell_head report__cell_timespan'>Timespan</th>
            </tr>
        </thead>;
    },
    notice: function() {
        if (this.state.newCount) {
            return <Notice count={ this.state.newCount } onClick={ this.createIndex } />;
        } else if (this.state.hasOrderBroken) {
            return <Notice onClick={ this.createIndex } />;
        }
    },
    filterForm: function() {
        if (this.props.type !== 'messages') {
            return null;
        }

        return <form className='report__filter' onSubmit={ this.onFilterSubmit }>
            <input
                type='text'
                className='report__field'
                // For now indeed only metadata filtering is supported.
                placeholder='Filter by metadata…'
                value={ this.state.filterValue }
                onChange={ this.onFilterChange } />
            <button className='report__submit' type='submit'>
                <svg version='1.2' xmlns='http://www.w3.org/2000/svg' width='9' viewBox='0 0 512 1024' fill='currentColor'>
                    <path d='M480 512L160 832l-96-96 240-224L64 288l96-96 320 320z' />
                </svg>
            </button>
        </form>;
    },
    componentDidMount: function() {
        this._interval = setInterval(this.updateTimespan, HOUR);

        fetchReport(this.props.type, this.state.filterValue)
            .done(this.updateData);
    },
    componentWillReceiveProps: function(props) {
        var state = this.state;

        if (this.props.type !== props.type) {
            state = this.getInitialState();
            this.setState(state);
        }

        fetchReport(props.type, state.filterValue)
            .done(this.updateData);
    },
    componentWillUnmount: function() {
        clearInterval(this._interval);
    },
    updateData: function() {
        if (this.state.index === null) {
            this.createIndex();
        } else {
            this.updateIndex();
        }
    },
    createIndex: function() {
        var data = this.getReport();
        var index = _.map(data, addKey).sort(sortByLatestReport);

        this.setState({
            index: index,
            lastRefreshed: Date.now(),
            timespanLatest: Date.now(),
            updatesCount: 0,
            newCount: 0,
            hasOrderBroken: false
        });
    },
    updateIndex: function() {
        var data = this.getReport();

        var addIndex = _.partial(addCurrentIndex, this.state.index);
        var addDelta = _.partial(countDelta, this.state.index);
        var indexed = _.map(data, _.compose(addDelta, addIndex, addKey));

        var rows = partition(indexed, isIndexed);
        var index = rows[0].sort(sortByCurrentIndex);

        this.setState({
            index: index,
            hasOrderBroken: !isSortedByLatest(index),
            updatesCount: sumDeltas(indexed),
            newCount: rows[1].length,
            timespanLatest: Date.now()
        });
    },
    getReport: function() {
        return Reports.get(this.props.type, {
            filterMetaBy: this.state.filterValue
        });
    },
    updateTimespan: function() {
        this.setState({
            timespanLatest: Date.now()
        });
    },
    onFilterChange: function(e) {
        this.setState({
            filterValue: e.target.value
        });
    },
    onFilterSubmit: function(e) {
        fetchReport(this.props.type, this.state.filterValue)
            .done(this.createIndex);

        e.preventDefault();
    }
});

function fetchReport(type, filterValue) {
    return Reports.fetch(type, {
        filterMetaBy: filterValue
    });
}

function getEarliest(memo, item) {
    return _.min([memo, item.earliest]);
}

function sortByLatestReport(a, b) {
    return b.latest - a.latest;
}

function sortByCurrentIndex(a, b) {
    return a._index - b._index;
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

function isIndexed(item) {
    return item._index !== -1;
}

function addKey(value, key) {
    return _.extend(_.clone(value), {key: key});
}

function addCurrentIndex(index, item) {
    return _.extend(item, {
        _index: _.findIndex(index, {key: item.key})
    });
}

function countDelta(index, item) {
    var prev = index[item._index] || {};
    var count = prev.count || 0;
    var delta = prev.delta || 0;

    return _.extend(item, {
        delta: item.count - count + delta
    });
}

function sumDeltas(index) {
    return _.reduce(index, function(memo, item) {
        return memo += item.delta;
    }, 0);
}
