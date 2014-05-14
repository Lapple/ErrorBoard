var page = require('page');
var slug = require('speakingurl');
var React = require('react');
var moment = require('moment');

var Nav = require('./component-nav.jsx');
var Dashboard = require('./component-dashboard.jsx');
var Report = require('./component-report.jsx');
var Details = require('./component-details.jsx');

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            graphs: {
                from: moment().startOf('hour').subtract('days', 4).valueOf(),
                to: moment().endOf('hour').valueOf()
            }
        };
    },
    render: function() {
        return <div className='container'>
            <div className='menu'>
                <Nav pathname={ this.props.ctx.pathname } />
            </div>
            <div className='content'>
                { this.renderMain() }
                <div className="screen">
                    { this.renderDetails() }
                </div>
            </div>
        </div>;
    },
    renderMain: function() {
        if (this.props.ctx.params.type === 'dashboard') {
            return <Dashboard graph={ this.props.graphs } />;
        }

        return <Report type={ this.props.ctx.params.type } onClick={ this._showDetails } />;
    },
    renderDetails: function() {
        var ctx = this.props.ctx;
        var detailsType = ctx.params.type.slice(0, -1);

        if (ctx.params.id) {
            return Details({
                type: detailsType,
                id: ctx.params.id,
                title: ctx.state.details || null,
                graph: this.props.graphs,
                onClose: this._hideDetails
            });
        }
    },
    _showDetails: function(data) {
        var url = '/' + this.props.ctx.params.type + '/' + slug(data.key) + '/';
        page.show(url, {details: data.key});
    },
    _hideDetails: function() {
        page.show('/' + this.props.ctx.params.type + '/');
    }
});
