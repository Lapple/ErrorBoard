var _ = require('lodash');
var page = require('page');
var React = require('react');

var Reports = require('./reports');
var Regions = require('./regions');

var ComponentErrorList = require('./component-error-list.jsx');
var ComponentBrowserList = require('./component-browser-list.jsx');

var ws = new SockJS('/ws');

ws.onmessage = function(e) {
    Reports.update(JSON.parse(e.data));
    Regions.update();
};

var fetchReport = function(type) {
    return function(ctx, next) {
        Reports.fetch(type).done(next);
    };
};

var renderRegion = function(selector, Component, props) {
    return function(ctx, next) {
        Regions.render(selector, Component, props);
        next();
    };
};

page('/',
    fetchReport('messages'),
    renderRegion('#app', ComponentErrorList, _.partial(Reports.get, 'messages'))
);

page('/browsers',
    fetchReport('browsers'),
    renderRegion('#app', ComponentBrowserList, _.partial(Reports.get, 'browsers'))
);

$(page.start);
