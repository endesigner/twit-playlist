var fs = require('fs');

var feed;

fs.readFile('feed.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    feed = JSON.parse(data);
    feed.forEach(function(t){
        console.log(t.text);
    });
});

exports.feed = feed;
