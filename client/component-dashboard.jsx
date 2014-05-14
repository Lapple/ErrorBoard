var React = require('react');

var Reports = require('./reports');
var Graph = require('./component-graph.jsx');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            graph: {}
        };
    },
    render: function() {
        return <div className='dashboard'>
            <div className='title title_big'>
                Hourly errors in the last 4 days
            </div>
            <Graph data={ this.state.graph } from={ this.props.graph.from } to={ this.props.graph.to } />
        </div>;
    },
    componentDidMount: function() {
        Reports.fetch('hourly', this.props.graph).done(this.updateGraphData);
    },
    updateGraphData: function() {
        this.setState({
            graph: Reports.get('hourly', this.props.graph)
        });
    }
});
