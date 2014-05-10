var _ = require('lodash');
var React = require('react');
var slug = require('speakingurl');

var Timespan = require('./component-timespan.jsx');

module.exports = React.createClass({
    render: function() {
        var title;
        var data = this.props.data;
        var overall = this.props.overall;

        var href = '/' + this.props.type + '/' + slug(data.key) + '/';

        if (this.props.type === 'browser') {
            title = data.key;
        } else {
            title = <a href={ href } className='report__link'>
                { data.key }
            </a>
        }

        // { _.isEmpty(browsers) ? '' : this.td(browsers.join(', ')) }

        return <tr className='report__row'>
            <td className='report__cell'>
                { title }
            </td>
            <td className='report__cell report__cell_count'>
                { data.count }
            </td>
            <td className='report__cell report__cell_timespan'>
                <Timespan min={overall.earliest} max={overall.latest} start={data.earliest} finish={data.latest} />
            </td>
        </tr>;
    }
});
