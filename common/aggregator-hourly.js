var moment = require('moment');

var aggregate = require('./aggregate');
var getMessageSignature = require('./message-signature');

module.exports = function(params) {
    return aggregate({
        groupBy: function(item) {
            return moment(item.timestamp).startOf('hour').valueOf();
        },
        filter: function(item) {
            var isMatchingTime = item.timestamp >= params.from && item.timestamp <= params.to;
            var isMatchingQuery = !params.message || getMessageSignature(item) === params.message;

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
