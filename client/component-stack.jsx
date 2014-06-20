var React = require('react');

module.exports = React.createClass({
    render: function() {
        return <div className='stack'>
            { this.props.data }
        </div>;
    }
});
