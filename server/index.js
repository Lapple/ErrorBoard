var path = require('path');

var express = require('express');
var app = express();

app.use('/static', express.static(path.join(__dirname, '..', 'client/public')));
app.get('/error', require('./module-logger'));
app.get('/find', require('./module-finder'));
app.get('/', require('./module-serve-index'));

app.get('/messages', require('./module-messages'));

module.exports = app;
