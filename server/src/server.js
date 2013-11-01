var express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// configure Express
app.use(express.bodyParser());

server.listen(8000);

var cd = new Object(); // for cooperate-defect package globals

// set some defaults
cd.defaultRadius = 10;
cd.defaultMass = 10;

// FIXME: for now, load a game in code
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
    "color": "#ff0000",
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
    "color": "#00ff00",
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
    "color": "#0000ff",
  }
  ],
  "orbs": [
    {
      "id": 0,
      "x": 88,
      "y": 690
    }
  ],
  "links": [
    {     
      "source" :{ 
        "id":0,
        "x": 120,
        "y": 185,
      },
      "target" :{ 
        "id":1,
        "x": 402,
        "y": 300,
      },
      "value" : 1
    },
    {
      "source" :{ 
        "id":1,
        "x": 120,
        "y": 185,
      },
      "target" :{ 
        "id":2,
        "x": 20,
        "y": 40,
      },
      "value" : 1
    }
  ],
};

app.get('/orbs/:id', function (req, res) {
  if (!!(cd.data.orbs[req.params.id])) {
    var body = JSON.stringify(cd.data.orbs[req.params.id]);
    res.set('Content-Type', 'application/json');
    res.set('Content-Length', body.length);
    res.end(body);
  }
});
  

    app.get('/orbs/:id', function (req, res) {
      if (!!(cd.data.orbs[req.params.id])) {
        var body = JSON.stringify(cd.data.orbs[req.params.id]);
        res.set('Content-Type', 'application/json');
        res.set('Content-Length', body.length);
        res.end(body);
      }
      else {
    //console.log('req for non-existent player id');
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

// update movement and cooperate/defect status for a player
app.patch('/players/:id', function(req, res) {
  //console.log('in patch for player ' + req.params.id);
  if (!!cd.data.players[req.params.id]) {
    //console.dir(req.body);
    if (!!req.body.state) {
      if ((req.body.state == 'cooperate') || (req.body.state == 'defect')) {
        //console.log('setting player ' + req.params.id + ' to state ' + req.body.state);
        cd.data.players[req.params.id].state = req.body.state;
      }
      else {
        //console.log('state change specified but it is not cooperate or defect: ' + req.body.state);
        res.statusCode = 400;
      }
    }
    
    if (!!req.body.move) {
      if (req.body.move == 'up') {
        //console.log('move up');
        if (cd.data.players[req.params.id].y > 0) {
          cd.data.players[req.params.id].y = cd.data.players[req.params.id].y - 10;
          console.log(cd.data.links);
          for( l in cd.data.links){
            
            if(cd.data.links[l].source.id == req.params.id){
              cd.data.links[l].source.y  -= 10;
            }
            if(cd.data.links[l].target.id == req.params.id){
              cd.data.links[l].target.y  -= 10;
            }
          }
        }
        else {
          cd.data.players[req.params.id].y = 0;
          cd.data.links.source[req.params.id].y = 0; 
          cd.data.links.target[req.params.id].y = 0;           
        }
      }
      else if (req.body.move == 'down') {
        if (cd.data.players[req.params.id].y < cd.data.screen.height) {
          cd.data.players[req.params.id].y = cd.data.players[req.params.id].y + 10;
          
          for( l in cd.data.links){
            console.log(l );
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].source.y  += 10;
            }
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].y  += 10;
            }
          }
        }
        else {
          cd.data.players[req.params.id].y = cd.data.screen.height;
          
          for( l in cd.data.links){
            if(cd.data.links[l].id == req.params.id ){
              cd.data.links[l].source.y  = cd.data.screen.height;
            }
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].y = cd.data.screen.height;
            }
          }
        }
      }
      else if (req.body.move == 'left') {
        if (cd.data.players[req.params.id].x > 0) {
          cd.data.players[req.params.id].x = cd.data.players[req.params.id].x - 10;

          for( l in cd.data.links){
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].source.x  -= 10;
            }
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].x -= 10;
            }
          }
        }
        else {
          cd.data.players[req.params.id].x = 0;
          
          for( l in cd.data.links){
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].source.x  = 0;
            }
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].x = 0;
            }
          }
        }
      }
      else if (req.body.move == 'right') {
        if (cd.data.players[req.params.id].x < cd.data.screen.height) {
          cd.data.players[req.params.id].x = cd.data.players[req.params.id].x + 10;
          
          for( l in cd.data.links){
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].source.x  += 10;
            }
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].x += 10;
            }
          }
        }
        else {
          cd.data.players[req.params.id].x = cd.data.screen.width;
          
          for( l in cd.data.links){
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].source.x  = cd.data.screen.width;
            }
            if(cd.data.links[l].id == req.params.id){
              cd.data.links[l].x += cd.data.screen.width;
            }
          }
        }
      }
      else {
        console.log('unknown move direction');
        res.statusCode = 400;
      }
    }
  }
  else {
    console.log('not a move or a state change');
    res.statusCode = 400;
  } res.end();  
});

var checkForLinks = function(){
    for( i in cd.data.players){
      for(j in cd.data.players){
        if(cd.data.players[i].id != cd.data.players[j].id){
          var dx = cd.data.players[i].x - cd.data.players[j].x;
          var dy = cd.data.players[i].y - cd.data.players[j].y;
          var dr = Math.sqrt(dx * dx + dy * dy);          
        } 
      }
    }  
}
// return a random color, as an RGB hex string
var randomRGB = function() {
  var color = '#';
  for (var i = 0; i < 3; i++) {
    var component = (Math.floor(Math.random() * 255)).toString(16);
    if (component.toString().length < 2) {
      component = '0' + component.toString();
    }
    color = color + component;
  }
  return color;
};

// create a new player
app.post('/players\/?$', function(req, res) {
  console.log('in post for new player');
  var newPlayer = {
    "id": cd.data.players.length,
        "name": null, // FIXME: implement
        "x": Math.floor(Math.random() * cd.data.screen.width), // FIXME: should find an empty spot on screen
        "y": Math.floor(Math.random() * cd.data.screen.height),
        "radius": cd.defaultRadius,
        "mass": cd.defaultMass,
        "state": cd.defaultState,
        "effect": "new",
        "color": randomRGB(),
      };
      cd.data.players.push(newPlayer);
      body = JSON.stringify(cd.data.players[newPlayer.id]);
  //console.log('body is ' + body);
  //res.statusCode = 200;
  res.end(body);
});

// serve index to browsers
app.get('/', function (req, res) {  
  res.sendfile(__dirname + '/index.html');
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

// FIXME: /games should return a list of games
app.get('/games', function(req, res) {
  console.log('request for /games');
  // FIXME: error handling
});