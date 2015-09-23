var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var reduceBrowsers = require('./reduce-browsers');
var getMetaKey = require('./meta-key');

module.exports = function(params) {
    var groupFunction = params.meta ? getMetaKey : getMessage;

    return aggregate({
        groupBy: groupFunction,
        filter: function(item) {
            if (params.meta && !item.meta) {
                return false;
            }

            var url = item.url;
            var line = item.line || 0;

            return (url + ':' + line) === params.id;
        },
        create: function(item) {
            return {
                title: groupFunction(item),
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

function getMessage(item) {
    return item.message;
}
