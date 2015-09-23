var React = require('react/addons');
var cx = React.addons.classSet;

module.exports = React.createClass({
    render: function() {
        var icons = {
            dashboard: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='currentColor'><path d='M512 320h-64v-64h64v64z m256 192h-64v64h64v-64zM320 320h-64v64h64v-64z m-64 192h-64v64h64v-64z m704-352l-32-32-416 320c-4-1-64 0-64 0-35 0-64 29-64 64v64c0 35 29 64 64 64h64c35 0 64-29 64-64v-59l384-357zM858 422c12 39 19 80 19 122 0 219-178 397-397 397S83 763 83 544s178-397 397-397c77 0 148 22 209 60l60-60c-76-52-169-83-269-83C215 64 0 279 0 544s215 480 480 480 480-215 480-480c0-66-13-129-38-186l-64 64z' /></svg>,
            messages: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='currentColor'><path d='M448 147c201 0 365 164 365 365S649 877 448 877 83 713 83 512s164-365 365-365m0-83C201 64 0 265 0 512s201 448 448 448 448-201 448-448S695 64 448 64z m64 192H384v320h128V256z m0 384H384v128h128V640z' /></svg>,
            browsers: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='currentColor'><path d='M320 192h64v64h-64V192zM192 192h64v64h-64V192zM64 192h64v64H64V192zM832 832H64V320h768V832zM832 256H448v-64h384V256zM896 192c0-35.35-28.65-64-64-64H64c-35.35 0-64 28.65-64 64v640c0 35.35 28.65 64 64 64h768c35.35 0 64-28.65 64-64V192z' /></svg>,
            scripts: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='currentColor'><path d='M608 192l-96 96 224 224L512 736l96 96 288-320L608 192zM288 192L0 512l288 320 96-96L160 512l224-224L288 192z' /></svg>,
            pages: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='currentColor'><path d='M128 320h256v64H128v-64z m0 192h256v-64H128v64z m0 128h256v-64H128v64z m704-320H576v64h256v-64z m0 128H576v64h256v-64z m0 128H576v64h256v-64z m128-384v576c0 35-29 64-64 64H544l-64 64-64-64H64c-35 0-64-29-64-64V192c0-35 29-64 64-64h352l64 64 64-64h352c35 0 64 29 64 64z m-512 32l-32-32H64v576h384V224z m448-32H544l-32 32v544h384V192z' /></svg>,
            metadata: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='currentColor'><path d='M448 640h256v64H448v-64z m-192 64l192-192-192-192-48 48 144 144-144 144 48 48z m640-512v640c0 35-29 64-64 64H64c-35 0-64-29-64-64V192c0-35 29-64 64-64h768c35 0 64 29 64 64z m-64 0H64v640h768V192z' /></svg>
        };

        return <div className='nav'>
            { this.logo() }
            { this.link('/dashboard/', 'Dashboard', icons.dashboard) }
            { this.link('/messages/', 'Messages', icons.messages) }
            { this.link('/browsers/', 'Browsers', icons.browsers) }
            { this.link('/scripts/', 'Scripts', icons.scripts) }
            { this.link('/pages/', 'Pages', icons.pages) }
            { this.link('/meta/', 'Metadata', icons.metadata) }
        </div>;
    },
    link: function(pathname, title, icon) {
        var classes = cx({
            'nav__link': true,
            'nav__link_active': this.props.pathname.indexOf(pathname) === 0
        });

        return <a className={ classes } href={ pathname } title={ title }>
            <span className='nav__icon'>
                { icon }
            </span>
            { title }
        </a>;
    },
    logo: function() {
        return <div className='logo nav__logo'>
            <a className='logo__info tooltip__parent' href='https://github.com/Lapple/ErrorBoard'>
                <svg version='1.2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M13.839 17.525c-.006.002-.559.186-1.039.186-.265 0-.372-.055-.406-.079-.168-.117-.48-.336.054-1.4l1-1.994c.593-1.184.681-2.329.245-3.225-.356-.733-1.039-1.236-1.92-1.416-.317-.065-.639-.097-.958-.097-1.849 0-3.094 1.08-3.146 1.126-.179.158-.221.42-.102.626.12.206.367.3.595.222.005-.002.559-.187 1.039-.187.263 0 .369.055.402.078.169.118.482.34-.051 1.402l-1 1.995c-.594 1.185-.681 2.33-.245 3.225.356.733 1.038 1.236 1.921 1.416.314.063.636.097.954.097 1.85 0 3.096-1.08 3.148-1.126.179-.157.221-.42.102-.626-.12-.205-.369-.297-.593-.223z'/>
                    <circle cx='13' cy='6.001' r='2.5'/>
                </svg>
            </a>
            ErrorBoard
        </div>;
    }
});
