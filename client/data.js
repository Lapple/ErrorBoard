var aggregators = require('../common/aggregators');

var _data = {};

module.exports = {
    fetch: function(type) {
        if (_data[type]) {
            return $.Deferred().resolve(_data[type]);
        }

        return $.getJSON('/data/' + type).done(function(response) {
            _data[type] = response;
        });
    },
    get: function(type) {
        return _data[type] || null;
    },
    update: function(item) {
        for (var type in _data) {
            var aggregator = aggregators[type];

            if (aggregator) {
                _data[type] = aggregator(_data[type], item);
            }
        }
    }
};
