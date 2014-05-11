var React = require('react');
var cx = React.addons.classSet;

module.exports = React.createClass({
    render: function() {
        return <div className="nav">
            { this.link('/graph/', 'Graph') }
            { this.link('/messages/', 'Messages') }
            { this.link('/browsers/', 'Browsers') }
            { this.link('/scripts/', 'Scripts') }
            { this.link('/pages/', 'Pages') }
        </div>;
    },
    link: function(pathname, title) {
        var classes = cx({
            'nav__link': true,
            'nav__link_active': this.props.pathname.indexOf(pathname) === 0
        });

        return <a className={ classes } href={ pathname } title={ title }>
            { title }
        </a>;
    }
});
