var express = require('express');
var platform = require('platform');
var moment = require('moment');

var config = require('../package.json').config;
var db = require('./database');
var app = express();

app.use(function(req, res) {
    var query = req.query;
    var end = res.end.bind(res);

    if (!query.message || !query.url) {
        return end(400);
    }

    var ua = platform.parse(req.headers['user-agent']);
    var referer = req.headers.referer;
    var timestamp = Date.now();
    var date = moment(timestamp).format('DD-MM-YYYY');

    db.insert({
        ua: ua,
        referer: referer,
        timestamp: timestamp,
        date: date,

        message: query.message,
        url: query.url,
        line: query.line
    }, end);
});

module.exports = app;
