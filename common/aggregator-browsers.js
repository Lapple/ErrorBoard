var aggregate = require('./aggregate');

module.exports = aggregate({
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
