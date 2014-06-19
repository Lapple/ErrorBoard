module.exports = function(data) {
    return JSON.stringify({
        message: data.message,
        line: data.line,
        url: data.url
    });
};
