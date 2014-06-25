var fs = require('fs');
var transform = require('react-tools').transform;

module.exports = function() {
    require.extensions['.jsx'] = function(module, filename) {
        var src = fs.readFileSync(filename, {encoding: 'utf8'});

        try {
            src = transform('/** @jsx React.DOM */' + src);
        } catch (e) {
            throw new Error('Error transforming ' + filename + ' to JSX: ' + e.toString());
        }

        module._compile(src, filename);
    };
};
