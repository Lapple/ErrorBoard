module.exports = {
    getInitialState: function() {
        return {
            width: 0,
            height: 300
        };
    },
    calculateWidth: function() {
        this.setState({
            width: $(this.getDOMNode()).width()
        });
    },
    componentDidMount: function() {
        this.calculateWidth();
        $(window).on('resize', this.calculateWidth);
    },
    componentWillUnmount: function() {
        $(window).off('resize', this.calculateWidth);
    }
};
