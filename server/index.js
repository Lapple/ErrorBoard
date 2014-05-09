var http = require('http');
var path = require('path');

var express = require('express');

var ws = require('./websockets');
var serveStaticFile = require('./middleware-static-file');

var app = express();
var server = http.createServer(app);

var publicPath = path.join(__dirname, '..', 'client/public');

app.use('/static', express.static(publicPath));
app.get('/reports/:type', require('./route-reports'));
app.get('/error', require('./module-logger'));
app.get('/*', serveStaticFile(path.join(publicPath, 'index.html')));

ws.installHandlers(server, {prefix: '/ws'});

module.exports = server;
