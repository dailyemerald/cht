var socket = io.connect(window.location.hostname);

var tweet_embed = function(tweet) {
	tweet.date = new Date(tweet.created_at);
	var human_date = 'humandatehere';
	var url = 'blahblah'
	var s = '';
	s += '<blockquote class="twitter-tweet">';
	s += '<p>';
	s += tweet.text;
	s += '</p>&mdash;'
	//s += 'SOURCE';
	s += '<a href="https://twitter.com/twitterapi/status/' + tweet.id_str + '" data-datetime="' + tweet.date.toISOString() + '">';
	//s += human_date;
	s += '</a>';
	s += '</blockquote>';
	return s;
}

socket.on('tweet', function (tweet) {
	console.log('tweet', tweet);
	var embed_html = tweet_embed(tweet);
	console.log('embed_html', embed_html);
	$('#status').prepend(embed_html);
	$.getScript("//platform.twitter.com/widgets.js");
});