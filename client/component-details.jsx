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
            showingMeta: false,
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
            { this.renderTabs() }
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
    renderTabs: function() {
        if (this.props.type === 'metagroup') {
            return null;
        }

        return <div className='tabs'>
            <button
                type='button'
                className={
                    cx({
                        'tabs__item': true,
                        'tabs__item_active': !this.state.showingMeta
                    })
                }
                onClick={ this.toggleMeta.bind(this, false) }>
                { this.props.type === 'message' ? 'Browsers' : 'Messages' }
            </button>
            <button
                type='button'
                className={
                    cx({
                        'tabs__item': true,
                        'tabs__item_active': this.state.showingMeta
                    })
                }
                onClick={ this.toggleMeta.bind(this, true) }>
                Metadata
            </button>
        </div>;
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
        var isShowingBrowsersBreakdown = (
            this.props.type === 'message' &&
            !this.state.showingMeta
        );

        var items = _.map(this.state.data, function(data) {
            return <ReportItem
                key={ data.key }
                type={ isShowingBrowsersBreakdown ? 'browsers' : 'messages' }
                data={ data }
                timespan={ false } />;
        }, this);

        if (items.length === 0) {
            items = <tr>
                <td colSpan='4' className='report__cell report__cell_single'>
                    Nothing to display
                </td>
            </tr>;
        }

        return <table className="report__table report__table_details">
            <tbody>{ items }</tbody>
        </table>;
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

        this.fetchData(this.props, this.state.showingMeta);
    },
    componentWillReceiveProps: function(props) {
        if (props.type === 'metagroup') {
            this.toggleMeta(false);
        }
    },
    componentWillUpdate: function(props, state) {
        var shouldFetchData = (
            props !== this.props ||
            state.showingMeta !== this.state.showingMeta
        );

        if (shouldFetchData) {
            this.fetchData(props, state.showingMeta);
        }
    },
    componentWillUnmount: function() {
        document.removeEventListener('keyup', this.onKeyUp);
    },
    updateData: function() {
        var report = Reports.get(this.props.type, {
            id: this.props.id,
            meta: this.state.showingMeta
        });

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
    fetchData: function(props, isShowingMeta) {
        Reports.fetch(props.type, {
            id: props.id,
            meta: isShowingMeta
        }).done(this.updateData);

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
    },
    toggleMeta: function(isShowingMeta) {
        this.setState({showingMeta: isShowingMeta});
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
