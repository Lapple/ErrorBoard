var _ = require('lodash');
var React = require('react');
var slug = require('speakingurl');

var cx = React.addons.classSet;
var Timespan = require('./component-timespan.jsx');
var Browsers = require('./component-browsers.jsx');

module.exports = React.createClass({
    render: function() {
        var data = this.props.data;
        var overall = this.props.overall;

        var titleClasses = cx({
            'report__cut': true,
            'report__mono': _.contains(['messages', 'scripts'], this.props.type)
        });

        var isBrowserType = _.contains(['browsers', 'browser'], this.props.type);

        return <tr className='report__row'>
            <td className='report__cell report__cell_cut'>
                { data.browsers ? <Browsers list={ data.browsers } align='right' /> : null }
                <div className={ titleClasses }>
                    { isBrowserType ? <Browsers list={ [data.key.split(' ').slice(0, -1).join(' ')] } /> : null }
                    { this.renderTitle() }
                </div>
            </td>
            <td className='report__cell report__cell_count'>
                { data.count }
            </td>
            {
                this.props.timespan ?
                    <td className='report__cell report__cell_timespan'>
                        <Timespan min={ overall.earliest } max={ overall.latest } start={ data.earliest } finish={ data.latest } />
                    </td> : null
            }
        </tr>;
    },
    renderTitle: function() {
        var href = '/' + this.props.type + '/' + slug(this.props.data.key) + '/';

        if (this.props.type === 'browser') {
            return this.props.data.key;
        } else {
            return <a href={ href } title={ this.props.data.key } className='report__link'>
                { this.props.data.key }
            </a>
        }
    }
});
