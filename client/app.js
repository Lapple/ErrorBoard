var _ = require('lodash');
var page = require('page');
var React = require('react');

var Reports = require('./reports');
var Regions = require('./regions');

var ComponentNav = require('./component-nav.jsx');
var ComponentReportList = require('./component-report-list.jsx');
var ComponentDetails = require('./component-details.jsx');

var ws = new SockJS('/ws');

ws.onmessage = function(e) {
    Reports.update(JSON.parse(e.data));
    Regions.update(['#reports', '#details']);
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

page('*',
    beforeRun,
    renderRegion('#nav', ComponentNav, function(ctx) {
        return { pathname: ctx.pathname };
    })
);

page('/:type/*',
    function(ctx, next) {
        Reports.fetch(ctx.params.type).always(next);
    },
    renderRegion('#reports', ComponentReportList, function(ctx) {
        return {
            data: Reports.get(ctx.params.type),
            type: ctx.params.type
        };
    })
);

page('/:type/:id/',
    function(ctx, next) {
        ctx.params.detailsType = ctx.params.type.slice(0, -1);
        next();
    },
    function(ctx, next) {
        Reports.fetch(ctx.params.detailsType, {id: ctx.params.id}).always(next);
    },
    renderRegion('#details', ComponentDetails, function(ctx) {
        var type = ctx.params.detailsType;
        var displayType = 'messages';

        if (type === 'message') {
            displayType = 'browser';
        }

        return {
            data: Reports.get(type, {id: ctx.params.id}),
            type: displayType,
            onClose: function() {
                page('/' + ctx.params.type + '/');
            }
        };
    })
);

page('*', afterRun);

$(page.start);
