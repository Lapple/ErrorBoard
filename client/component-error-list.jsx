var _ = require('lodash');
var React = require('react');
var ErrorItem = require('./component-error-item.jsx');

module.exports = React.createClass({
    render: function() {
        var errorItems = _.map(this.props.groups, function(data, message) {
            return ErrorItem({
                key: message,
                message: message,
                browsers: data.browsers,
                count: data.count
            });
        });

        return <div>{_.isEmpty(errorItems) ? 'Empty' : errorItems}</div>;
    }
});
