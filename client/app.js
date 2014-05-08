var _ = require('lodash');
var React = require('react');
var ErrorList = require('./component-error-list.jsx');

$(function() {
    var app = document.getElementById('app');
    var query = {};

    $.getJSON('/find', {query: JSON.stringify(query)}).done(function(data) {
        var reduction = _.reduce(data, function(memo, item) {
            var i = memo[item.message];

            if (!i) {
                i = memo[item.message] = {
                    count: 0,
                    browsers: []
                };
            }

            i.count += 1;

            if (i.browsers.indexOf(item.ua.name) === -1) {
                i.browsers.push(item.ua.name);
            }

            return memo;
        }, {});

        React.renderComponent(ErrorList({groups: reduction}), app);
    });
});
