var _ = require('lodash');
var React = require('react');

var cx = React.addons.classSet;
var Timespan = require('./component-timespan.jsx');
var Browsers = require('./component-browsers.jsx');

module.exports = React.createClass({
    render: function() {
        var data = this.props.data;
        var timespan = this.props.timespan;

        var isBrowserType = this.props.type === 'browsers';
        var delta = data.delta || 0;

        var rowClasses = cx({
            'report__row': true,
            'report__row_clickable': _.isFunction(this.props.onClick),
        });

        var titleClasses = cx({
            'report__cut': true,
            'report__mono': !isBrowserType
        });

        return <tr className={ rowClasses } onClick={ this.props.onClick }>
            <td className='report__cell report__cell_cut'>
                { data.browsers ? <Browsers list={ data.browsers } align='right' /> : null }
                <div className={ titleClasses } title={ data.key }>
                    { isBrowserType ? <Browsers list={ [data.key.split(' ').slice(0, -1).join(' ')] } /> : null }
                    { data.key }
                </div>
            </td>
            <td className='report__cell report__cell_count'>
                { data.count - delta }
            </td>
            <td className='report__cell report__cell_delta'>
                { delta > 0 ? '+' + delta : null }
            </td>
            {
                timespan ?
                    <td className='report__cell report__cell_timespan'>
                        <Timespan min={ timespan.earliest } max={ timespan.latest } start={ data.earliest } finish={ data.latest } />
                    </td> : null
            }
        </tr>;
    }
});
