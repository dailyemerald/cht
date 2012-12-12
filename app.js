var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express()
  , port = process.env.PORT || 5000
  , ntwitter = require('ntwitter');

var server = app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});

var io = require('socket.io').listen(server);
io.set('log level', 1);

var routes = require('./routes');

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

app.get('/', routes.index); 

// --- below is app code --- //

io.sockets.on('connection', function (socket) {  
  console.log('io.sockets event: connection');
  socket.on('reset', function (data) {
    console.log('io.sockets event: reset');
    io.sockets.emit('setup', {text: 'not implemented, but hello agian.'});
  });
});
 
var twitter = new ntwitter({
  consumer_key: 'AtrVDe28zXUCGOnthGwow',
  consumer_secret: 'fveZ5Bm3E326J6Oa9FQ5Pgnwio90fdZgb332bCbnk',
  access_token_key: '18558963-XJ3NDts26wlzeCC52Dq4vVNjfl0yrexJwEhfybUx',
  access_token_secret: 'Gh5AGGQTP87KX9ttwCyhAhO2Z7qly2VDmGAmjeoccE'
});

console.log(twitter); //useful for debugging twitter connection


//twitter.stream('statuses/filter', {'locations':'-122.75,36.8,-121.75,37.8,-74,40,-73,41'}, function(stream) {
twitter.stream('statuses/filter', {'track':'clackamas'}, function(stream) {
  stream.on('data', function (data) {
    console.log('new tweet with id:', data);
    io.sockets.emit('tweet', data);
  });
  
  stream.on('error', function(a, b, c, d, e) {
    console.log('twitter error:', a, b, c, d, e);
    console.log(twitter);
  });

});
