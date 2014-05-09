var _ = require('lodash');
var React = require('react');
var slug = require('speakingurl');
var cx = React.addons.classSet;

module.exports = React.createClass({
    render: function() {
        var title;
        var href = '/' + this.props.type + '/' + slug(this.props.title) + '/';
        var browsers = this.props.data.browsers;

        if (this.props.type === 'browser') {
            title = this.props.title;
        } else {
            title = <a href={ href } className='report__link'>
                { this.props.title }
            </a>
        }

        return <tr className='report__row'>
            { this.td(title) }
            { this.td(this.props.data.count, 'count') }
            { _.isEmpty(browsers) ? '' : this.td(browsers.join(', ')) }
        </tr>;
    },
    td: function(content, mod) {
        var classes = {
            'report__cell': true
        };

        if (mod) {
            classes['report__cell_' + mod] = true;
        }

        return <td className={cx(classes)}>{ content }</td>;
    }
});
