var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var reduceBrowsers = require('./reduce-browsers');
var getMessageSignature = require('./message-signature');

module.exports = function() {
    return aggregate({
        groupBy: getMessageSignature,
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
