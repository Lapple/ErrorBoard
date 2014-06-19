var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var reduceBrowsers = require('./reduce-browsers');

module.exports = function(params) {
    return aggregate({
        groupBy: 'message',
        filter: function(item) {
            var url = item.url;
            var line = item.line || 0;

            return (url + ':' + line) === params.id;
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
