var _ = require('lodash');
var page = require('page');
var React = require('react');
var moment = require('moment');

var Reports = require('./reports');
var Regions = require('./regions');

var ComponentNav = require('./component-nav.jsx');
var ComponentReport = require('./component-report.jsx');
var ComponentDetails = require('./component-details.jsx');
var ComponentGraph = require('./component-graph.jsx');

var ws = new SockJS('/ws');

ws.onmessage = function(e) {
    Reports.update(JSON.parse(e.data));
    Regions.update(['#reports', '#details', '#graph']);
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
    return _.defer.bind(_, page, url);
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

page('/graph/',
    function(ctx, next) {
        var timespan = {
            from: moment().startOf('hour').subtract('days', 7).valueOf(),
            to: moment().endOf('hour').valueOf()
        };

        ctx.params.timespan = timespan;
        Reports.fetch('hourly', timespan).always(next);
    },
    renderRegion('#graph', ComponentGraph, function(ctx) {
        var timespan = ctx.params.timespan;

        return {
            from: timespan.from,
            to: timespan.to,
            data: Reports.get('hourly', timespan)
        };
    })
);

page(/^\/(messages|browsers|scripts|pages)\/.*/,
    function(ctx, next) {
        ctx.params.type = ctx.params[2];
        next();
    },
    function(ctx, next) {
        Reports.fetch(ctx.params.type).always(next);
    },
    renderRegion('#reports', ComponentReport, function(ctx) {
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
            title: ctx.state.details || null,
            data: Reports.get(type, {id: ctx.params.id}),
            type: displayType,
            onClose: function() {
                page.show('/' + ctx.params.type + '/');
            }
        };
    })
);

page('*', afterRun);

$(page.start);
