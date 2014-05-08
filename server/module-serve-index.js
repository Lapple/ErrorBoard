var fs = require('fs');
var path = require('path');

var express = require('express');
var app = express();
var pathToIndex = path.join(__dirname, '..', 'client/public', 'index.html');

app.use(function(req, res) {
    fs.createReadStream(pathToIndex).pipe(res);
});

module.exports = app;
