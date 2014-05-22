var _ = require('lodash');
var React = require('react');

var Reports = require('./reports');
var ReportItem = require('./component-report-item.jsx');
var ReporterMixin = require('./mixin-reporter');

var HOUR = 60 * 60 * 1000;

var getEarliest = function(memo, item) {
    return _.min([memo, item.earliest]);
};

module.exports = React.createClass({
    mixins: [ReporterMixin],
    getInitialState: function() {
        return {
            data: {}
        };
    },
    render: function() {
        var that = this;

        var now = Date.now();
        var report = this.getReport(this.state.data);
        var earliest = _.reduce(report, getEarliest, now);

        var items = _.map(report, function(data) {
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
        this.setState({data: Reports.get(this.props.type)});
    },
    fetchData: function(props) {
        Reports.fetch(props.type).done(this.updateData);
    }
});
