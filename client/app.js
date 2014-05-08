var _ = require('lodash');
var page = require('page');
var React = require('react');

var data = require('./data');
var ErrorList = require('./component-error-list.jsx');
var BrowserList = require('./component-browser-list.jsx');

var extendCtx = function(params) {
    return function(ctx, next) {
        _.extend(ctx, params);
        next();
    };
};

var load = function(ctx, next) {
    data.fetch(ctx.type).done(next);
};

var render = function(selector, component) {
    return function(ctx, next) {
        React.renderComponent(
            component({data: data.get(ctx.type)}),
            document.querySelector(selector)
        );
        next();
    };
};

page('/',         extendCtx({type: 'messages'}), load, render('#app', ErrorList));
page('/browsers', extendCtx({type: 'browsers'}), load, render('#app', BrowserList));

$(page.start);

var ws = new SockJS('/ws');

ws.onmessage = function(e) {
    data.update(JSON.parse(e.data));
    // React.renderComponent(ErrorList({data: data.get('messages')}), app);
};
