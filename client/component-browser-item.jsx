var React = require('react');

module.exports = React.createClass({
    render: function() {
        return <div>
            <b>{this.props.name}</b>
            &nbsp;
            ({this.props.data.count})
        </div>;
    }
});
