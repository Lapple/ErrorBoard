var page = require('page');
var React = require('react');

var Reports = require('./reports');
var App = require('./component-app.jsx');
var app = React.createFactory(App);

var _context;
var updateApp = function(ctx) {
    var rootNode = document.getElementById('app');

    if (ctx) {
        _context = ctx;
    }

    var props = {
        state: _context.state,
        params: _context.params,
        pathname: _context.pathname
    };

    React.renderComponent(app(props), rootNode);
};

page('/:type/:id?', updateApp);

document.addEventListener('DOMContentLoaded', page.start);

// Establish Websocket connection.
try {
    var ws = new SockJS('/ws');

    ws.onmessage = function(e) {
        Reports.update(JSON.parse(e.data));
        updateApp();
    };
} catch (e) {
    // TODO: Add SockJS fail notification.
}
