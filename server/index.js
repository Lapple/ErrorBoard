var path = require('path');
var express = require('express');
var serveStaticFile = require('./middleware-static-file');

var app = express();
var publicPath = path.join(__dirname, '..', 'client/public');

app.use('/static', express.static(publicPath));
app.get('/data/:type', require('./route-data'));
app.get('/error', require('./route-logger'));
app.get('/*', serveStaticFile(path.join(publicPath, 'index.html')));

module.exports = app;
