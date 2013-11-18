//TODO: Send catched list if twitter is unavailable.
//TODO: Catch only video id's and song-artist names instead of whole twit feeds.
var Twit = require('twit'),
    fs = require('fs'),
    express = require('express');

var app = express();
app.use(express.static(__dirname + '/public'));

var isFunction = function(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

var feed;
var reloadFeed = function(callback) {
    fs.readFile('feed.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.length <= 0) {
            return;
        }

        feed = JSON.parse(data);
        console.log(feed.length);
        console.log('Cache reloaded!');

        if (isFunction(callback)) {
            callback();
        }
    });
}
reloadFeed();


var getTwits = function(options, callback) {
    var T = new Twit({
        consumer_key:         'tvnzX2oxShBFjGs7WOwmQ' ,
        consumer_secret:      'Dm4lMTIJzANvo6Jz3jMiAA8LpSxLXDWYgFAX9lRBquI' ,
        access_token:         '559562161-OkhXVvB1GHnkmjro5ywqL6yNzuEax5ry8r1md2eC' ,
        access_token_secret:  'TZIINWfj5Nv4NQKFI0Bi8G3Kepzmu6thKfAfJLnk'
    });
    T.get('statuses/user_timeline', options, function(err, reply){
        callback(reply);
    });

}

app.get('/playlist', function(req, res){
    var response = function() {
            console.log('Respond :)');
            var list = [];
            feed.forEach(function(item){
                var url = item.entities.urls[0];
                // Exclude twits without urls
                if (!url) {
                    return;
                }
                // Extract video id from YT url and push to list.
                var u = url.expanded_url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/)
                if (u) {
                    list.push(u[7]);
                }
            });
            res.send(list);
    };

    getTwits({screen_name: req.query.screen_name, count: 1}, function(twits) {
        console.log('Get twits form ' + req.query.screen_name);
        if (!feed || (twits[0].user.screen_name != feed[0].user.screen_name) || (twits[0].id_str > feed[0].id_str)) {
            console.log('There are new posts! Rebuilding cache...');
            getTwits({screen_name: req.query.screen_name, count: 100}, function(twits){
                fs.writeFile("feed.json", JSON.stringify(twits), function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("Updating cache...");
                        reloadFeed(function(){
                            response();
                        });
                    }
                });
            });
        } else {
            console.log('No updates.');
            reloadFeed(function(){
                response();
            });
        }
    });
});
app.listen(3000);
