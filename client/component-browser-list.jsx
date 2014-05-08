var _ = require('lodash');
var React = require('react');
var BrowserItem = require('./component-browser-item.jsx');

module.exports = React.createClass({
    render: function() {
        var items = _.map(this.props.data, function(data, name) {
            return BrowserItem({
                key: name,
                name: name,
                count: data.count
            });
        });

        return <div>{_.isEmpty(items) ? 'Empty' : items}</div>;
    }
});
