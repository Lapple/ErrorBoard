var _ = require('lodash');
var React = require('react');

var _regions = {};

module.exports = {
    render: function(selector, Component, props) {
        var render = _regions[selector] = _.partial(
            React.renderComponent,
            Component(_.isFunction(props) ? props() : props),
            document.querySelector(selector)
        );

        render();
    },
    update: function(selectors) {
        if (_.isString(selectors)) {
            selectors = [selectors];
        } else if (!selectors) {
            selectors = _.keys(_regions);
        }

        _.each(selectors, function(selector) {
            _regions[selector]();
        });
    }
};
