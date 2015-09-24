var _ = require('lodash');

var aggregate = require('./aggregate');
var reduceTimestamps = require('./reduce-timestamps');
var reduceBrowsers = require('./reduce-browsers');
var getMessageSignature = require('./message-signature');
var filterBy = require('./filter-by');

module.exports = function(params) {
    var filterFunction = (params.filterMetaBy ?
        _.partial(filterBy, params.filterMetaBy) :
        _.constant(true));

    return aggregate({
        groupBy: getMessageSignature,
        filter: filterFunction,
        create: function(item) {
            return {
                title: item.message,
                count: 0,
                browsers: []
            };
        },
        each: function(obj, next) {
            obj.count += 1;
            reduceTimestamps(obj, next);
            reduceBrowsers(obj, next);
        }
    });
};
