var _ = require('lodash');
var slug = require('speakingurl');
var page = require('page');
var React = require('react');

var ReportItem = require('./component-report-item.jsx');
var ReporterMixin = require('./mixin-reporter');

var HOUR = 60 * 60 * 1000;

var getEarliest = function(memo, item) {
    return _.min([memo, item.earliest]);
};

module.exports = React.createClass({
    mixins: [ReporterMixin],
    getInitialState: function() {
        return {now: Date.now()};
    },
    render: function() {
        var that = this;

        var report = this.getReport();
        var earliest = _.reduce(report, getEarliest);

        var items = _.map(report, function(data) {
            return ReportItem({
                key: data.key,
                type: that.props.type,
                data: data,
                timespan: {
                    earliest: earliest,
                    latest: that.state.now
                },
                onClick: function() {
                    var url = '/' + that.props.type + '/' + slug(data.key) + '/';
                    page.show(url, {details: data.key});
                },
            });
        });

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
        this._interval = setInterval(this.updateNow, HOUR);
    },
    componentWillUnmount: function() {
        clearInterval(this._interval);
    },
    updateNow: function() {
        this.setState({now: Date.now()});
    }
});
