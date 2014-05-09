var _ = require('lodash');
var page = require('page');
var React = require('react');

var Reports = require('./reports');
var Regions = require('./regions');

var ComponentNav = require('./component-nav.jsx');
var ComponentReportList = require('./component-report-list.jsx');
var ComponentBrowserList = require('./component-browser-list.jsx');

var ws = new SockJS('/ws');

ws.onmessage = function(e) {
    Reports.update(JSON.parse(e.data));
    Regions.update('#reports');
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

var redirectTo = function(url) {
    return function() {
        _.defer(page, url);
    };
};

page('/',
    redirectTo('/messages')
);

page('/messages',
    fetchReport('messages'),
    renderRegion('#reports', ComponentReportList, _.partial(Reports.get, 'messages'))
);

page('/browsers',
    fetchReport('browsers'),
    renderRegion('#reports', ComponentBrowserList, _.partial(Reports.get, 'browsers'))
);

page('/scripts',
    fetchReport('scripts'),
    renderRegion('#reports', ComponentReportList, _.partial(Reports.get, 'scripts'))
);

page('/pages',
    fetchReport('pages'),
    renderRegion('#reports', ComponentReportList, _.partial(Reports.get, 'pages'))
);

page('*',
    renderRegion('#nav', ComponentNav, function() {
        return { pathname: location.pathname };
    })
);

$(page.start);
