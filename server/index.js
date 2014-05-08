var express = require('express');
var app = express();

app.all('/error', require('./module-logger'));
app.get('/find', require('./module-finder'));

module.exports = app;
