var React = require('react');

module.exports = React.createClass({
    render: function() {
        return <ul>
            <li>{ this.link('/messages/', 'Messages') }</li>
            <li>{ this.link('/browsers/', 'Browsers') }</li>
            <li>{ this.link('/scripts/', 'Scripts') }</li>
            <li>{ this.link('/pages/', 'Pages') }</li>
        </ul>;
    },
    link: function(pathname, title) {
        var content = title;

        if (this.props.pathname.indexOf(pathname) === 0) {
            content = <b>{ title }</b>;
        }

        return <a href={ pathname } title={ title }>{ content }</a>;
    }
});
