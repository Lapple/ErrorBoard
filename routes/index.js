var ErrorPusher   = require('./../modules/error_pusher'),
    StatsProvider = require('./../modules/stats'),
    config        = require('./../config/main');

var _             = require('underscore'),
    routes        = {},
    stats         = new StatsProvider();

/*
 * Calling an index page
 */
routes.index = function( req, res ) {
  res.redirect( config.observedSite.url );
};

/*
 * A route that pushes the error
 * to the log and database.
 */
routes.pushError = function( req, res ) {
  var err = new ErrorPusher({
    query   : req.method === 'POST' ? req.body : req.query,
    ua      : req.headers['user-agent'],
    referer : req.headers.referer
  });
  err.put();
  res.end();
};

/*
 * Returns error stats as per requested
 * type.
 */
routes.stats = function( req, res ) {
  var start = Date.now();

  // Matches `/:lang?/stats` and redirects
  // to the default errors breakdown page
  if ( !req.params.type ) {
    res.redirect( '/en/stats/errors' );
    return;
  }

  // Set language to English unless it is specified
  if ( !req.params.lang || !req.i18n[ req.params.lang ] ) {
    res.redirect( '/en/stats/' + req.params.type );
    return;
  }

  // Query, group and collect data from the database,
  // append locale strings.
  stats.getErrors( req.params.type, req.params.all, function( data ) {
    data.timeElapsed = Date.now() - start;
    data.site        = req.site;
    data.siteUrl     = req.siteUrl;
    data.lang        = req.i18n[ req.params.lang ];
    data.langList    = _.values( req.i18n ).map(function( language ) {
      return {
        url   : language.url,
        title : language.langName
      }
    });

    res.render( 'stats', data );
  });
};

routes.info = function( req, res ) {
  // Query validation
  if ( !req.query.file ) {
    res.end();
    return;
  }

  // Default language is English
  if ( !req.params.lang ) {
    req.params.lang = 'en';
  }

  stats.getErrorInfo( req.query, req.params.all, function( data ) {
    data.layout = false;
    data.lang   = req.i18n[ req.params.lang ];
    res.render( 'info', data );
  });
};

/*
 * Mark the error as `fixed`.
 */
routes.fix = function( req, res ) {
  if ( req.query.file && req.query.line ) {
    stats.fixError( req.query );
  }

  res.end();
};

module.exports = routes;
