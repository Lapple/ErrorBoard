var _ = require('lodash');
var React = require('react');
var ErrorItem = require('./component-error-item.jsx');

module.exports = React.createClass({
    render: function() {
        var items = _.map(this.props, function(data, message) {
            return ErrorItem({
                key: message,
                message: message,
                data: data
            });
        });

        return <div>{_.isEmpty(items) ? 'Empty' : items}</div>;
    }
});
