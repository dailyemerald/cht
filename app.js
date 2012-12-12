var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express()
  , port = process.env.PORT || 5000
  , server = app.listen(port)
  , io = require('socket.io').listen(server);

var routes = require('./routes');

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set("view options", { layout: "layout.ejs" });
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

// 

io.sockets.on('connection', function (socket) {  
  socket.on('reset', function (data) {
    io.sockets.emit('hello', 'hello');
  });
});

// 
 
var ntwitter = require('ntwitter');

var twitter = new ntwitter({
  consumer_key: 'Twitter',
  consumer_secret: 'API',
  access_token_key: 'keys',
  access_token_secret: 'go here'
});

twitter.stream('statuses/filter', {'locations':'-122.75,36.8,-121.75,37.8,-74,40,-73,41'}, function(stream) {
  stream.on('data', function (data) {
    console.log(data);
    io.sockets.emit('tweet', data);
  });
});

