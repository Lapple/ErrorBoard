var _ = require('lodash');

var prop = function(name) {
    return function(obj) {
        return obj[name];
    };
};

var value = function(v) {
    return function() {
        if (_.isObject(v)) {
            return _.clone(v);
        } else {
            return v;
        }
    };
};

module.exports = function(params) {
    if (_.isString(params.groupBy)) {
        params.groupBy = prop(params.groupBy);
    }

    if (!_.isFunction(params.init)) {
        params.init = value(params.init);
    }

    return function(dataset, item) {
        var groupName = params.groupBy(item);
        var i = dataset[groupName];

        if (!i) {
            i = dataset[groupName] = params.init(item);
        }

        params.step(i, item);

        return dataset;
    };
};
