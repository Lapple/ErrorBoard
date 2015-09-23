var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var getBrowserName = require('./browser-name');
var getMetaKey = require('./meta-key');

module.exports = function(params) {
    var groupFunction = params.meta ? getMetaKey : getMessage;

    return aggregate({
        groupBy: groupFunction,
        filter: function(item) {
            if (params.meta && !item.meta) {
                return false;
            }

            return getBrowserName(item) === params.id;
        },
        create: function(item) {
            return {
                title: groupFunction(item),
                count: 0
            };
        },
        each: function(obj, next) {
            obj.count += 1;
            reduceTimestamps(obj, next);
        }
    });
};

function getMessage(item) {
    return item.message;
}
