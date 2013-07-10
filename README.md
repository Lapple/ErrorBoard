[![build status](https://secure.travis-ci.org/Lapple/ErrorBoard.png)](http://travis-ci.org/Lapple/ErrorBoard)
# ErrorBoard.js

Track and fix JavaScript errors fired by your visitor's browsers.

### Prerequisites

* Node.js and NPM
* MongoDB
* A free port

### Installation

    $ mkdir ErrorBoard
    $ git clone git://github.com/Lapple/ErrorBoard.git ErrorBoard
    $ cd ErrorBoard
    $ npm install -d

## Configuration

Main configuration file is `config/main.js`. Here are the example contents:

```js
// Please make sure you don't remove
// this wrapper
module.exports = {

  database: {
    name       : 'flatora_js'
  , collection : 'log'
  , host       : '127.0.0.1'
  , port       : 27017

    // Options for insert command
    // http://mongodb.github.com/node-mongodb-native/api-generated/server.html#Server
  , serverOptions: {}

    // Additional options for the collection
    // http://mongodb.github.com/node-mongodb-native/api-generated/db.html#Db
  , collectionOptions: {
      w: 0
    }
  }

  // App settings
, app: {
    host: '127.0.0.1'
  , port: 3000
  , output: [
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

Edit `config/i18n.js` to add more languages. English and Russian are already bundled.

## Running

After you have everything installed and configured, run:

    $ node errorboard

Please note that the misconfiguration handling is not yet implemented.

Once the app has started successfully, navigate to the `http://app.host:app.port/stats/` (*e.g.* http://127.0.0.1:3000/stats) to get the error data. Similar error messages are not grouped, however the one can navigate to *Scripts* tab to get the idea which file:line pairs produce most errors.

## Browser snippet

The first time you ran http://127.0.0.1:3000/stats you probably won't see any errors since they were not being sent to the ErrorBoard. To start sending errors, make sure that the following JavaScript snippet is the first code, executed on your pages:

```js
// JavaScript
window.onerror = function( errorMsg, url, lineNumber ) {
  var e = encodeURIComponent;
  ( new Image() ).src = 'http://127.0.0.1:3000/pusherror/?message=' + e( errorMsg ) +
                                                        '&url='     + e( url ) +
                                                        '&line='    + e( lineNumber );
};
```

```coffee
# or CoffeeScript
window.onerror = ( errorMsg, url, lineNumber ) ->
  e = encodeURIComponent
  ( new Image() ).src = "http://127.0.0.1:3000/pusherror/?message=#{ e errorMsg }&url=#{ e url }&line=#{ e lineNumber }"
```

Replace `127.0.0.1:3000` with the address and the port number your ErrorBoard is running (configured in `config/main.js`).

## Screenshots

![Errors page](http://i.imgur.com/gcrFR.png)

![Scripts page](http://i.imgur.com/boQf4.png)

![Browsers page](http://i.imgur.com/d9v5P.png)

![Pages breakdown](http://i.imgur.com/H5p4S.png)

## Testing

Started writing some basic tests:

    $ make test

## TODO

* Improve test coverage
* Better error handling
* Command-line settings

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
