var path = require('path');

var express = require('express');
var Logger = require('nedb-logger');
var platform = require('platform');
var moment = require('moment');

var config = require('../package.json').config;
var app = express();

var logger = new Logger({
    filename: path.join(process.cwd(), config.dbfile)
});

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

    logger.insert({
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
