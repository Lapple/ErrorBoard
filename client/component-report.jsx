var _ = require('lodash');
var slug = require('speakingurl');
var page = require('page');
var React = require('react');

var ReportItem = require('./component-report-item.jsx');
var ReporterMixin = require('./mixin-reporter');

var getOverallStats = function(obj, next) {
    obj.earliest = _.min([obj.earliest, next.earliest]);

    return obj;
};

module.exports = React.createClass({
    mixins: [ReporterMixin],
    render: function() {
        var that = this;

        var report = this.getReport();
        var overall = _.reduce(report, getOverallStats, {latest: Date.now()});

        var items = _.map(report, function(data) {
            return ReportItem({
                key: data.key,
                type: that.props.type,
                data: data,
                timespan: true,
                overall: overall,
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
    }
});
