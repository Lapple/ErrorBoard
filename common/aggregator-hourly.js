var moment = require('moment');
var slug = require('speakingurl');

var aggregate = require('./aggregate');

module.exports = function(params) {
    return aggregate({
        groupBy: function(item) {
            return moment(item.timestamp).startOf('hour').valueOf();
        },
        filter: function(item) {
            var isMatchingTime = item.timestamp >= params.from && item.timestamp <= params.to;
            var isMatchingQuery = !params.message || slug(item.message) === params.message;

            return isMatchingTime && isMatchingQuery;
        },
        create: {
            count: 0
        },
        each: function(obj) {
            obj.count += 1;
        }
    });
};
