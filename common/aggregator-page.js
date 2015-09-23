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

            var referer = item.referer;

            return referer === params.id ||
                (params.id === 'No referer' && !referer);
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
