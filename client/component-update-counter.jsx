var React = require('react');
var moment = require('moment');

var cx = React.addons.classSet;

module.exports = React.createClass({
    render: function() {
        var count = this.props.count;
        var phrase = (count === 1) ? 'One update' : count + ' updates';

        var classes = cx({
            'counter': true,
            'counter_hidden': count === 0
        });

        return <div className={ classes } onClick={ this.props.onClick } title='Refresh table'>
            { phrase } since { moment(this.props.since).format('LT') }
        </div>;
    }
});
