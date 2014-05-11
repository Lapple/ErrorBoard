var moment = require('moment');
var aggregate = require('./aggregate');

module.exports = function(params) {
    return aggregate({
        groupBy: function(item) {
            return moment(item.timestamp).startOf('hour').valueOf();
        },
        filter: function(item) {
            return item.timestamp >= params.from && item.timestamp <= params.to;
        },
        create: {
            count: 0
        },
        each: function(obj) {
            obj.count += 1;
        }
    });
};
