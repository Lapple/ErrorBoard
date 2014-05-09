var React = require('react');
var slug = require('speakingurl');

module.exports = React.createClass({
    render: function() {
        var title;
        var browsers = this.props.data.browsers || [];

        if (this.props.type === 'browser') {
            title = this.props.title;
        } else {
            title = <a href={ '/' + this.props.type + '/' + slug(this.props.title) + '/' }>
                { this.props.title }
            </a>
        }

        return <div>
            <b>{ title }</b>
            &nbsp;
            ({ this.props.data.count }) { browsers.join(', ') }
        </div>;
    }
});
