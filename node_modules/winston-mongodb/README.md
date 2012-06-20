# winston

A MongoDB transport for [winston][0].

## Motivation
`tldr;?`: To break the [winston][0] codebase into small modules that work together.

The [winston][0] codebase has been growing significantly with contributions and other logging transports. This is **awesome**. However, taking a ton of additional dependencies just to do something simple like logging to the Console and a File is overkill.  

## Usage
``` js
  var winston = require('winston');
  
  //
  // Requiring `winston-mongodb` will expose 
  // `winston.transports.MongoDB`
  //
  require('winston-mongodb').MongoDB;
  
  winston.add(winston.transports.MongoDB, options);
```

The MongoDB transport takes the following options. 'db' is required:

* __level:__ Level of messages that this transport should log, defaults to 'info'.
* __silent:__ Boolean flag indicating whether to suppress output, defaults to false.

* __db:__ The name of the database you want to log to. *[required]*
* __collection__: The name of the collection you want to store log messages in, defaults to 'log'.
* __safe:__ Boolean indicating if you want eventual consistency on your log messages, if set to true it requires an extra round trip to the server to ensure the write was committed, defaults to true.
* __host:__ The host running MongoDB, defaults to localhost.
* __port:__ The port on the host that MongoDB is running on, defaults to MongoDB's default port.
* __errorTimeout:__  Reconnect timeout upon connection error from Mongo, defaults to 10 seconds (10000).
* __timeoout:__ Timeout for keeping idle connection to Mongo alive, defaults to 10 seconds (10000).

*Metadata:* Logged as a native JSON object.

## Installation

### Installing npm (node package manager)

``` bash
  $ curl http://npmjs.org/install.sh | sh
```

### Installing winston-mongodb

``` bash
  $ npm install winston
  $ npm install winston-mongodb
```

#### Author: [Charlie Robbins](http://blog.nodejitsu.com)
#### Contributors: [Kendrick Taylor](https://github.com/sktaylor), [Yosef Dinerstein](https://github.com/yosefd)

[0]: https://github.com/indexzero/winston