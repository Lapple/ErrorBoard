var _ = require('lodash');
var React = require('react');
var moment = require('moment');

var GraphMixin = require('./mixin-graph');

var HOUR = 60 * 60 * 1000;
var Y_CAP = 0.9;

module.exports = React.createClass({
    mixins: [GraphMixin],
    render: function() {
        var plot = this.plot();

        var width = this.state.width;
        var height = this.state.height;
        var viewBox = '-0.5 0 ' + width + ' ' + height;

        var points = _.map(plot.points, function(item, index, array) {
            return {
                x: index * (width / (array.length - 1)),
                y: height - (item.count / plot.max * height * Y_CAP),
                value: item.count,
                time: item.timestamp
            };
        });

        var path = _.reduce(points, function(d, point, index) {
            var tool = index === 0 ? 'M' : 'L';
            return d + tool + point.x + ' ' + point.y;
        }, '');

        var circles = _.map(points, function(point, index) {
            if (point.value > 0) {
                return <circle key={ point.time } cx={ point.x } cy={ point.y } r='1' />;
            }
        });

        var days = _.map(points, function(point, index) {
            if (point.time === moment(point.time).startOf('day').valueOf()) {
                var x = Math.floor(point.x);
                var isLeft = (point.x / width) < 0.95;

                var labelOffset = isLeft ? 5 : -5;
                var labelAnchor = isLeft ? 'start' : 'end';

                return <g key={ point.time }>
                    <text x={ x + labelOffset } y='10' textAnchor={ labelAnchor } className='graph__day'>
                        { moment(point.time).format('DD.MM') }
                    </text>
                    <line x1={ x } y1='0' x2={ x } y2={ height } className='graph__axis' />
                </g>;
            }
        });

        return <div className='graph'>
            <svg xmlns='http://www.w3.org/2000/svg' width={ width } height={ height } viewBox={ viewBox }>
                <line x1='0' y1={ height } x2={ width } y2={ height } className='graph__axis' />
                { days }
                <path d={ path } className='graph__main' />
                { circles }
            </svg>
        </div>;
    },
    plot: function() {
        var data = this.props.data;
        var points = [];
        var max = 0;

        for (var t = this.props.from; t <= this.props.to; t += HOUR) {
            var count = 0;

            if (data[t]) {
                count = data[t].count;
                max = Math.max(max, count);
            }

            points.push({
                timestamp: t,
                count: count
            });
        }

        return {
            points: points,
            max: max
        };
    }
});
