var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var reduceBrowsers = require('./reduce-browsers');

module.exports = function() {
    return aggregate({
        groupBy: function(item) {
            return item.referer || 'No referer';
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
