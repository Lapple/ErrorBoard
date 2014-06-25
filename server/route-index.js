var React = require('react');
var ComponentApp = require('../client/component-app.jsx');

module.exports = function(req, res) {
    var props = {
        params: req.params,
        pathname: req.path
    };

    res.render('template-index', {
        app: React.renderComponentToString(ComponentApp(props))
    });
};
