var path = require('path');
var NeDB = require('nedb');

var config = require('../package.json').config;
var db = new NeDB({
    filename: path.join(process.cwd(), config.dbfile),
    autoload: true
});

module.exports = db;
