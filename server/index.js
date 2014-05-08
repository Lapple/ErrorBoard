var express = require('express');
var app = express();

app.all('/error', require('./logger'));
app.get('/find', require('./finder'));

module.exports = app;
