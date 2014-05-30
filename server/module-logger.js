var express = require('express');
var useragent = require('useragent');
var moment = require('moment');

var config = require('../package.json').config;
var db = require('./database');
var ws = require('./websockets');
var app = express();

app.use(function(req, res) {
    var query = req.query;

    if (!query.message || !query.url) {
        return res.end(400);
    }

    var ua = useragent.parse(req.headers['user-agent']).toJSON();
    var referer = req.headers.referer;
    var timestamp = Date.now();
    var date = moment(timestamp).format('DD-MM-YYYY');

    var doc = {
        ua: ua,
        referer: referer,
        timestamp: timestamp,
        date: date,

        message: query.message,
        url: query.url,
        line: query.line,
        column: query.column,
        stack: query.stack
    };

    db.insert(doc, function(err) {
        if (err) {
            return res.end(500);
        }

        try {
            ws.broadcast(JSON.stringify(doc));
        } catch(e) {}

        res.end();
    });
});

module.exports = app;
