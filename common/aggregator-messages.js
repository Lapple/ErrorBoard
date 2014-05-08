var _ = require('lodash');
var aggregate = require('./aggregate');

module.exports = aggregate({
    groupBy: 'message',
    create: {
        count: 0,
        browsers: []
    },
    each: function(obj, next) {
        obj.count += 1;

        if (!_.contains(obj.browsers, next.ua.name)) {
            obj.browsers.push(next.ua.name);
        }
    }
});
