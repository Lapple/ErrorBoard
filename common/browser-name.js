module.exports = function(data) {
    var ua = data.ua;

    if (ua.family && ua.major) {
        return ua.family + ' ' + ua.major + (ua.minor ? '.' + ua.minor : '');
    } else if (ua.family) {
        return ua.family;
    } else {
        return 'Unknown';
    }
};
