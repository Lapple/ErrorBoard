var winston = require('winston')
  , MongoDB = require('winston-mongodb').MongoDB
  , config  = require('./../config/main').app
  , logger  = {};

winston
  .add( MongoDB, {
    db         : 'flatora_js'
  , collection : 'log'
  , safe       : false
  })
  .remove( winston.transports.Console );

logger.log = function( options ) {
  if (config.output.indexOf('console') !== -1) {
    console.log( options.console );
  }
  if (config.output.indexOf('database') !== -1) {
    winston.log( 'info', options.file );
  }
}

module.exports = logger;
