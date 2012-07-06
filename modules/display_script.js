var http = require( 'http' )
  , url  = require( 'url' )
  , hljs = require( 'highlight.js' );

hljs.tabReplace = '<span class="indent">\t</span>';

module.exports = function( params, callback ) {
  var scriptURL = url.parse( params.url )
    , contents  = [];

  http
    .get( scriptURL, function( res ) {
      res.on( 'data', function( chunk ) {
        contents.push( chunk );
      });

      res.on( 'end', function() {
        var lines = hljs.highlight( 'javascript', contents.join( '' ) ).value.split( '\n' );

        callback({
          script    : lines
        , errorLine : params.line
        , title     : scriptURL.path + ':' + params.line
        });
      });
    })
    .on( 'error', function( e ) {
      console.log("Got error: " + e.message);
    });
};
