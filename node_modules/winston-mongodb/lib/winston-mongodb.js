/*
 * mongodb.js: Transport for outputting to a MongoDB database
 *
 * (C) 2010 Charlie Robbins, Kendrick Taylor
 * MIT LICENCE
 *
 */

var util = require('util');
var mongodb = require('mongodb');
var winston = require('winston');
var common = require('winston/lib/winston/common');
var Stream = require('stream').Stream;

//
// ### function MongoDB (options)
// Constructor for the MongoDB transport object.
//
var MongoDB = exports.MongoDB = function (options) {
  options = options || {};

  if (!options.db) {
    throw new Error("Cannot log to MongoDB without database name.");
  }

  var self = this;

  this.name         = 'mongodb';
  this.db           = options.db;
  this.host         = options.host || 'localhost';
  this.port         = options.port || mongodb.Connection.DEFAULT_PORT;
  this.collection   = options.collection || 'log';
  this.safe         = options.safe || true;
  this.level        = options.level || 'info';
  this.silent       = options.silent || false;
  this.username     = options.username || null;
  this.password     = options.password || null;
  this.errorTimeout = options.errorTimeout || 10000;
  this.capped       = options.capped;
  this.cappedSize   = options.cappedSize || 10000000;
  // TODO: possibly go by docs (`max`) instead
  // this.length       = options.length    || 200;

  if (options.keepAlive !== true) {
    //
    // Backward compatibility for timeout delivered in keepAlive parameter.
    //
    this.timeout = options.timeout || options.keepAlive || 10000;
  }

  this.state     = 'unopened';
  this.timeoutId = null;
  this.pending   = [];

  this.server = new mongodb.Server(this.host, this.port, {});
  this.client = new mongodb.Db(this.db, this.server, {
    native_parser: false
  });

  this.server.on('error', function (err) {
    // Close session. Next log will reopen.
    self.close();
  });

  this.client.on('error', function (err) {
    // Close session. Next log will reopen.
    self.close();
  });
};

//
// Inherit from `winston.Transport`.
//
util.inherits(MongoDB, winston.Transport);

//
// Define a getter so that `winston.transports.MongoDB`
// is available and thus backwards compatible.
//
winston.transports.MongoDB = MongoDB;

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
MongoDB.prototype.log = function (level, msg, meta, callback) {
  var self = this;

  //
  // Avoid reentrancy that can be not assumed by database code.
  // If database logs, better not to call database itself in the same call.
  //
  process.nextTick(function () {
    if (self.silent) {
      return callback(null, true);
    }

    self.open(function (err) {
      if (err) {
        self.emit('error', err);
        return callback(err, null);
      }

      // Set a timeout to close the client connection unless `self.keepAlive`
      // has been set to true in which case it is the responsibility of the
      // programmer to close the underlying connection.
      if (self.timeout) {
        if (self.timeoutId) {
          clearTimeout(self.timeoutId);
        }

        self.timeoutId = setTimeout(function () {
          // The session is idle. Closing it.
          self.close();
        }, self.timeout);
      }

      function onError(err) {
        self.close();
        self.emit('error', err);
        callback(err, null);
      }

      self._db.collection(self.collection, function (err, col) {
        if (err) {
          return onError(err);
        }

        if (typeof meta !== 'object' && meta != null) {
          meta = { meta: meta };
        }

        var entry = common.clone(meta) || {};
        entry.timestamp = new Date;
        entry.level = level;
        entry.message = msg;

        col.save(entry, { safe: self.safe }, function (err) {
          if (err) {
            return onError(err);
          }

          self.emit('logged');
          callback(null, true);
        });
      });
    });
  });
};

//
// ### function query (options, callback)
// #### @options {Object} Loggly-like query options for this instance.
// #### @callback {function} Continuation to respond to when complete.
// Query the transport. Options object is optional.
//
MongoDB.prototype.query = function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (this.state !== 'opened') {
    var self = this;
    return this.open(function () {
      return self.query(options, callback);
    });
  }

  var self = this,
      options = this.normalizeQuery(options),
      query,
      opt,
      fields;

  query = {
    timestamp: {
      $gte: options.from,
      $lte: options.until
    }
  };

  opt = {
    skip: options.start,
    limit: options.rows,
    sort: { timestamp: options.order === 'desc' ? -1 : 1 }
  };

  if (options.fields) {
    opt.fields = options.fields;
  }

  this._db.collection(this.collection, function (err, col) {
    if (err) return callback(err);
    col.find(query, opt).toArray(function (err, docs) {
      if (err) return callback(err);
      docs.forEach(function (log) {
        delete log._id;
      });
      if (callback) callback(null, docs);
    });
  });
};

//
// ### function stream (options)
// #### @options {Object} Stream options for this instance.
// #### @stream {Object} Pass in a pre-existing stream.
// Returns a log stream for this transport. Options object is optional.
// This will only work with a capped collection.
//
MongoDB.prototype.stream = function (options, stream) {
  var self = this,
      options = options || {},
      stream = stream || new Stream,
      start = options.start;

  if (this.state !== 'opened') {
    this.open(function () {
      self.stream(options, stream);
    });
    return stream;
  }

  stream.destroy = function() {
    this.destroyed = true;
  };

  if (start === -1) {
    start = null;
  }

  var opt = {
    tailable: true
  };

  if (start != null) {
    this._db.collection(this.collection, function (err, col) {
      if (err) return stream.emit('error', err);
      col.find({}, { skip: start }).toArray(function (err, docs) {
        if (err) return stream.emit('error', err);
        docs.forEach(function (doc) {
          delete doc._id;
          stream.emit('log', doc);
        });
        delete options.start;
        self.stream(options, stream);
      });
    });

    return stream;
  }

  this._db.collection(this.collection, function (err, col) {
    if (err) return stream.emit('error', err);

    if (stream.destroyed) return;

    var cursor = col.find({}, opt);

    // tail cursor
    var tail = cursor.stream();

    stream.destroy = function() {
      this.destroyed = true;
      tail.destroy();
    };

    tail.on('data', function (doc) {
      delete doc._id;
      stream.emit('log', doc);
    });

    tail.on('error', function (err) {
      if (typeof err !== 'object') {
        err = new Error(err);
      }

      // hack because isCapped doesn't work
      if (err.message === 'tailable cursor requested on non capped collection') {
        tail.destroy();
        self.streamPoll(options, stream);
        return;
      }

      stream.emit('error', err);
    });
  });

  return stream;
};

//
// ### function streamPoll (options)
// #### @options {Object} Stream options for this instance.
// #### @stream {Object} Pass in a pre-existing stream.
// Returns a log stream for this transport. Options object is optional.
//
MongoDB.prototype.streamPoll = function (options, stream) {
  var self = this,
      options = options || {},
      stream = stream || new Stream,
      start = options.start,
      last;

  if (this.state !== 'opened') {
    this.open(function () {
      self.streamPoll(options, stream);
    });
    return stream;
  }

  if (start === -1) {
    start = null;
  }

  if (start == null) {
    last = new Date(new Date - 1000);
  }

  stream.destroy = function() {
    this.destroyed = true;
  };

  (function check() {
    self._db.collection(self.collection, function (err, col) {
      if (err) return stream.emit('error', err);

      var query = last
        ? { timestamp: { $gte: last } }
        : {};

      col.find(query).toArray(function (err, docs) {
        if (stream.destroyed) return;

        if (err) {
          next();
          stream.emit('error', err);
          return;
        }

        if (!docs.length) return next();

        if (start == null) {
          docs.forEach(function (doc) {
            delete doc._id;
            stream.emit('log', doc);
          });
        } else {
          docs.forEach(function (doc) {
            delete doc._id;
            if (!start) {
              stream.emit('log', doc);
            } else {
              start--;
            }
          });
        }

        last = new Date(docs.pop().timestamp);

        next();
      });
    });

    function next() {
      setTimeout(check, 2000);
    }
  })();

  return stream;
};

//
// ### function _ensureCollection (callback)
// #### @db {Object} The database to create the collection in.
// #### @callback {function} Continuation to respond to when complete
// Attempt to create a capped collection if possible.
//
MongoDB.prototype._ensureCollection = function (db, callback) {
  if (!this.capped) return callback(null);

  var opt = { capped: true, size: this.cappedSize };
  db.createCollection(this.collection, opt, function (err, col) {
    callback(null);
  });
};

//
// ### function open (callback)
// #### @callback {function} Continuation to respond to when complete
// Attempts to open a new connection to MongoDB. If one has not opened yet
// then the callback is enqueued for later flushing.
//
MongoDB.prototype.open = function (callback) {
  var self = this;

  if (this.state === 'opening' || this.state === 'unopened') {
    //
    // While opening our MongoDB connection, append any callback
    // to a list that is managed by this instance.
    //
    this.pending.push(callback);

    if (this.state === 'opening') {
      return;
    }
  }
  else if (this.state === 'opened') {
    return callback();
  }
  else if (this.state === 'error') {
    return callback(this.error);
  }

  //
  // Flushes any pending log messages to MongoDB.
  //
  function flushPending(err) {
    //
    // Iterate over all callbacks that have accumulated during
    // the creation of the TCP socket.
    //
    for (var i = 0; i < self.pending.length; i++) {
      self.pending[i](err);
    }

    //
    // Quickly truncate the Array (this is more performant).
    //
    self.pending.length = 0;
  }

  //
  // Helper function which executes if there is an error
  // establishing the connection.
  //
  function onError(err) {
    self.state = 'error';
    self.error = err;
    flushPending(err);

    //
    // Close to be able to attempt opening later.
    //
    self.client.close();

    //
    // Retry new connection upon following request after error timeout expired.
    //
    setTimeout(function () {
      //
      // This is the only exit from error state.
      //
      self.state = 'unopened';
    }, self.errorTimeout);
  }

  //
  // Helper function which executes if the connection
  // is established.
  //
  function onSuccess(db) {
    self.state = 'opened';
    self._db = db;
    flushPending();
  }

  this.state = 'opening';
  this.client.open(function (err, db) {
    if (err) {
      return onError(err);
    }

    self._ensureCollection(db, function () {
      if (self.username && self.password) {
        return self.client.authenticate(self.username, self.password, function (err) {
          return err ? onError(err) : onSuccess(db);
        });
      }

      onSuccess(db);
    });
  });
};

//
// ### function close ()
// Cleans up resources (streams, event listeners) for
// this instance (if necessary).
//
MongoDB.prototype.close = function () {
  //
  // Reset session if it is opened.
  //
  if (this.state === 'opened') {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    //
    // Next time try to open new session.
    //
    this.client.close();
    this.state = 'unopened';
  }
};
