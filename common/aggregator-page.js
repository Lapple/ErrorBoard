var slug = require('speakingurl');

var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var reduceBrowsers = require('./reduce-browsers');

module.exports = function(params) {
    return aggregate({
        groupBy: 'message',
        filter: function(item) {
            var referer = item.referer;

            return slug(referer) === params.id ||
                (params.id === 'no-referer' && !referer);
        },
        create: {
            count: 0,
            browsers: []
        },
        each: function(obj, next) {
            obj.count += 1;
            reduceTimestamps(obj, next);
            reduceBrowsers(obj, next);
        }
    });
};
