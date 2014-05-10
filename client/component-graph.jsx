var _ = require('lodash');
var React = require('react');
var moment = require('moment');

module.exports = React.createClass({
    render: function() {
        var data = this.getGraphData();

        var width = data.length - 1;
        var height = 100;
        var viewBox = '0 0 ' + width + ' ' + height;

        var points = _.map(data, function(item, i) {
            return {
                x: i,
                y: height - (item.count / item.max * height * 0.8),
                value: item.count
            };
        });

        var path = _.reduce(points, function(d, point) {
            return d + 'L' + point.x + ' ' + point.y;
        }, 'M0 ' + height);

        return <div className="graph">
            <svg xmlns='http://www.w3.org/2000/svg' height={ this.props.height } viewBox={ viewBox } preserveAspectRatio='none'>
                <line x1='0' y1={ height } x2={ width } y2={ height } className='graph__axis' vectorEffect='non-scaling-stroke' />
                <path d={ path } className='graph__main' vectorEffect='non-scaling-stroke' />
            </svg>
        </div>;
    },
    getGraphData: function() {
        var overall = _.reduce(this.props.data, function(overall, item) {
            overall.max = _.max([overall.max, item.count]);
            // overall.min = 0; //_.min([overall.min, item.count]);

            return overall;
        }, {
            min: 0
        });

        var report = _.map(this.props.data, function(data, time) {
            var timestamp = +time;

            return _.extend(data, overall, {
                timestamp: timestamp,
            });
        });

        return _.sortBy(report, 'timestamp');
    }
});
