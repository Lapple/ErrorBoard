var http = require('http');
var path = require('path');

var express = require('express');
var favicon = require('serve-favicon');

var ws = require('./websockets');
var serveStaticFile = require('./middleware-static-file');

var app = express();
var server = http.createServer(app);

var publicPath = path.join(__dirname, '..', 'client/public');

app.set('view engine', 'ejs');
app.set('views', __dirname);

app.use(favicon(path.join(publicPath, 'favicon.ico')));
app.use('/static', express.static(publicPath));
app.get('/reports/:type', require('./route-reports'));
app.get('/error', require('./module-logger'));

// TODO: Remove.
app.get('/fake', serveStaticFile(path.join(publicPath, 'fake.html')));

app.get('/:type/:id?', require('./route-index'));

ws.installHandlers(server, {prefix: '/ws'});

module.exports = server;
