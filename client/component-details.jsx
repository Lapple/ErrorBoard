var _ = require('lodash');
var React = require('react');

var cx = React.addons.classSet;

var ReportItem = require('./component-report-item.jsx');
var ReporterMixin = require('./mixin-reporter');

module.exports = React.createClass({
    mixins: [ReporterMixin],
    getInitialState: function() {
        return {visible: false};
    },
    render: function() {
        var items = _.map(this.getReport(), function(data) {
            return ReportItem({
                key: data.key,
                type: this.props.type,
                data: data,
                timespan: false
            });
        }, this);

        var classes = cx({
            'curtain': true,
            'curtain_visible': this.state.visible
        });

        return <div className={ classes }>
            <span onClick={ this.props.onClose }>
                Close
            </span>
            <table className="report__table report__table_details">
                <tbody>{ items }</tbody>
            </table>
        </div>;
    },
    show: function() {
        this.setState({visible: true});
    },
    componentDidMount: function() {
        window.requestAnimationFrame(this.show);
    }
});
