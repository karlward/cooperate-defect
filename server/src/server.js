var express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// configure Express
app.use(express.bodyParser());

server.listen(8000);

var cd = new Object(); // for cooperate-defect package globals
cd.data = 
{
    "game": {
      "id": 1,
      "durationMS": 180000,
      "elapsedMS": 130765
  },
  "screen": {
      "width": 800,
      "height": 600,
      "frameRate": 10
  },
  "players": [
      {
          "id": 0,
          "name": "Surya",
          "x": 120,
          "y": 185,
          "radius": 40,
          "mass": 40,
          "state": "cooperate",
          "effect": "none",
          "color": "#ff0000"
      },
      {
          "id": 1,
          "name": "Jon",
          "x": 402,
          "y": 300,
          "radius": 15,
          "mass": 15,
          "state": "defect",
          "effect": "point",
          "color": "#00ff00"
      },
      {
          "id": 2,
          "name": "Karl",
          "x": 20,
          "y": 40,
          "radius": 10,
          "mass": 10,
          "state": "defect",
          "effect": "none",
          "color": "#0000ff"
      }
  ],
  "orbs": [
      {
          "id": 0,
          "x": 88,
          "y": 690
      }
  ]
};

app.get('/orbs/:id', function (req, res) {
  if (!!(cd.data.orbs[req.params.id])) {
    var body = JSON.stringify(cd.data.orbs[req.params.id]);
    res.set('Content-Type', 'application/json');
    res.set('Content-Length', body.length);
    res.end(body);
  }
  else {
    // FIXME: error handling
  }
});

app.get('/orbs\/?$', function (req, res) {
  if (!!(cd.data.orbs)) {
    var body = JSON.stringify(cd.data.orbs);
    res.set('Content-Type', 'application/json');
    res.set('Content-Length', body.length);
    res.end(body);
  }
  else {
    // FIXME: error handling
  }
});

app.get('/players/:id', function(req, res) {
  if (!!cd.data.players[req.params.id]) { // FIXME: is this the right null test?
    var body = JSON.stringify(cd.data.players[req.params.id]);
    res.set('Content-Type', 'application/json');
    res.set('Content-Length', body.length);
    res.end(body);
  }
  else {
    // FIXME: error handling
  }
});

app.get('/players\/?$', function(req, res) {
  var body = JSON.stringify(cd.data.players);
  res.set('Content-Type', 'application/json');
  res.set('Content-Length', body.length);
  res.end(body);
  // FIXME: error handling
});

// update movement and cooperate/defect status for a player
app.patch('/players/:id', function(req, res) {
  //console.log('in patch for player ' + req.params.id);
  if (!!cd.data.players[req.params.id]) {
    //console.dir(req.body);
    if (!!(req.body.state) && ((req.body.state == 'cooperate') || (req.body.state == 'defect'))) {
      cd.data.players[req.params.id].state = req.body.state;
    }
    else {
      // FIXME: error handling
    }
    if (!!req.body.move) {
      if (req.body.move == 'up') {
        //console.log('move up');
        if (cd.data.players[req.params.id].y > 0) {
          cd.data.players[req.params.id].y = cd.data.players[req.params.id].y - 10;
        }
        else {
          cd.data.players[req.params.id].y = 0;
        }
        res.set('Status-Code', 200);
      }
      else if (req.body.move == 'down') {
        if (cd.data.players[req.params.id].y < cd.data.screen.height) {
          cd.data.players[req.params.id].y = cd.data.players[req.params.id].y + 10;
        }
        else {
          cd.data.players[req.params.id].y = cd.data.screen.height;
        }
        res.set('Status-Code', 200);
      }
      else if (req.body.move == 'left') {
        if (cd.data.players[req.params.id].x > 0) {
          cd.data.players[req.params.id].x = cd.data.players[req.params.id].x - 10;
        }
        else {
          cd.data.players[req.params.id].x = 0;
        }
        res.set('Status-Code', 200);
      }
      else if (req.body.move == 'right') {
        if (cd.data.players[req.params.id].x < cd.data.screen.height) {
          cd.data.players[req.params.id].x = cd.data.players[req.params.id].x + 10;
        }
        else {
          cd.data.players[req.params.id].x = cd.data.screen.width;
        }
        res.set('Status-Code', 200);
      }
      else {
        res.set('Status-Code', 400);
      }
    } 
  }
  else {
    // FIXME: error handling
  }
  res.end();
});

// serve index to browsers
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/games/:id', function(req, res) {
  //console.log('request for /games/' + req.params.id);
  //cd.data.players[0].x = Math.floor(Math.random() * cd.data.screen.width); // make Surya wiggle
  var body = JSON.stringify(cd.data); // FIXME: multiple games?
  res.set('Content-Type', 'application/json');
  res.set('Content-Length', body.length);
  res.end(body);
  // FIXME: error handling
});

// FIXME: /games should return a list of games
app.get('/games', function(req, res) {
  console.log('request for /games');
  // FIXME: error handling
});