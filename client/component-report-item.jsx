var React = require('react');

module.exports = React.createClass({
    render: function() {
        var browsers = this.props.data.browsers || [];

        return <div>
            <b>{this.props.title}</b>
            &nbsp;
            ({this.props.data.count}) {browsers.join(', ')}
        </div>;
    }
});
