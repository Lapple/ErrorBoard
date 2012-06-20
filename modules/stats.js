var mongodb = require('mongodb'),
	config  = require('./../config/main').database,
	StatsProvider;

StatsProvider = function() {
	this.dbName         = config.name;
	this.collectionName = config.collection;
	this.db             = new mongodb.Db( this.dbName, new mongodb.Server( config.host, config.port, config.serverOptions ), config.collectionOptions )
		.open(function ( err, client ) {
			if ( err ) throw err;
			this.collection = new mongodb.Collection( client, this.collectionName );
		}.bind( this ));
};

StatsProvider.prototype.getErrorInfo = function( query, all, callback ) {
	var condition = {
			'message.url'   :  query.file,
			'message.line'  : +query.line
		},
		keys = {
			'message.agent.browser': true,
			'message.agent.version': true
		};

	if ( query.error ) {
		condition['message.message'] = query.error;
	} else {
		keys['message.message'] = true;
	}

	if ( !all ) {
		condition['message.fixed'] = false;
	}

	this.collection.group(
		keys,
		condition,
		{ 'errSum': 0, 'latest': 0, 'fixed': true },
		function ( obj, prev ) {
			prev.errSum++;
			prev.latest = obj.timestamp > prev.latest ? obj.timestamp : prev.latest;
			prev.fixed  = obj.message.fixed === false ? false : prev.fixed;
		},
		true,
		function( err, docs ) {
			if ( err ) throw err;

			callback({
				browsers: docs.sort(function( a, b ) { return b.latest - a.latest })
			});
		}
	)
};

StatsProvider.prototype.getErrors = function( type, all, callback ) {
	var settings  = {},
		condition = {};

	if ( !all ) {
		condition['message.fixed'] = false;
	}

	switch (type) {
		case 'files':
			settings.keys  = { 'message.url': true, 'message.line': true };
			break;

		case 'browsers':
			settings.keys  = { 'message.agent.browser': true, 'message.agent.version': true };
			break;

		case 'pages':
			settings.keys  = { 'message.page': true };
			break;

		// case 'errors':
		default:
			settings.keys  = { 'message.message': true, 'message.url': true, 'message.line': true };
			break;
	}

	this.collection.group(
		settings.keys,
		condition,
		{
			'errSum'   : 0,
			'latest'   : 0,
			'hotness'  : 0,
			'lifespan' : 0,
			'fixed'    : true,
			'earliest' : Date.now(),
			'browsers' : {}
		},
		function ( obj, prev ) {
			prev.errSum++;
			prev.latest   = obj.timestamp > prev.latest   ? obj.timestamp : prev.latest;
			prev.earliest = obj.timestamp < prev.earliest ? obj.timestamp : prev.earliest;
			prev.fixed    = obj.message.fixed === false ? false : prev.fixed;
			prev.browsers[obj.message.agent.browser] = true;
		},
		function ( obj ) {
			obj.lifespan = obj.latest - obj.earliest;
			obj.hotness  = Date.now() - obj.latest;
		},
		true,
		function( err, docs ) {
			if ( err ) throw err;
			
			callback({
				title  : settings.title,
				type   : type,
				all    : !!all,
				fields : docs.sort(function( a, b ) {
					return b.latest - a.latest;
				})
			});
		}
	);
};

StatsProvider.prototype.fixError = function( query ) {
	var condition = {
		'message.url'  :  query.file,
		'message.line' : +query.line
	};

	if ( query.error ) {
		condition['message.message'] = query.error;
	}

	this.collection.update(
		condition,
		{ $set: { 'message.fixed': true } },
		{ multi: true }
	);
};

module.exports = StatsProvider;

