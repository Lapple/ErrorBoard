var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var reduceBrowsers = require('./reduce-browsers');

module.exports = function() {
    return aggregate({
        groupBy: function(item) {
            return JSON.stringify({
                message: item.message,
                line: item.line,
                url: item.url
            });
        },
        create: function(item) {
            return {
                title: item.message,
                count: 0,
                browsers: []
            };
        },
        each: function(obj, next) {
            obj.count += 1;
            reduceTimestamps(obj, next);
            reduceBrowsers(obj, next);
        }
    });
};
