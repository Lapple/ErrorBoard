var _ = require('lodash');
var React = require('react');

var _regions = {};

var invoke = function(fn) {
    return fn();
};

module.exports = {
    render: function(selector, Component, props) {
        var render = _regions[selector] = _.partial(
            React.renderComponent,
            Component(_.isFunction(props) ? props() : props),
            document.querySelector(selector)
        );

        render();
    },
    update: function(selector) {
        if (selector && _regions[selector]) {
            _regions[selector]();
        } else {
            _.each(_regions, invoke);
        }
    }
};
