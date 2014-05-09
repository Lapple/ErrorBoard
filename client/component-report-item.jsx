var React = require('react');

module.exports = React.createClass({
    render: function() {
        return <div>
            <b>{this.props.title}</b>
            &nbsp;
            ({this.props.data.count})
            &nbsp;
            {this.props.data.browsers.join(', ')}
        </div>;
    }
});
