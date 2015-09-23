var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var getMetaKey = require('./meta-key');

module.exports = function(params) {
    return aggregate({
        groupBy: 'message',
        filter: function(item) {
            return getMetaKey(item) === params.id;
        },
        create: function(item) {
            return {
                title: item.message,
                count: 0
            };
        },
        each: function(obj, next) {
            obj.count += 1;
            reduceTimestamps(obj, next);
        }
    });
};
