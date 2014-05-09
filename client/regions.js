var _ = require('lodash');
var React = require('react');

var _regions = {};

var querySelector = document.querySelector.bind(document);

var normalizeSelectorsArgument = function(selectors) {
    if (_.isString(selectors)) {
        return [selectors];
    } else if (!selectors) {
        return _.keys(_regions);
    }

    return selectors;
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
    update: function(selectors) {
        selectors = normalizeSelectorsArgument(selectors);

        _.each(selectors, function(selector) {
            if (_regions[selector]) {
                _regions[selector]();
            }
        });
    },
    cleanup: function(selectors) {
        selectors = normalizeSelectorsArgument(selectors);

        _.each(selectors, _.compose(React.unmountComponentAtNode, querySelector));
    },
    list: function() {
        return _.keys(_regions);
    }
};
