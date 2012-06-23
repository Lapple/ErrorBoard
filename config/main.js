/*
 * Main configuration file
 */

module.exports = {

  database: {
    name       : 'flatora_js'
  , collection : 'log'
  , host       : '127.0.0.1'
  , port       : 27017
    // Optional options for insert command
    // http://mongodb.github.com/node-mongodb-native/api-generated/server.html#Server
  , serverOptions: {}
    // Additional options for the collection
    // http://mongodb.github.com/node-mongodb-native/api-generated/db.html#Db
  , collectionOptions: {}
  }

  // App settings
, app: {
    // host: '127.0.0.1'
    port: 3000
  , output: [
      'console'
    , 'database'
    ]
  }

  // The website that is being observed by the ErrorBoard
, observedSite: {
    title : 'Flatora'
  , url   : 'http://local.flatora.ru/'
  }

};
