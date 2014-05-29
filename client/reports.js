var _ = require('lodash');
var vow = require('vow');
var request = require('superagent');
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
        var deferred = vow.defer();

        if (!_reports[type]) {
            _reports[type] = {};
        }

        if (_reports[type][key]) {
            deferred.resolve(_reports[type][key]);
        } else {
            request
                .get('/reports/' + type)
                .query(params)
                .set('Accept', 'application/json')
                .end(function(res) {
                    if (res.ok) {
                        deferred.resolve(_reports[type][key] = res.body);
                    } else {
                        deferred.reject(res.text);
                    }
                });
        }

        return deferred.promise();
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
