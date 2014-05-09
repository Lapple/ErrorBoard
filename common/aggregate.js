var _ = require('lodash');

var prop = function(name) {
    return function(obj) {
        return obj[name];
    };
};

var value = function(v) {
    return function() {
        if (_.isObject(v)) {
            return _.cloneDeep(v);
        } else {
            return v;
        }
    };
};

module.exports = function(params) {
    var filter = params.filter || value(true);

    if (_.isString(params.groupBy)) {
        params.groupBy = prop(params.groupBy);
    }

    if (!_.isFunction(params.create)) {
        params.create = value(params.create);
    }

    return function(dataset, next) {
        if (filter(next)) {
            var groupName = params.groupBy(next);
            var item = dataset[groupName];

            if (!item) {
                item = dataset[groupName] = params.create(next);
            }

            params.each(item, next);
        }

        return dataset;
    };
};
