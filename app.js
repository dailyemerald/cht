var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , app = express()
  , port = process.env.PORT || 5000
  , server = app.listen(port)
  , io = require('socket.io').listen(server)
  , Parse = require('parse').Parse
  , sanitize = require('validator').sanitize
 
Parse.initialize(process.env.PARSE_APP_ID, process.env.PARSE_JAVASCRIPT_KEY);
var MessageObject = Parse.Object.extend("Message");

io.set('log level', 1);

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
app.get('/about', routes.about);

var trim = function (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

var save_message = function(data) {
  var start_save_message = new Date();
  var message = new MessageObject();
   
  message.set("name", data.name);
  message.set("created_at", data.created_at);
  message.set("text", data.text);
  message.set("admin", data.admin);

  message.save(null, {
    success: function(message) {
      var save_time = new Date() - start_save_message;
      console.log("Saved in", save_time, "ms with ID:", message.id);
    },
    error: function(messge, error) {
      var save_time = new Date() - start_save_message;
      console.log("!Save failed!", message, error, save_time);
    }
  });
}

var check_if_admin = function(data) {
  var name = data.name;
  var secret = process.env.ADMIN_SECRET;
  data.admin = false;
  console.log("before:", data);
  if (name.indexOf(secret) >= 0) {
    data.name = trim( data.name.replace(secret, '') );
    data.admin = true;
  }
  console.log("after:", data);
  return data;
}

io.sockets.on('connection', function(socket) {  

  console.log('! Client connected.');
  socket.emit('status', 'Loading messages...');

  var find_start = new Date();
  var query = new Parse.Query(MessageObject);
  query.descending("createdAt");
  query.find({
    success: function(messages) {
      socket.emit('backlog', messages);
      socket.emit('status', '');
      load_time = new Date() - find_start;
      console.log('loaded backlong in', load_time, 'ms');
    }
  });

  socket.on('send_message', function(data) {
    data.created_at = new Date();
    
    data.name = sanitize(data.name).xss();
    data.text = sanitize(data.text).xss();

    data = check_if_admin(data);
    io.sockets.emit('broadcast_message', data);
    save_message(data);
  });

});
