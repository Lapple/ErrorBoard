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
                <tbody>
                    {_.isEmpty(items) ? empty : items}
                </tbody>
            </table>
        </div>;
    }
});
