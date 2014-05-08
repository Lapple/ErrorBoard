var express = require('express');
var NeDB = require('nedb');

var config = require('../package.json').config;
var queryParser = require('./middleware-query-parser');
var app = express();

var db = new NeDB({
    filename: config.dbfile,
    autoload: true
});

app.use(queryParser('query', 'dbquery'));

app.use(function(req, res) {
    db.find(req.dbquery, function(err, docs) {
        if (err) {
            return res.json(400, { error: err });
        } else {
            return res.json(docs);
        }
    });
});

module.exports = app;
