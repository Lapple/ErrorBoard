var _ = require('lodash');
var aggregators = require('../common/aggregators');

var _reports = {};

module.exports = {
    fetch: function(type) {
        if (_reports[type]) {
            var deferred = $.Deferred();
            _.defer(deferred.resolve, _reports[type]);
            return deferred.promise();
        }

        return $.getJSON('/reports/' + type).done(function(response) {
            _reports[type] = response;
        });
    },
    get: function(type) {
        return _reports[type] || null;
    },
    update: function(item) {
        for (var type in _reports) {
            var aggregator = aggregators[type];

            if (aggregator) {
                _reports[type] = aggregator(_reports[type], item);
            }
        }
    }
};
