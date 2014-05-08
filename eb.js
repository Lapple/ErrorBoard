var config = require('./package.json').config;
var server = require('./server');

server.listen(config.port);
console.log('Listening on port %s', config.port);
