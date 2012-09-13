var _        = require('underscore')
  , uaParser = require('ua-parser')
  , logger   = require('./logger')
  , site     = require('./../config/main').observedSite.url
  , util, ErrorPusher, socketInstance;

util = {
  formatTime: function( time ) {
    return this.padWithZero(time.getHours()) + ':' + this.padWithZero(time.getMinutes()) + ':' + this.padWithZero(time.getSeconds())
  }
, padWithZero: function ( number ) {
    return (number < 10 ? '0' : '') + number;
  }
}

ErrorPusher = function( params ) {
  var ua = uaParser.parse( params.ua );

  _.extend( this, params.query );

  // Could not determine the url
  if (this.url === 'undefined' || this.url === '') {
    this.url = this.line = false;
  }

  this.time  = new Date();
  this.page  = params.referer && params.referer.replace(site, '');
  this.fixed = false;

  this.agent = {
    browser : ua.family
  , version : ua.toVersionString()
  };
};

ErrorPusher.prototype.put = function() {
  // Prevent referrerless calls from being put as errors
  if ( this.page && this.url ) {
    logger.log({
      console : this.toString()
    , file    : this.toJSON()
    });
  }
};

ErrorPusher.prototype.toJSON = function() {
  var error = {
    message :  this.message
  , time    : +this.time
  , agent   :  this.agent
  , page    :  this.page
  , fixed   :  this.fixed
  };

  if ( this.url ) {
    _.extend( error, {
      url  :  this.url
    , line : +this.line
    });
  }

  return error;
};

ErrorPusher.prototype.toString = function() {
  return '[' + util.formatTime(this.time) + '] ' + this.agent.browser + ' v' + this.agent.version +
                                 '\n           ' + this.message +
                                 '\n     Page: ' + '/' + this.page +
                  ( this.url ? ( '\n   Script: ' + this.url + ':' + this.line ) : '' ) + '\n';
};

module.exports = ErrorPusher;
