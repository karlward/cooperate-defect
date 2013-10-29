var express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(8000);

var cd = new Object(); // for cooperate-defect package globals
cd.data = {
  "game": {"id": 1, "durationMS": 180000, "elapsedMS": 130765},
  "screen": {"width": 800, "height": 600, "frameRate": 10},
  "players": [ {"id": 1, "name": "surya", "x": 120, "y": 185, "radius": 40, "mass": 40, 
               "state": "cooperate", "effect": "none","color": "#ff0000"},
               {"id": 2, "name": "jon", "x": 402, "y": 300, "radius": 15, "mass": 15, 
                "state": "defect", "effect": "point", "color": "#00ff00"} ],
  "orbs": [ {"id": 42, "x": 88, "y": 690} ]
};

// serve index to browsers
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/games/:id', function(req, res) {
  //console.log('request for /games/' + req.params.id);
  cd.data.players[0].x = Math.floor(Math.random() * cd.data.screen.width); // make Surya wiggle
  var body = JSON.stringify(cd.data); // FIXME: multiple games?
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', body.length);
  res.end(body);
})

// FIXME: /games should return a list of games
app.get('/games', function(req, res) {
  console.log('request for /games');
});