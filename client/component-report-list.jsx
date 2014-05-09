var _ = require('lodash');
var React = require('react');
var ReportItem = require('./component-report-item.jsx');

module.exports = React.createClass({
    render: function() {
        var items = _.map(this.props, function(data, title) {
            return ReportItem({
                key: title,
                title: title,
                data: data
            });
        });

        return <div>{_.isEmpty(items) ? 'Empty' : items}</div>;
    }
});
