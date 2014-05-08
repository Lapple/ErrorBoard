var React = require('react');

module.exports = React.createClass({
    render: function() {
        return <div>
            {this.props.message} - {this.props.count} - {this.props.browsers.join(', ')}
        </div>;
    }
});
