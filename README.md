## ErrorBoard

Track and fix JavaScript errors fired by your visitor's browsers.

### Screenshots

![Messages view](http://i.imgur.com/Db3kudo.png)

![Details view](http://i.imgur.com/I4h33hr.png)

![Browsers view](http://i.imgur.com/99OEaGy.png)

### Prerequisites

* Node.js and NPM
* A free port

### Installation

    $ git clone git://github.com/Lapple/ErrorBoard.git
    $ cd ErrorBoard
    $ npm install

### Configuration

Edit the `config` section of `package.json`:

```js
// ...
"config": {
    "dbfile": "db", // path to database file
    "port": 3000    // web application port
},
// ...
```

### Running

After you have everything installed and configured, run:

    npm start

Once the app has started successfully, navigate to `localhost` at specified port (*e.g.* http://127.0.0.1:3000/) to get the error data. Similar error messages are not grouped, however the one can navigate to *Scripts* tab to get the idea which file:line pairs produce most errors.

### Browser snippet

The first time you visited http://127.0.0.1:3000/ you probably won't see any errors since they were not being sent to the board. To start sending errors, make sure that the following JavaScript snippet is the first code, executed on your pages:

```js
// JavaScript
window.onerror = function( message, url, line, column, error ) {
  var e = encodeURIComponent;
  ( new Image() ).src = 'http://127.0.0.1:3000/error?message=' + e( message ) +
                                                   '&url='     + e( url ) +
                                                   '&line='    + e( line ) +
                          ( error && error.stack ? '&stack='   + e( error.stack ) : '' ) +
                                        ( column ? '&column='  + e( column ) : '' );
};
```

Replace `127.0.0.1:3000` with the address and the port number your ErrorBoard is running.

### License

(The MIT License)

Copyright (c) 2014 Aziz Yuldoshev &lt;yuldoshev.aziz@gmail.com&gt;

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

