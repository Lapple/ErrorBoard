module.exports = function(obj, next) {
    if (!obj.latest || next.timestamp > obj.latest) {
        obj.latest = next.timestamp;
    }

    if (!obj.earliest || next.timestamp < obj.earliest) {
        obj.earliest = next.timestamp;
    }

    return obj;
};
