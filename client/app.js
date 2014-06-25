var _ = require('lodash');
var page = require('page');
var React = require('react');

var Reports = require('./reports');
var ComponentApp = require('./component-app.jsx');

var ws = new SockJS('/ws');

ws.onmessage = function(e) {
    Reports.update(JSON.parse(e.data));
    updateApp();
};

var redirectTo = function(url) {
    return _.defer.bind(_, page, url);
};

var _context;
var updateApp = function(ctx) {
    var app = document.getElementById('app');

    if (ctx) {
        _context = ctx;
    }

    var props = {
        state: _context.state,
        params: _context.params,
        pathname: _context.pathname
    };

    React.renderComponent(ComponentApp(props), app);
};

page('/', redirectTo('/messages/'));
page('/:type/:id?', updateApp);

document.addEventListener('DOMContentLoaded', page.start);
