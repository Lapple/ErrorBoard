var React = require('react');

var aggregateMessages = require('../common/aggregator-messages');
var ErrorList = require('./component-error-list.jsx');

$(function() {
    var app = document.getElementById('app');

    var data = {};
    var ws = new SockJS('/ws');

    var onDataChanged = function() {
        React.renderComponent(ErrorList({groups: data}), app);
    };

    ws.onmessage = function(e) {
        data = aggregateMessages(data, JSON.parse(e.data));
        onDataChanged();
    };

    $.getJSON('/messages').done(function(response) {
        data = response;
        onDataChanged();
    });

    onDataChanged();
});
