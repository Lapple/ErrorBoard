var mongodb  = require('mongodb')
  , config   = require('./../config/main')
  , dbConfig = config.database
  , StatsProvider;

StatsProvider = function() {
  this.enabled = config.app.output.indexOf( 'database' ) !== -1;

  // `database` is included into the output options list
  if ( this.enabled ) {
    this.dbName         = dbConfig.name;
    this.collectionName = dbConfig.collection;
    this.db             = new mongodb.Db( this.dbName, new mongodb.Server( dbConfig.host, dbConfig.port, dbConfig.serverOptions ), dbConfig.collectionOptions )
      .open(function ( err, client ) {
        if ( err ) {
          console.error( 'Error: %s\nExiting.', err.message );
          process.exit();
        }
        this.collection = new mongodb.Collection( client, this.collectionName );
      }.bind( this ));

  // Database is not listed
  } else {
    console.log( 'Note: Errors are not being sent to the database' );
  }
};

StatsProvider.prototype.getErrorInfo = function( query, all, callback ) {
  if ( !this.enabled ) return;

  var condition = {
      'message.url'   :  query.file
    , 'message.line'  : +query.line
    },
    keys = {
      'message.agent.browser': true
    , 'message.agent.version': true
    };

  if ( query.error ) {
    condition['message.message'] = query.error;
  } else {
    keys['message.message'] = true;
  }

  if ( !all ) {
    condition['message.fixed'] = false;
  }

  this.collection.group(
    keys
  , condition
  , {
      'errSum'   : 0
    , 'latest'   : 0
    , 'earliest' : Date.now()
    , 'lifespan' : 0
    , 'fixed'    : true
    }
  , function ( obj, prev ) {
      prev.errSum++;
      prev.earliest = obj.timestamp < prev.earliest ? obj.timestamp : prev.earliest;
      prev.latest   = obj.timestamp > prev.latest ? obj.timestamp : prev.latest;
      prev.fixed    = obj.message.fixed === false ? false : prev.fixed;
    }
  , function ( obj ) {
      obj.lifespan = obj.latest - obj.earliest;
    }
  , true
  , function( err, docs ) {
      if ( err ) throw err;

      callback({
        browsers: docs.sort(function( a, b ) { return b.latest - a.latest })
      });
    }
  )
};

StatsProvider.prototype.getErrors = function( type, all, callback ) {
  if ( !this.enabled ) {
    return callback({
      databaseDisabled : true
    , all              : !!all
    , type             : type
    });
  }

  var settings  = {}
    , condition = {};

  if ( !all ) {
    condition['message.fixed'] = false;
  }

  switch (type) {
    case 'files':
      settings.keys  = { 'message.url': true, 'message.line': true };
      break;

    case 'browsers':
      settings.keys  = { 'message.agent.browser': true, 'message.agent.version': true };
      break;

    case 'pages':
      settings.keys  = { 'message.page': true };
      break;

    // case 'errors':
    default:
      settings.keys  = { 'message.message': true, 'message.url': true, 'message.line': true };
      break;
  }

  this.collection.group(
    settings.keys
  , condition
  , {
      'errSum'   : 0
    , 'latest'   : 0
    , 'hotness'  : 0
    , 'fixed'    : true
    , 'earliest' : Date.now()
    , 'browsers' : {}
    }
  , function ( obj, prev ) {
      prev.errSum++;
      prev.latest   = obj.timestamp > prev.latest   ? obj.timestamp : prev.latest;
      prev.earliest = obj.timestamp < prev.earliest ? obj.timestamp : prev.earliest;
      prev.fixed    = obj.message.fixed === false ? false : prev.fixed;
      prev.browsers[obj.message.agent.browser] = true;
    }
  , function ( obj ) {
      obj.hotness  = Date.now() - obj.latest;
    }
  , true
  , function( err, docs ) {
      if ( err ) throw err;

      callback({
        title  : settings.title
      , type   : type
      , all    : !!all
      , fields : docs.sort(function( a, b ) {
          return b.latest - a.latest;
        })
      });
    }
  );
};

StatsProvider.prototype.fixError = function( query ) {
  if ( !this.enabled ) return;

  var condition = {
    'message.url'  :  query.file
  , 'message.line' : +query.line
  };

  if ( query.error ) {
    condition['message.message'] = query.error;
  }

  this.collection.update(
    condition
  , { $set: { 'message.fixed': true } }
  , { multi: true }
  );
};

StatsProvider.prototype.clearAll = function() {
  this.collection.remove();
};

module.exports = StatsProvider;

