var React = require('react');

var aggregateMessages = require('../common/aggregator-messages');
var ErrorList = require('./component-error-list.jsx');

$(function() {
    var app = document.getElementById('app');

    var data = {};
    var ws = new SockJS('/ws');

    ws.onmessage = function(e) {
        aggregateMessages(data, JSON.parse(e.data));
        React.renderComponent(ErrorList({groups: data}), app);
    };

    $.getJSON('/messages').done(function(response) {
        data = response;
        React.renderComponent(ErrorList({groups: data}), app);
    });
});
