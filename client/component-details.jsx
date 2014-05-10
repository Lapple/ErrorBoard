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
            <div onClick={ this.props.onClose } className='curtain__close'>
                <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'>
                    <path fill='#777' d='M15 1.7l-.7-.7-6.3 6.299-6.3-6.299-.7.7 6.3 6.3-6.3 6.299.7.701 6.3-6.3 6.3 6.3.7-.701-6.3-6.299 6.3-6.3z'/>
                </svg>
            </div>
            { this.title() }
            <table className="report__table report__table_details">
                <tbody>{ items }</tbody>
            </table>
        </div>;
    },
    title: function() {
        if (this.props.title) {
            return <div className='title'>
                { this.props.title }
            </div>;
        } else {
            return <div className='curtain__title curtain__title_muted'>
                No title
            </div>;
        }
    },
    show: function() {
        this.setState({visible: true});
    },
    componentDidMount: function() {
        window.requestAnimationFrame(this.show);
    }
});
