(function() {

	var socket = io.connect(window.location.hostname);

	var textTemplate = "" +
	"<li class='message'>" +
	"<%= text %><br>" +
	"<small>Posted <%= human_time.toLowerCase() %> by <%= name %>.</small>" + 
	"</li>";

	var tpl = _.template(textTemplate);

	var strip = function (html) {
	   var tmp = document.createElement("DIV");
	   tmp.innerHTML = html;
	   return tmp.textContent || tmp.innerText;
	}

	var prepare = function(message) {
		message.human_time = moment(message.created_at.iso).calendar();
		return message;
	}

	socket.on('status', function (data) {
		console.log('status', data);
		$('#status').html(data);
	});

	socket.on('backlog', function(data) {
		console.log('backlog', data);
		_.each(data, function(data) {
			$('#messages').append( tpl(prepare(data)) );
		});
	});

	socket.on('broadcast_message', function(data) {
		console.log('broadcast_message', data);
		$("#messages").prepend( tpl(prepare(data)) );
	});

	var send_message = function() {
		var text = $('#message').val()
		  , name = $('#name').val();

		text = strip(text);

		if (text.length > 0 && name.length > 0) {
			socket.emit('send_message', {'name': name, 'text': text});
			$('#message').val('');
			$('#status').html('');
		} else {
			$('#status').html('Name and message, please.');
		}
	}

	$(document).ready(function() {
		/*
		$('textarea').keypress(function(e) {
	        if(e.which == 13) {
	            send_message();
	        }
	    });
		*/
		$('#send').click(function() {		
			send_message();
		});
	});

})();

