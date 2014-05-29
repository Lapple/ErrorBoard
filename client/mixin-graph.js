module.exports = {
    getInitialState: function() {
        return {width: 0};
    },
    calculateWidth: function() {
        this.setState({
            width: this.getDOMNode().offsetWidth
        });
    },
    componentDidMount: function() {
        this.calculateWidth();
        window.addEventListener('resize', this.calculateWidth);
    },
    componentWillUnmount: function() {
        window.removeEventListener('resize', this.calculateWidth);
    }
};
