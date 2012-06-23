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

  // Query prevalidation
  if (params.query.url === 'undefined') {
    params.query.url = 'Unable to determine'
  }

  _.extend( this, params.query );

  this.time  = new Date();
  this.page  = params.referer.replace(site, '');
  this.fixed = false;

  this.agent = {
    browser : ua.family
  , version : ua.toVersionString()
  };
};

ErrorPusher.prototype.put = function() {
  logger.log({
    console : this.toString()
  , file    : this.toJSON()
  });
};

ErrorPusher.prototype.toJSON = function() {
  return {
    message :  this.message
  , url     :  this.url
  , line    : +this.line
  , time    : +this.time
  , agent   :  this.agent
  , page    :  this.page
  , fixed   :  this.fixed
  }
};

ErrorPusher.prototype.toString = function() {
  return '[' + util.formatTime(this.time) + '] ' + this.agent.browser + ' v' + this.agent.version +
                                 '\n           ' + this.message +
                                 '\n     Page: ' + '/' + this.page +
                                 '\n   Script: ' + this.url + ':' + this.line + '\n';
};

module.exports = ErrorPusher;
