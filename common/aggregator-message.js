var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var getMetaKey = require('./meta-key');
var getBrowserName = require('./browser-name');
var getMessageSignature = require('./message-signature');

module.exports = function(params) {
    var groupFunction = params.meta ? getMetaKey : getBrowserName;

    return aggregate({
        groupBy: groupFunction,
        filter: function(item) {
            if (params.meta && !item.meta) {
                return false;
            }

            return getMessageSignature(item) === params.id;
        },
        create: function(item) {
            return {
                title: groupFunction(item),
                count: 0,
                stack: item.stack,
                line: item.line,
                url: item.url
            };
        },
        each: function(obj, next) {
            obj.count += 1;
            reduceTimestamps(obj, next);
        }
    });
};
