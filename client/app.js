var _ = require('lodash');
var page = require('page');
var React = require('react');

var Reports = require('./reports');
var ErrorList = require('./component-error-list.jsx');
var BrowserList = require('./component-browser-list.jsx');

var ws = new SockJS('/ws');

ws.onmessage = function(e) {
    Reports.update(JSON.parse(e.data));
};

var extendCtx = function(params) {
    return function(ctx, next) {
        _.extend(ctx, params);
        next();
    };
};

var fetchReport = function(ctx, next) {
    Reports.fetch(ctx.report).done(next);
};

var render = function(selector, component) {
    return function(ctx, next) {
        React.renderComponent(
            component({data: Reports.get(ctx.report)}),
            document.querySelector(selector)
        );
        next();
    };
};

page('/',         extendCtx({report: 'messages'}), fetchReport, render('#app', ErrorList));
page('/browsers', extendCtx({report: 'browsers'}), fetchReport, render('#app', BrowserList));

$(page.start);
