var _ = require('lodash');
var React = require('react');

var ReportItem = require('./component-report-item.jsx');
var ReporterMixin = require('./mixin-reporter');

var getOverallStats = function(obj, next) {
    if (!obj.latest || next.latest > obj.latest) {
        obj.latest = next.latest;
    }

    if (!obj.earliest || next.earliest < obj.earliest) {
        obj.earliest = next.earliest;
    }

    return obj;
};

module.exports = React.createClass({
    mixins: [ReporterMixin],
    render: function() {
        var report = this.getReport();
        var overall = _.reduce(report, getOverallStats, {});

        var items = _.map(report, function(data) {
            return ReportItem({
                key: data.key,
                type: this.props.type,
                data: data,
                timespan: true,
                overall: overall
            });
        }, this);

        var empty = <tr>
            <td>Empty</td>
        </tr>;

        return <div className="report">
            <table className="report__table">
                { this.thead() }
                <tbody>
                    { _.isEmpty(items) ? empty : items }
                </tbody>
            </table>
        </div>;
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
