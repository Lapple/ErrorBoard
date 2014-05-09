var aggregate = require('./aggregate');

module.exports = aggregate({
    groupBy: 'message',
    create: {
        count: 0,
        browsers: []
    },
    each: function(obj, next) {
        obj.count += 1;

        if (!obj.latest || next.timestamp > obj.latest) {
            obj.latest = next.timestamp;
        }

        if (!obj.earliest || next.timestamp < obj.earliest) {
            obj.earliest = next.timestamp;
        }

        if (obj.browsers.indexOf(next.ua.name) === -1) {
            obj.browsers.push(next.ua.name);
        }
    }
});
