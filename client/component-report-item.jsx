var _ = require('lodash');
var React = require('react');
var slug = require('speakingurl');

var Timespan = require('./component-timespan.jsx');
var Browsers = require('./component-browsers.jsx');

module.exports = React.createClass({
    render: function() {
        var data = this.props.data;
        var overall = this.props.overall;

        return <tr className='report__row'>
            <td className='report__cell report__cell_cut'>
                { data.browsers ? <Browsers list={ data.browsers } align='right' /> : null }
                <div className='report__cut'>
                    { this.props.type === 'browsers' ? <Browsers list={ [data.key.split(' ').slice(0, -1).join(' ')] } /> : null }
                    { this.renderTitle() }
                </div>
            </td>
            <td className='report__cell report__cell_count'>
                { data.count }
            </td>
            <td className='report__cell report__cell_timespan'>
                <Timespan min={ overall.earliest } max={ overall.latest } start={ data.earliest } finish={ data.latest } />
            </td>
        </tr>;
    },
    renderTitle: function() {
        var href = '/' + this.props.type + '/' + slug(this.props.data.key) + '/';

        if (this.props.type === 'browser') {
            return this.props.data.key;
        } else {
            return <a href={ href } className='report__link'>
                { this.props.data.key }
            </a>
        }
    }
});
