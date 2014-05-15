var React = require('react');
var moment = require('moment');

var Reports = require('./reports');
var Graph = require('./component-graph.jsx');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            from: moment().startOf('hour').subtract('days', 4).valueOf(),
            to: Date.now(),
            hourly: {}
        };
    },
    render: function() {
        return <div className='dashboard'>
            <div className='title title_big'>
                Hourly errors in the last 4 days
            </div>
            <Graph data={ this.state.hourly } from={ this.state.from } to={ this.state.to } />
        </div>;
    },
    componentDidMount: function() {
        Reports.fetch('hourly', this._getReportParams()).done(this.updateGraphData);
    },
    updateGraphData: function() {
        this.setState({
            hourly: Reports.get('hourly', this._getReportParams())
        });
    },
    _getReportParams: function() {
        return {
            from: this.state.from,
            to: this.state.to
        };
    },
});
