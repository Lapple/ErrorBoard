var ErrorPusher = require('./../modules/error_pusher')
  , config      = require('./../config/main')
  , sample = {
      userAgent : 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.29 Safari/525.13'
    , referer   : config.observedSite.url
    , script    : config.observedSite.url + 'script.js'
    , line      : 100
    , message   : 'ReferenceError: abc is not defined'
    }
  , ep, ep2;

ep = new ErrorPusher({
  query: {
    url     : sample.script
  , line    : sample.line
  , message : sample.message
  }
, ua      : sample.userAgent
, referer : sample.referer
});

ep2 = new ErrorPusher({
  query: {
    url     : 'undefined'
  , line    : 0
  , message : sample.message
  }
, ua      : sample.userAgent
, referer : sample.referer + 'authentication'
})

describe( 'New error object fired from homepage', function() {
  it( 'contains url, message and line number', function() {
    ep.should.have.property( 'url' );
    ep.should.have.property( 'message' );
    ep.should.have.property( 'line' );
  });

  it( 'has the browser name and version', function() {
    var browser = ep.agent;

    ep.should.have.property( 'agent' );
    browser.should.have.property( 'browser' );
    browser.should.have.property( 'version' );
  });

  it( 'is marked as not fixed', function() {
    ep.fixed.should.be.false;
  });

  it( 'has a correctly formatted `page` property', function() {
    ep.page.should.equal( '' );
  });

  it( 'has a correctly stringified version', function() {
    ( ep + '' ).should.not.equal( '[object Object]' );
  });
});

describe( 'New error object fired from `/authentication` page', function() {
  it( 'has a correctly handled `undefined` script URL', function() {
    ep2.url.should.equal( 'Unable to determine' );
  })
  it( 'has a correctly formatted `page` property', function() {
    ep2.page.should.equal( 'authentication' );
  });
});
