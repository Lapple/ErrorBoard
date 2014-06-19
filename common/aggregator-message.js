var slug = require('speakingurl');

var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var getBrowserName = require('./browser-name');

module.exports = function(params) {
    return aggregate({
        groupBy: getBrowserName,
        filter: function(item) {
            var message = JSON.stringify({
                message: item.message,
                line: item.line,
                url: item.url
            });

            return slug(message) === params.id;
        },
        create: function(item) {
            return {
                title: item.message,
                count: 0,
                stack: item.stack
            };
        },
        each: function(obj, next) {
            obj.count += 1;
            reduceTimestamps(obj, next);
        }
    });
};
