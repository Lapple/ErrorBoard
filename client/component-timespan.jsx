var _ = require('lodash');
var React = require('react');

var percent = function(value) {
    return Math.floor(value * 100);
};

module.exports = React.createClass({
    render: function() {
        var timespan = this.props.max - this.props.min;
        var start = (this.props.start - this.props.min) / timespan;
        var finish = (this.props.finish - this.props.min) / timespan;

        var position = {
            left: percent(start) + '%',
            right: (100 - percent(finish)) + '%'
        };

        return <div className='timespan'>
            <div className='timespan__bar' style={position} />
            <div className='timespan__point timespan__point_start' style={_.pick(position, 'left')} />
            <div className='timespan__point timespan__point_end' style={_.pick(position, 'right')} />
        </div>
    }
});
