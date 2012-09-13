var express = require('express')
  , moment  = require('moment')
  , config  = require('./config/main')
  , i18n    = require('./config/i18n');

var app     = module.exports = express.createServer()
  , routes  = require('./routes')
  , middleware = {};

// Configuration

app.configure(function() {
  app.set( 'views', __dirname + '/views' );
  app.set( 'view engine', 'jade' );
  app.set( 'view options', { layout: false } );

  app.use( express.bodyParser() );
  app.use( app.router );
  app.use( express.static( __dirname + '/public' ) );
});

app.configure( 'development', function () {
  app.use( express.errorHandler({ dumpExceptions: true, showStack: true }) );
});

app.configure( 'production', function() {
  app.use( express.errorHandler() );
});

// Route-specific middleware
middleware.i18n = function( req, res, next ) {
  req.i18n = i18n;
  next();
};

middleware.configuration = function( req, res, next ) {
  req.site    = config.observedSite.title;
  req.siteUrl = config.observedSite.url;
  next();
};

middleware.moment = function( req, res, next ) {
  req.moment = moment;
  next();
};

middleware.common = [ middleware.i18n, middleware.configuration, middleware.moment ];

// Routes
app.get(  '/:lang?/script/:url/:line',  middleware.common, routes.script );
app.get(  '/stats/fix',                 routes.fix );
app.post( '/stats/clearAll',            routes.clearAll );
app.get(  '/:lang?/stats/info/:all?',   middleware.common, routes.info );
app.get(  '/:lang?/stats/:type?/:all?', middleware.common, routes.stats );
app.all(  '/pusherror/*',               routes.pushError );
app.get(  '/',                          routes.index );

app.listen( config.app.port, config.app.host );
console.log( "Initialized on %s", (new Date()).toUTCString() );
