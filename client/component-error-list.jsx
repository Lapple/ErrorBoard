var _ = require('lodash');
var React = require('react');
var ErrorItem = require('./component-error-item.jsx');

module.exports = React.createClass({
    render: function() {
        var items = _.map(this.props.data, function(data, message) {
            return ErrorItem({
                key: message,
                message: message,
                browsers: data.browsers,
                count: data.count
            });
        });

        return <div>{_.isEmpty(items) ? 'Empty' : items}</div>;
    }
});
