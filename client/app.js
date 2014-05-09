var _ = require('lodash');
var page = require('page');
var React = require('react');

var Reports = require('./reports');
var Regions = require('./regions');

var ComponentNav = require('./component-nav.jsx');
var ComponentReportList = require('./component-report-list.jsx');

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
        ctx.regions.push(selector);
        next();
    };
};

var redirectTo = function(url) {
    return function() {
        _.defer(page, url);
    };
};

var beforeRun = function(ctx, next) {
    ctx.regions = [];
    next();
};

var afterRun = function(ctx) {
    Regions.cleanup(_.difference(Regions.list(), ctx.regions));
};

page('/', redirectTo('/messages/'));

page('*', beforeRun);

page('/messages/*',
    fetchReport('messages'),
    renderRegion('#reports', ComponentReportList, function(ctx) {
        return {
            data: Reports.get('messages'),
            type: 'messages'
        };
    })
);

page('/browsers/*',
    fetchReport('browsers'),
    renderRegion('#reports', ComponentReportList, function(ctx) {
        return {
            data: Reports.get('browsers'),
            type: 'browsers'
        };
    })
);

page('/scripts/*',
    fetchReport('scripts'),
    renderRegion('#reports', ComponentReportList, function(ctx) {
        return {
            data: Reports.get('scripts'),
            type: 'scripts'
        };
    })
);

page('/pages/*',
    fetchReport('pages'),
    renderRegion('#reports', ComponentReportList, function(ctx) {
        return {
            data: Reports.get('pages'),
            type: 'pages'
        };
    })
);

page('/messages/:id/',
    fetchReport('message', function(ctx) {
        return {id: ctx.params.id};
    }),
    renderRegion('#details', ComponentReportList, function(ctx) {
        return {
            data: Reports.get('message', {id: ctx.params.id}),
            type: 'browser'
        };
    })
);

page('/browsers/:id/',
    fetchReport('browser', function(ctx) {
        return {id: ctx.params.id};
    }),
    renderRegion('#details', ComponentReportList, function(ctx) {
        return {
            data: Reports.get('browser', {id: ctx.params.id}),
            type: 'messages'
        };
    })
);

page('/scripts/:id/',
    fetchReport('script', function(ctx) {
        return {id: ctx.params.id};
    }),
    renderRegion('#details', ComponentReportList, function(ctx) {
        return {
            data: Reports.get('script', {id: ctx.params.id}),
            type: 'messages'
        };
    })
);

page('/pages/:id/',
    fetchReport('page', function(ctx) {
        return {id: ctx.params.id};
    }),
    renderRegion('#details', ComponentReportList, function(ctx) {
        return {
            data: Reports.get('page', {id: ctx.params.id}),
            type: 'messages'
        };
    })
);

page('*',
    renderRegion('#nav', ComponentNav, function() {
        return { pathname: location.pathname };
    })
);

page('*', afterRun);

$(page.start);
