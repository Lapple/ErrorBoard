var _ = require('lodash');
var express = require('express');

var db = require('./database');
var queryParser = require('./middleware-query-parser');
var app = express();

var aggregateMessages = require('../common/aggregator-messages');

app.use(function(req, res) {
    db.find(req.dbquery, function(err, docs) {
        if (err) {
            return res.json(400, { error: err });
        } else {
            return res.json(_.reduce(docs, aggregateMessages, {}));
        }
    });
});

module.exports = app;
