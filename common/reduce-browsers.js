module.exports = function(obj, next) {
    if (obj.browsers.indexOf(next.ua.name) === -1) {
        obj.browsers.push(next.ua.name);
    }

    return obj;
};
