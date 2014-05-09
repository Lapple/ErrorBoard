var _ = require('lodash');
var React = require('react');
var ReportItem = require('./component-report-item.jsx');

module.exports = React.createClass({
    render: function() {
        var items = _.map(this.props.data, function(data, title) {
            return ReportItem({
                key: title,
                type: this.props.type,
                title: title,
                data: data
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
