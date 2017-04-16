var page = require('page');
var React = require('react');

var Nav = require('./component-nav.jsx');
var Dashboard = require('./component-dashboard.jsx');
var Report = require('./component-report.jsx');
var Details = require('./component-details.jsx');

var DETAIL_TYPES = {
    messages: 'message',
    browsers: 'browser',
    scripts: 'script',
    pages: 'page',
    meta: 'metagroup'
};

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            params: {},
            state: {}
        };
    },
    render: function() {
        return <div className='container'>
            <div className='menu'>
                <Nav pathname={ this.props.pathname } />
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
        if (this.props.params.type === 'dashboard') {
            return <Dashboard />;
        }

        return <Report type={ this.props.params.type } onClick={ this._showDetails } />;
    },
    renderDetails: function() {
        var params = this.props.params;
        var detailsType = DETAIL_TYPES[params.type];

        if (params.id) {
            var title = this.props.state.details;
            if (!title) {
                title = params.type === "messages" ?
                    JSON.parse(params.id)["message"] : params.id;
            }
            return <Details
                type={ detailsType }
                id={ params.id }
                title={ title }
                onClose={ this._hideDetails } />;
        }
    },
    _showDetails: function(data) {
        var url = '/' + this.props.params.type + '/' + encodeURIComponent(data.key) + '/';
        page.show(url, {details: data.title});
    },
    _hideDetails: function() {
        page.show('/' + this.props.params.type + '/');
    }
});
