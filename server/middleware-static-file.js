var fs = require('fs');

module.exports = function(path) {
    return function(req, res) {
        fs.createReadStream(path).pipe(res);
    };
};
