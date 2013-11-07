var express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app);
var url = require('url');

//configure Express
app.use(express.bodyParser())
.use(express.static(__dirname + '/../../browser/src'));
server.listen(8000);

<<<<<<< HEAD
var cd = new Object(); // for cooperate-defect package globals

// set some defaults
cd.defaultRadius = 10;
cd.defaultMass = 10;
cd.defaultMinLinkDist = 10;
cd.defaultState = "cooperate";
var currentTime = 0;

// FIXME: for now, load a game in code
cd.data = 
{
  "game": {
    "id": 1,
    "durationMS": 150000,
    "elapsedMS": 0,
    "running":true
  },
  "screen": {
    "width": 800,
    "height": 600,
    "scoreWidth": 200,
    "scoreHeight": 500,
    "frameRate": 10
  },  
  "players": [
/*
  {
    "id": 0,
    "name": "Surya",
    "x": 120,
    "y": 185,
    "xSpeed": 0,
    "ySpeed": 0,
    "radius": 40,
    "mass": 40,
    "state": "cooperate",
    "effect": "none",
    "color": "#ff0000",
    "score": 10,
    "currentRank": 1,
    "numberOfLinks": 0
  },
  {
    "id": 1,
    "name": "Jon",
    "x": 402,
    "y": 300,
    "xSpeed": 0,
    "ySpeed": 0,
    "radius": 15,
    "mass": 15,
    "state": "cooperate",
    "effect": "point",
    "color": "#00ff00",
    "score": 30,
    "currentRank": 2,
    "numberOfLinks": 0
  },
  {
    "id": 2,
    "name": "Karl",
    "x": 20,
    "y": 40,
    "xSpeed": 0,
    "ySpeed": 0,
    "radius": 10,
    "mass": 10,
    "state": "cooperate",
    "effect": "none",
    "color": "#0000ff",
    "score": 20,
    "currentRank": 3,
    "numberOfLinks": 0
  }
*/
  ],
  "orbs": [
/*
    {
      "id": 0,
      "x": 250,
      "y": 250,
      "xSpeed": 5,
      "ySpeed": 5,
      "radius": cd.defaultRadius,
    }
*/
  ],
  "links": [
  ],
  "leaderBoard":[
  ],
  "groups":[
  ]
};
=======
var cd = require('./cd');
>>>>>>> 2f84f4d8926bcce5202c1dae7075dce261e8c9ea

//var currentTime = 0; // FIXME: global

var util = require('./util');

var gameplay = require('./gameplay');

//TIMER STUFF
setInterval(gameplay.updateFrame, 1000 / cd.data.screen.frameRate);
setTimeout(gameplay.gameOver,cd.data.game["durationMS"]);
setInterval(gameplay.updateCountdown,1000)

<<<<<<< HEAD
var contains = function(a, obj) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] == obj) {
      return true;
    }
  }
  // console.log(a+ " doesnt contain "+ obj);
  return false;
}

var updatePlayers = function() {
  cd.data.players.forEach(function (element, index, array) {
    var newX = element.x + element.xSpeed;
    if (newX < 0) {
      newX = 0;
    }
    else if (newX > cd.data.screen.width) {
      newX = cd.data.screen.width;
    }
    element.x = newX;

    var newY = element.y + element.ySpeed;
    if (newY < 0) {
      newY = 0;
    }
    else if (newY > cd.data.screen.height) {
      newY = cd.data.screen.height;
    }
    element.y = newY;
    
    // deceleration based on mass and current speed
    if (element.xSpeed > 0) {
      element.xSpeed -= cd.data.screen.frameRate/10 + ((cd.data.screen.frameRate + element.xSpeed) / element.mass); // slow yo roll dawg
    }
    else if (element.xSpeed < 0) {
      element.xSpeed += cd.data.screen.frameRate/10 + ((cd.data.screen.frameRate + element.xSpeed) / element.mass);  // slow yo negative roll
    }
    
    if (element.ySpeed > 0) {
      element.ySpeed -= cd.data.screen.frameRate/10 + ((cd.data.screen.frameRate + element.xSpeed) / element.mass);
    }
    else if (element.ySpeed < 0) {
      element.ySpeed += cd.data.screen.frameRate/10 + ((cd.data.screen.frameRate + element.xSpeed) / element.mass);
    }
  });
};

var updateLeaderBoard = function() {
  var playersCopy =[];
  cd.data.players;
  cd.data.leaderBoard = [];
  //Because js passes vars by reference. KW if you have a better way of doing this im open to ideas.
  for (i in cd.data.players) {
    playersCopy.push(cd.data.players[i]);
  }

  playersCopy.sort(sortBy("mass"));
  
  //clear the old leaderboard data
  for(i in playersCopy) {
    // console.log(playersCopy[i].id +" : "+playersCopy[i].score)
    var newLeaderBoardItem  = {"index": i, "color":playersCopy[i].color, "playerId": playersCopy[i].id, "name": playersCopy[i].name,"score": playersCopy[i].mass};
    cd.data.leaderBoard.push(newLeaderBoardItem);
  }
}

function sortBy(prop) {
  return function(a,b) {
    if (a[prop] > b[prop]){
      return 1;
    }
    else if (a[prop] < b[prop]){
      return -1;
    }
    return 0;
  }
}

var updateLinks = function(){
  cd.data.links.forEach(function(element, index, array) {
    element.source.x = cd.data.players[element.source.id].x;
    element.source.y = cd.data.players[element.source.id].y;
    element.target.x = cd.data.players[element.target.id].x;
    element.target.y = cd.data.players[element.target.id].y;
  });
  checkForLinks();
}

var updateOrbs = function() {
  cd.data.orbs.forEach(function(orb, orbIndex, orbs) {
    orb.x = orb.x + orb.xSpeed;
    orb.y = orb.y + orb.ySpeed;
    
    cd.data.players.forEach(function(player, playerIndex, players) {
      if (!!orbs[orbIndex]) {
        var dist = findDistance(orb, player);
        if (dist >= 0) {
          console.log('player ' + player.id + ' captured orb at distance ' + dist);
          orbs.splice(orbIndex);
          player.mass += 2;
          player.radius += 2;
          cd.data.groups.forEach(function(group, groupIndex, groups) {
            if (contains(group.players, player.id)) {
              for (var index in group.players) { // index of array, not id of player
                if (group.players[index] !== player.id) {
                  console.log('orb capture via group for player ' + group.players[index]);
                  players[group.players[index]].mass += 2;
                  players[group.players[index]].radius += 2;
                }
              }
            }
          });
          updateLeaderBoard();
        }
      }
    });
    
    if (!!orbs[orbIndex]) {
      if ((orb.x >= cd.data.screen.width)
        || (orb.x <= 0)
        || (orb.y >= cd.data.screen.height)
        || (orb.y <= 0)) {
        console.log('removing orb');
        orbs.splice(orbIndex); // remove it, no player captured this orb
      }
    }
  });
};
var gameOver = function(){
  console.log("Game time over!");
  cd.data.playesrs =[];
  cd.data.links = [];
  cd.data.orbs = [];
  cd.data.groupd = [];
  cd.data.game.running= false;
}
//this updates game state
var updateCountdown = function(){
currentTime += 1000;
cd.data.game["elapsedMS"] = "10";
// console.logtypeof(cd.data.game["elapsedMS"]) );
}
setInterval(updateFrame, 1000 / cd.data.screen.frameRate);
setTimeout(gameOver,cd.data.game["durationMS"]);
setInterval(updateCountdown,1000)
  
=======
//END TIMER STUFF
>>>>>>> 2f84f4d8926bcce5202c1dae7075dce261e8c9ea


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
  if (!!cd.data.players[req.params.id]) {
    //console.dir(req.body);
    if (!!req.body.state) {
      if ((req.body.state == 'cooperate') || (req.body.state == 'defect')) {
        //console.log('setting player ' + req.params.id + ' to state ' + req.body.state);
        cd.data.players[req.params.id].state = req.body.state;
        console.log("State changed!" + cd.data.players[req.params.id].state);
        if (req.body.state == 'cooperate') {

        }
        else if (req.body.state == 'defect') {
          gameplay.removeLink(req.params.id);
        }
      }
      else {
        //console.log('state change specified but it is not cooperate or defect: ' + req.body.state);
        res.statusCode = 400;
      }
    }
    if (!!req.body.move && (req.body.move.match(/^(up|down|left|right)$/))) {
      gameplay.movePlayer(req.params.id, req.body.move);
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
  console.log("New Player added !");
  cd.data.players.push(newPlayer);
  body = JSON.stringify(cd.data.players[newPlayer.id]);
  //console.log('body is ' + body);
  //res.statusCode = 200;
  res.end(body);
});

app.get('/games/:id', function(req, res) {
  //console.log('request for /games/' + req.params.id);
  if (cd.data.game.id == req.params.id) { // FIXME: hardcoded single game id
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
  // res.writeHead(200, {"Content-Type":"text/plain"});

  var params = url.parse(req.url,true).query;
  userName= params["id"];
  console.log(params);
  res.sendfile(__dirname + '/index.html');
});

//END ROUTES
