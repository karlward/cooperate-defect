var express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app);
var url = require('url');

//configure Express
app.use(express.bodyParser());
app.use(express.static(__dirname + '/../../browser/src'));
server.listen(8000);
var cd = require('./cd');

//var currentTime = 0; // FIXME: global

var util = require('./util');

var gameplay = require('./gameplay');

//TIMER STUFF
setInterval(gameplay.updateFrame, 1000 / cd.data.screen.frameRate);
setTimeout(gameplay.gameOver,cd.data.game["durationMS"]);
setInterval(gameplay.updateCountdown,1000)

//END TIMER STUFF


//ROUTES
app.get('/orbs/:id', function (req, res) {
  if (!!(cd.data.orbs[req.params.id])) {
    var body = JSON.stringify(cd.data.orbs[req.params.id]);
    res.set('Content-Type', 'application/json');
    res.set('Content-Length', body.length);
    res.end(body);
  }
  else {
    //console.log('req for non-existent orb id');
    res.statusCode = 400;
    res.end();
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
    res.statusCode = 400;
    res.end();
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
    res.statusCode = 400;
    res.end();
  }
});

app.get('/players\/?$', function(req, res) {
  var body = JSON.stringify(cd.data.players);
  res.set('Content-Type', 'application/json');
  res.set('Content-Length', body.length);
  res.end(body);
  // FIXME: error handling
});

//update movement and cooperate/defect status for a player
app.patch('/players/:id', function(req, res) {
  //console.log('in patch for player ' + req.params.id);
  var id = Number(req.params.id);
  if (!!cd.data.players[id]) {
    //console.dir(req.body);
    if (!!req.body.state) {
      if ((req.body.state === 'cooperate') || (req.body.state === 'defect')) {
        //console.log('setting player ' + req.params.id + ' to state ' + req.body.state);
        cd.data.players[req.params.id].state = req.body.state;
        console.log("State changed for player " + id + ": " + cd.data.players[id].state);
        if (req.body.state === 'cooperate') {

        }
        else if (req.body.state === 'defect') {
          gameplay.ensureUngrouped(id);
        }
      }
      else {
        //console.log('state change specified but it is not cooperate or defect: ' + req.body.state);
        res.statusCode = 400;
      }
    }
    if (!!req.body.move && (req.body.move.match(/^(up|down|left|right)$/))) {
      gameplay.movePlayer(id, req.body.move);
    }
  }
  else {
    console.log('not a move or a state change');
    res.statusCode = 400;
  } res.end();  
});

//create a new player
app.post('/players\/?$', function(req, res) {
  console.log('in post for new player');
  var newPlayer = {
      "id": cd.data.players.length,
      "name": userName, // FIXME: implement
      "x": Math.floor(Math.random() * cd.data.screen.width), // FIXME: should find an empty spot on screen
      "y": Math.floor(Math.random() * cd.data.screen.height),
      "xSpeed": 0,
      "ySpeed": 0,
      "radius": cd.defaultRadius,
      "mass": cd.defaultMass,
      "state": cd.defaultState,
      "effect": "new",
      "color": util.randomRGB(),
      "score": 0,
      "currentRank":cd.data.players.length,
      "numberOfLinks": 0,
  };

  var newLeaderBoardItem  = {
      "index": cd.data.players.length, 
      "color":newPlayer.color, 
      "playerId": newPlayer.id, 
      "name": userName
  };
    cd.data.leaderBoard.push(newLeaderBoardItem);
  console.log("New Player added !");
  cd.data.players.push(newPlayer);
  body = JSON.stringify(cd.data.players[newPlayer.id]);
  //console.log('body is ' + body);
  //res.statusCode = 200;
  res.end(body);
});

app.get('/games/:id', function(req, res) {
  //console.log('request for /games/' + req.params.id);
  if (cd.data.game.id === Number(req.params.id)) { // FIXME: hardcoded single game id
    var body = JSON.stringify(cd.data); // FIXME: multiple games?
    res.set('Content-Type', 'application/json');
    res.set('Content-Length', body.length);
    res.end(body);
  }
  else {
    res.statusCode = 400;
  }
  res.end();
});

//FIXME: /games should return a list of games
app.get('/games', function(req, res) {
  console.log('request for /games');
  // FIXME: error handling
});

var userName= null; // FIXME: is this necessary?
app.get('/form_action.asp', function(req, res) { // FIXME: rename route, consider replacement with static file or SPA
  // res.writeHead(, {"Content-Type":"text/plain"});

  var params = url.parse(req.url,true).query;
  userName= params["id"];
  console.log(params);
  // res.sendfile(__dirname + '/game.html');
  res.redirect('/game.html');
});

//END ROUTES
