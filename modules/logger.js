var winston = require('winston')
  , MongoDB = require('winston-mongodb').MongoDB
  , config  = require('./../config/main')
  , logger  = {};

winston
  .add( MongoDB, {
    db         : config.database.name
  , collection : config.database.collection
  , host       : config.database.host
  , port       : config.database.port
  , safe       : false
  })
  .remove( winston.transports.Console );

logger.log = function( options ) {
  if (config.app.output.indexOf('console') !== -1) {
    console.log( options.console );
  }
  if (config.app.output.indexOf('database') !== -1) {
    winston.log( 'info', options.file );
  }
}

module.exports = logger;
