var _ = require('lodash');
var aggregators = require('../common/aggregators');

var _reports = {};

var getKey = function(params) {
    return _.reduce(params, function(result, value, key) {
        return result + '&' + key + '=' + value;
    }, '?');
};

var getParams = function(key) {
    return _.reduce(key.substr(1).split('&'), function(params, pair) {
        var p = pair.split('=');

        params[p[0]] = p[1];

        return params;
    }, {});
};

module.exports = {
    fetch: function(type, params) {
        var key = getKey(params);

        if (!_reports[type]) {
            _reports[type] = {};
        }

        if (_reports[type][key]) {
            var deferred = $.Deferred();
            _.defer(deferred.resolve, _reports[type][key]);
            return deferred.promise();
        }

        return $.getJSON('/reports/' + type, params).done(function(response) {
            _reports[type][key] = response;
        });
    },
    get: function(type, params) {
        return (_reports[type] && _reports[type][getKey(params)]) || null;
    },
    update: function(item) {
        for (var type in _reports) {
            var aggregator = aggregators[type];

            if (aggregator) {
                for (var key in _reports[type]) {
                    _reports[type][key] = aggregator(getParams(key))(_reports[type][key], item);
                }
            }
        }
    }
};
