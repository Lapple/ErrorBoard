var _ = require('lodash');
var React = require('react');
var ErrorList = require('./component-error-list.jsx');

$(function() {
    var app = document.getElementById('app');

    var query = {};
    var _data = {};
    var ws = new SockJS('/ws');

    var grmsg = rdc({
        groupBy: 'message',
        init: {
            count: 0,
            browsers: []
        },
        step: function(row, item) {
            row.count += 1;

            if (!_.contains(row.browsers, item.ua.name)) {
                row.browsers.push(item.ua.name);
            }
        }
    });

    ws.onmessage = function(e) {
        grmsg(_data, JSON.parse(e.data));
        React.renderComponent(ErrorList({groups: _data}), app);
    };

    $.getJSON('/find', {query: JSON.stringify(query)}).done(function(response) {
        _data = _.reduce(response, grmsg, {});
        React.renderComponent(ErrorList({groups: _data}), app);
    });

    function rdc(params) {
        if (_.isString(params.groupBy)) {
            params.groupBy = prop(params.groupBy);
        }

        if (!_.isFunction(params.init)) {
            params.init = value(params.init);
        }

        return function(dataset, item) {
            var groupName = params.groupBy(item);
            var i = dataset[groupName];

            if (!i) {
                i = dataset[groupName] = _.clone(params.init(item));
            }

            params.step(i, item);
            return dataset;
        };
    }

    function prop(name) {
        return function(item) {
            return item[name];
        };
    }

    function value(v) {
        return function() { return v; };
    }
});
