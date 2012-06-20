#!/usr/bin/env node

var express = require('express')
  , config  = require('./../config/main')
  , i18n    = require('./../config/i18n');

var app     = module.exports = express.createServer()
  , routes  = require('./../routes');

// Configuration

app.configure(function() {
  app.set( 'views', __dirname + '../views' );
  app.set( 'view engine', 'jade' );

  // Configuration middleware
  app.use(function( req, res, next ) {
    req.site    = config.observedSite.title;
    req.siteUrl = config.observedSite.url;
    req.i18n    = i18n;
    next();
  });

  app.use( express.bodyParser() );
  app.use( app.router );
  app.use( express.static(__dirname + '../public') );
});

app.configure( 'development', function () {
  app.use( express.errorHandler({ dumpExceptions: true, showStack: true }) );
});

app.configure( 'production', function() {
  app.use( express.errorHandler() );
});

// Routes
app.get( '/stats/fix',                 routes.fix );
app.get( '/:lang?/stats/info/:all?',   routes.info );
app.get( '/:lang?/stats/:type?/:all?', routes.stats );
app.all( '/pusherror/*',               routes.pushError );
app.get( '/',                          routes.index );

app.listen( config.app.port, config.app.host );
console.log( "Initialized on %s", (new Date()).toUTCString() );
