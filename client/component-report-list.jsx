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

        return <div>{_.isEmpty(items) ? 'Empty' : items}</div>;
    }
});
