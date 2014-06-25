module.exports = function(to) {
    return function(req, res) {
        res.redirect(to);
    };
};
