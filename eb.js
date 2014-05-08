var http = require('http');

var config = require('./package.json').config;
var server = http.createServer(require('./server'));
var ws = require('./server/websockets');

ws.installHandlers(server, {prefix: '/ws'});
server.listen(config.port);

console.log('Listening on port %s', config.port);
