var _ = require('lodash');

var db = require('./database');
var aggregators = require('../common/aggregators');

module.exports = function(req, res) {
    var type = req.params.type;
    var aggregator = aggregators[type];

    var query = _.transform(req.query, function(result, value, key) {
        result[key] = decodeURIComponent(value);
    }, {});

    console.log(query);

    if (aggregator) {
        db.find({}, function(err, docs) {
            if (err) {
                res.json(400, { error: err });
            } else {
                res.json(_.reduce(docs, aggregator(query), {}));
            }
        });
    } else {
        res.end(400);
    }
};
