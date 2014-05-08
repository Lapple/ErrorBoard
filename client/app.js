var _ = require('lodash');
var React = require('react');

var aggregate = require('../common/aggregate');
var ErrorList = require('./component-error-list.jsx');

$(function() {
    var app = document.getElementById('app');

    var query = {};
    var data = {};
    var ws = new SockJS('/ws');

    var agg = aggregate({
        groupBy: 'message',
        init: {
            count: 0,
            browsers: []
        },
        step: function(obj, next) {
            obj.count += 1;

            if (!_.contains(obj.browsers, next.ua.name)) {
                obj.browsers.push(next.ua.name);
            }
        }
    });

    ws.onmessage = function(e) {
        agg(data, JSON.parse(e.data));
        React.renderComponent(ErrorList({groups: data}), app);
    };

    $.getJSON('/find', {query: JSON.stringify(query)}).done(function(response) {
        data = _.reduce(response, agg, {});
        React.renderComponent(ErrorList({groups: data}), app);
    });
});
