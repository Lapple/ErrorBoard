var _ = require('lodash');
var page = require('page');
var React = require('react');
var moment = require('moment');

var Reports = require('./reports');
var Regions = require('./regions');

var ComponentNav = require('./component-nav.jsx');
var ComponentReport = require('./component-report.jsx');
var ComponentDetails = require('./component-details.jsx');
var ComponentDashboard = require('./component-dashboard.jsx');

var ws = new SockJS('/ws');

ws.onmessage = function(e) {
    Reports.update(JSON.parse(e.data));
    Regions.update();
};

var renderRegion = function(selector, Component, props) {
    return function(ctx, next) {
        var p = _.isFunction(props) ? props(ctx) : props;
        Regions.render(selector, Component, p);
        ctx.regions.push(selector);
        next();
    };
};

var setTimespan = function(from, to) {
    return function(ctx, next) {
        ctx.params.timespan = {
            from: from || moment().startOf('hour').subtract('days', 4).valueOf(),
            to: to || moment().endOf('hour').valueOf()
        };
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

page('/', redirectTo('/dashboard/'));

page('*',
    beforeRun,
    renderRegion('#nav', ComponentNav, function(ctx) {
        return { pathname: ctx.pathname };
    })
);

page('/dashboard/',
    setTimespan(),
    function(ctx, next) {
        Reports.fetch('hourly', ctx.params.timespan).always(next);
    },
    renderRegion('#main', ComponentDashboard, function(ctx) {
        var timespan = ctx.params.timespan;

        return {
            hourly: {
                from: timespan.from,
                to: timespan.to,
                data: Reports.get('hourly', timespan)
            }
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
    renderRegion('#main', ComponentReport, function(ctx) {
        return {
            data: Reports.get(ctx.params.type),
            type: ctx.params.type
        };
    })
);

page('/:type/:id/',
    setTimespan(),
    function(ctx, next) {
        ctx.params.detailsType = ctx.params.type.slice(0, -1);
        next();
    },
    function(ctx, next) {
        Reports.fetch(ctx.params.detailsType, {id: ctx.params.id}).always(next);
    },
    function(ctx, next) {
        if (ctx.params.detailsType === 'message') {
            Reports.fetch('hourly', {
                from: ctx.params.timespan.from,
                to: ctx.params.timespan.to,
                message: ctx.params.id
            }).always(next);
        } else {
            next();
        }
    },
    renderRegion('#details', ComponentDetails, function(ctx) {
        var type = ctx.params.detailsType;
        var timespan = ctx.params.timespan;

        var props = {
            title: ctx.state.details || null,
            data: Reports.get(type, {id: ctx.params.id}),
            type: 'messages',
            onClose: function() {
                page.show('/' + ctx.params.type + '/');
            }
        };

        var graphReport;

        if (type === 'message') {
            props.type = 'browser';

            graphReport = Reports.get('hourly', {
                from: timespan.from,
                to: timespan.to,
                message: ctx.params.id
            });

            if (!_.isEmpty(graphReport)) {
                props.graph = {
                    from: timespan.from,
                    to: timespan.to,
                    data: graphReport
                };
            }
        }

        return props;
    })
);

page('*', afterRun);

$(page.start);
