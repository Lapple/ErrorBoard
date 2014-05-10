var _ = require('lodash');

var sortByLatestReport = function(a, b) {
    return b.latest - a.latest;
};

module.exports = {
    getReport: function() {
        var rows = _.map(this.props.data, function(value, key) {
            return _.extend(value, {key: key});
        });

        return rows.sort(sortByLatestReport);
    }
};
