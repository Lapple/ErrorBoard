var aggregate = require('./aggregate');

module.exports = function() {
    return aggregate({
        groupBy: function(item) {
            return item.ua.name;
        },
        create: {
            count: 0
        },
        each: function(obj) {
            obj.count += 1;
        }
    });
};
