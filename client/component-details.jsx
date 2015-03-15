var _ = require('lodash');
var React = require('react/addons');
var moment = require('moment');

var cx = React.addons.classSet;

var Reports = require('./reports');
var Stack = require('./component-stack.jsx');
var Graph = require('./component-graph.jsx');
var ReportItem = require('./component-report-item.jsx');

module.exports = React.createClass({
    getInitialState: function() {
        var state = {
            visible: false,
            data: {}
        };

        if (this.hasGraph(this.props)) {
            state.graphData = {};
            state.from = moment().startOf('hour').subtract(4, 'days').valueOf();
            state.to = Date.now();
        }

        return state;
    },
    render: function() {
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
            { this.renderTitle() }
            { this.renderStackTrace() }
            { this.renderTable() }
            { this.renderGraph() }
        </div>;
    },
    renderTitle: function() {
        if (this.props.title) {
            return <div className='title'>
                { this.props.title }
            </div>;
        } else {
            return <div className='title title_muted'>
                No title
            </div>;
        }
    },
    renderStackTrace: function() {
        if (this.props.type === 'message') {
            var sample = _.first(this.state.data);

            if (sample) {
                if (sample.stack) {
                    return <Stack data={ sample.stack } />;
                } else if (sample.line && sample.url) {
                    return <Stack data={ sample.url + ':' + sample.line } />;
                }
            }
        }
    },
    renderGraph: function() {
        if (this.hasGraph(this.props)) {
            return <div className='curtain__graph'>
                <Graph
                    data={ this.state.graphData }
                    from={ this.state.from }
                    to={ this.state.to }
                    height={ 200 } />
            </div>
        }
    },
    renderTable: function() {
        var items = _.map(this.state.data, function(data) {
            return <ReportItem
                key={ data.key }
                type={ (this.props.type === 'message') ? 'browsers' : 'messages' }
                data={ data }
                timespan={ false } />;
        }, this);

        return <div className="curtain__table">
          <table className="report__table report__table_details">
            <tbody>{ items }</tbody>
          </table>
        </div>;
    },
    onKeyUp: function(e) {
        if (e && e.keyCode === 27) {
            this.props.onClose();
        }
    },
    show: function() {
        this.setState({visible: true});
    },
    componentDidMount: function() {
        window.requestAnimationFrame(this.show);
        document.addEventListener('keyup', this.onKeyUp);

        this.fetchData(this.props);
    },
    componentWillReceiveProps: function(props) {
        this.fetchData(props);
    },
    componentWillUnmount: function() {
        document.removeEventListener('keyup', this.onKeyUp);
    },
    updateData: function() {
        var report = Reports.get(this.props.type, {id: this.props.id});

        this.setState({
            data: toArray(report).sort(sortByLatestReport)
        });
    },
    updateGraph: function() {
        this.setState({
            graphData: Reports.get('hourly', {
                from: this.state.from,
                to: this.state.to,
                message: this.props.id
            })
        });
    },
    fetchData: function(props) {
        Reports.fetch(props.type, {id: props.id}).done(this.updateData);

        if (this.hasGraph(props)) {
            Reports.fetch('hourly', {
                from: this.state.from,
                to: this.state.to,
                message: props.id
            }).done(this.updateGraph);
        }
    },
    hasGraph: function(props) {
        return props.type === 'message';
    }
});

function toArray(object) {
    return _.map(object, function(value, key) {
        return _.extend(_.clone(value), {key: key});
    });
}

function sortByLatestReport(a, b) {
    return b.latest - a.latest;
}
