var _ = require('lodash');
var React = require('react');
var ReportItem = require('./component-report-item.jsx');

var reportToArray = function(report) {
    return _.map(report, function(value, key) {
        return _.extend(value, {key: key});
    });
};

var getOverallStats = function(obj, next) {
    if (!obj.latest || next.latest > obj.latest) {
        obj.latest = next.latest;
    }

    if (!obj.earliest || next.earliest < obj.earliest) {
        obj.earliest = next.earliest;
    }

    return obj;
};

var sortByLatestReport = function(a, b) {
    return b.latest - a.latest;
};

module.exports = React.createClass({
    render: function() {
        var rows = reportToArray(this.props.data).sort(sortByLatestReport);

        var items = _.map(rows, function(data) {
            return ReportItem({
                key: data.key,
                type: this.props.type,
                data: data,
                overall: _.reduce(rows, getOverallStats, {})
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
