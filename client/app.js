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

    React.renderComponent(ComponentApp({ctx: _context}), app);
};

page('/', redirectTo('/dashboard/'));
page('/:type/:id?', updateApp);

document.addEventListener('DOMContentLoaded', page.start);
