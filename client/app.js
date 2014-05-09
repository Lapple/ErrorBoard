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
    Regions.update(['#reports', '#details']);
};

var fetchReport = function(type, params) {
    return function(ctx, next) {
        var p = _.isFunction(params) ? params(ctx) : params;
        Reports.fetch(type, p).always(next);
    };
};

var renderRegion = function(selector, Component, props) {
    return function(ctx, next) {
        var p = _.isFunction(props) ? props(ctx) : props;
        Regions.render(selector, Component, p);
        next();
    };
};

var redirectTo = function(url) {
    return function() {
        _.defer(page, url);
    };
};

page('/',
    redirectTo('/messages/')
);

page('/messages/',
    fetchReport('messages'),
    renderRegion('#reports', ComponentReportList, _.partial(Reports.get, 'messages', null))
);

page('/browsers/*',
    fetchReport('browsers'),
    renderRegion('#reports', ComponentBrowserList, _.partial(Reports.get, 'browsers', null))
);

page('/browsers/:id/',
    fetchReport('browser', function(ctx) {
        return {id: ctx.params.id};
    }),
    renderRegion('#details', ComponentReportList, function(ctx) {
        return Reports.get('browser', {id: ctx.params.id});
    })
);

page('/scripts/',
    fetchReport('scripts'),
    renderRegion('#reports', ComponentReportList, _.partial(Reports.get, 'scripts', null))
);

page('/pages/',
    fetchReport('pages'),
    renderRegion('#reports', ComponentReportList, _.partial(Reports.get, 'pages', null))
);

page('*',
    renderRegion('#nav', ComponentNav, function() {
        return { pathname: location.pathname };
    })
);

$(page.start);
