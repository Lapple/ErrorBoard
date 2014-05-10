var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');

module.exports = function() {
    return aggregate({
        groupBy: function(item) {
            return item.ua.name;
        },
        create: {
            count: 0
        },
        each: function(obj, next) {
            obj.count += 1;
            reduceTimestamps(obj, next);
        }
    });
};
