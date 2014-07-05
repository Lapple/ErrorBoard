var _ = require('lodash');
var React = require('react/addons');
var cx = React.addons.classSet;

var slug = function(title) {
    return title && title.toLowerCase().replace(/\s+/g, '-');
};

module.exports = React.createClass({
    render: function() {
        var classes = cx({
            'browsers': true,
            'browsers_right': this.props.align === 'right'
        });

        var browsers = _.map(this.props.list, function(browser) {
            if (browser) {
                return <div className={ 'browsers__item browsers__item_' + slug(browser) } title={ browser } key={ browser } />;
            }
        });

        return <div className={ classes }>{ browsers }</div>;
    }
});
