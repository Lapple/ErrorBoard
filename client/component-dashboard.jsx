var React = require('react');

var Graph = require('./component-graph.jsx');

module.exports = React.createClass({
    render: function() {
        return <div className='dashboard'>
            <div className='title title_big'>
                Hourly errors in the last 4 days
            </div>
            <Graph data={ this.props.hourly.data } from={ this.props.hourly.from } to={ this.props.hourly.to } />
        </div>;
    }
});
