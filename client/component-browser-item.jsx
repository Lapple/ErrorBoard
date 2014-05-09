var React = require('react');
var slug = require('speakingurl');

module.exports = React.createClass({
    render: function() {
        return <div>
            <b>
                <a href={'/browsers/' + slug(this.props.name) + '/'}>
                    {this.props.name}
                </a>
            </b>
            &nbsp;
            ({this.props.data.count})
        </div>;
    }
});
