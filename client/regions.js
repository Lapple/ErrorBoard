var _ = require('lodash');
var React = require('react');

var _regions = {};

var querySelector = document.querySelector.bind(document);

var normalizeInput = function(fn, selectors) {
    if (_.isString(selectors)) {
        selectors = [selectors];
    } else if (!selectors) {
        selectors = _.keys(_regions);
    }

    return fn(selectors);
};

module.exports = {
    render: function(selector, Component, props) {
        var render = _regions[selector] = _.partial(
            React.renderComponent,
            Component(props),
            querySelector(selector)
        );

        render();
    },
    update: _.wrap(function(selectors) {
        _.each(selectors, function(selector) {
            if (_regions[selector]) {
                _regions[selector]();
            }
        });
    }, normalizeInput),
    cleanup: _.wrap(function(selectors) {
        _.each(selectors, function(selector) {
            React.unmountComponentAtNode(querySelector(selector));
            delete _regions[selector];
        });
    }, normalizeInput),
    list: function() {
        return _.keys(_regions);
    }
};
