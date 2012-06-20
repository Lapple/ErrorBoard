# ErrorBoard.js

Track and fix JavaScript errors fired by your visitor's browsers

## Installation

	$ npm install errorboard.js -g

## Configuration

Main configuration file is located in `path/to/module/config/main.js`. Here are the example contents:

```js
// Please make sure you don't remove
// this wrapper
module.exports = {

  database: {
    name       : 'flatora_js'
  , collection : 'log'
  , host       : '127.0.0.1'
  , port       : 27017

    // Optional options for insert command
    // http://mongodb.github.com/node-mongodb-native/api-generated/server.html#Server
  , serverOptions: {}

    // Additional options for the collection
    // http://mongodb.github.com/node-mongodb-native/api-generated/db.html#Db
  , collectionOptions: {}
  }

  // App settings
, app: {
    host: '127.0.0.1'
  , port: 3000
    output: [
      'console'  // Output to stdout
    , 'database' // Log to database
    ]
  }

  // The website that is being observed by the ErrorBoard
, observedSite: {
    title : 'Flatora'
  , url   : 'http://local.flatora.ru/'
  }
};
```

You can also add custom languages — just edit `path/to/module/config/i18n.js`. English and Russian are already bundled.

## Running

After you have everything installed and configured, run

	$ errorboard

from your terminal.

## TODO

* Command-line settings
* More docs
* Higher test coverage
* Better error handling

## License

(The MIT License)

Copyright (c) 2012 Aziz Yuldoshev &lt;yuldoshev.aziz@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
