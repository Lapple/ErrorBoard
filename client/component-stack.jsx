var React = require('react');
var cx = React.addons.classSet;

module.exports = React.createClass({
    render: function() {
        var classes = cx({
            'stack': true,
            'stack_filled': !!this.props.data
        });

        return <div className={ classes }>
            { this.props.data }
        </div>;
    }
});
