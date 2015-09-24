var React = require('react');

module.exports = React.createClass({
    render: function() {
        return <div className='notice' onClick={ this.props.onClick }>
            { this.props.count ? this.renderCount() : this.renderOrder() }
        </div>;
    },
    renderCount: function() {
        var count = this.props.count;
        var phrase = count + ' new items are not shown';

        if (count === 1) {
            phrase = 'One new item is not shown';
        }

        return <span>
            { phrase }. <span className='_u _i'>Show</span>
            <svg className='notice__icon' version='1.2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 896 1024' fill='currentColor'>
                <path d='M832 192H448c-35 0-64 29-64 64v512c0 35 29 64 64 64h384c35 0 64-29 64-64V256c0-35-29-64-64-64z m-64 512H512V320h256v384zM256 256h64v64h-64v384h64v64h-64c-35 0-64-29-64-64V320c0-35 29-64 64-64zM64 320h64v64H64v256h64v64H64c-35 0-64-29-64-64V384c0-35 29-64 64-64z' />
            </svg>
        </span>
    },
    renderOrder: function() {
        return <span>
            Actual table order has changed after update. <span className='_u _i'>Refresh</span>
            <svg className='notice__icon' version='1.2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 768 1024' fill='currentColor'>
                <path d='M320 576h448v-128h-448v128z m0 256h448v-128h-448v128z m0-640v128h448v-128h-448z m-241 256h78v-256h-36l-85 23v50l43-2v185z m110 206c0-36-12-78-96-78-33 0-64 6-83 16l1 66c21-10 42-15 67-15s32 11 32 28c0 26-30 58-110 112v50h192v-67l-91 2c49-30 87-66 87-113l1-1z' />
            </svg>
        </span>;
    }
});
