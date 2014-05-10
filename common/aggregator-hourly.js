var moment = require('moment');
var aggregate = require('./aggregate');

module.exports = function() {
    return aggregate({
        groupBy: function(item) {
            return moment(item.timestamp).startOf('hour').valueOf();
        },
        create: {
            count: 0
        },
        each: function(obj) {
            obj.count += 1;
        }
    });
};
