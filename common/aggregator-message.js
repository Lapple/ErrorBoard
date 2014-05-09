var slug = require('speakingurl');

var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');

module.exports = function(params) {
    return aggregate({
        groupBy: function(item) {
            return item.ua.name + ' ' + item.ua.version;
        },
        filter: function(item) {
            return slug(item.message) === params.id;
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
