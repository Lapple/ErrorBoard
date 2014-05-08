var React = require('react');

module.exports = React.createClass({
    render: function() {
        return <div>
            <b>{this.props.message}</b>
            &nbsp;
            ({this.props.count})
            &nbsp;
            {this.props.browsers.join(', ')}
        </div>;
    }
});
