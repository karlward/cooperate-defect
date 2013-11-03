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
cd.defaultMinLinkDist = 10;
cd.defaultState = "cooperate";

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
    "score": 10,
    "currentRank": 1
  },
  {
    "id": 1,
    "name": "Jon",
    "x": 402,
    "y": 300,
    "radius": 15,
    "mass": 15,
    "state": "cooperate",
    "effect": "point",
    "color": "#00ff00",
    "score": 30,
    "currentRank": 2
  },
  {
    "id": 2,
    "name": "Karl",
    "x": 20,
    "y": 40,
    "radius": 10,
    "mass": 10,
    "state": "cooperate",
    "effect": "none",
    "color": "#0000ff",
    "score": 20,
    "currentRank": 3
  }
  ],
  "orbs": [

    {
      "id": 0,
      "x": 250,
      "y": 250,
      "radius": cd.defaultRadius,
      "xSpeed": 5,
      "ySpeed": 5
    }

  ],
  "links": [
    /*
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
    */
  ],
  "leaderBoard":[

  ]
};

var updateFrame = function() {
  if (cd.data.orbs.length === 0) {
    createOrb();
  }

  updateLinks();
  //updatePlayers();
  updateOrbs();
  updateLeaderBoard();
};

var updateLeaderBoard = function(){

  // var playersCopy = cd.data.players;
  // playersCopy.sort(sortBy("score"));


  // for(i in playersCopy){
  //   console.log(playersCopy[i].id +" : "+playersCopy[i].score)

  // }
  
}
function sortBy(prop){
   return function(a,b){
      if( a[prop] > b[prop]){
          return 1;
      }else if( a[prop] < b[prop] ){
          return -1;
      }
      return 0;
   }
}

var updateLinks = function(){
    checkForLinks();
}
var updateOrbs = function() {
  for (i in cd.data.orbs) {
    cd.data.orbs[i].x = cd.data.orbs[i].x + cd.data.orbs[i].xSpeed;
    cd.data.orbs[i].y = cd.data.orbs[i].y + cd.data.orbs[i].ySpeed;
    if ((cd.data.orbs[i].x >= cd.data.screen.width)
        || (cd.data.orbs[i].x <= 0)
        || (cd.data.orbs[i].y >= cd.data.screen.height)
        || (cd.data.orbs[i].y <= 0)) {
      console.log("removing orb");
      cd.data.orbs.splice(i); // remove it, no player captured this orb
    }
  }
};

//this updates game state
setInterval(updateFrame, 1000 / cd.data.screen.frameRate);

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

// update movement and cooperate/defect status for a player
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
            removeLink(req.params.id);
          }
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
          for (l in cd.data.links) {
            if (cd.data.links[l].source.id == req.params.id) {
              cd.data.links[l].source.y  -= 10;
            }
            if (cd.data.links[l].target.id == req.params.id) {
              cd.data.links[l].target.y  -= 10;
            }
          }
        }
        else {
          cd.data.players[req.params.id].y = 0;
          for (l in cd.data.links) {
            if (cd.data.links[l].source.id == req.params.id) {
              cd.data.links[l].source.y  = 0;
            }
            if (cd.data.links[l].target.id == req.params.id) {
              cd.data.links[l].target.y = 0;
            }
          }
        }
      }
      else if (req.body.move == 'down') {
        if (cd.data.players[req.params.id].y < cd.data.screen.height) {
          cd.data.players[req.params.id].y = cd.data.players[req.params.id].y + 10;
          for (l in cd.data.links) {
            console.log(l);
            if (cd.data.links[l].source.id == req.params.id) {
              cd.data.links[l].source.y  += 10;
            }
            if (cd.data.links[l].target.id == req.params.id) {
              cd.data.links[l].target.y  += 10;
            }
          }
        }
        else {
          cd.data.players[req.params.id].y = cd.data.screen.height;
          
          for (l in cd.data.links) {
            if (cd.data.links[l].source.id == req.params.id) {
              cd.data.links[l].source.y  = cd.data.screen.height;
            }
            if (cd.data.links[l].target.id == req.params.id) {
              cd.data.links[l].target.y = cd.data.screen.height;
            }
          }
        }
      }
      else if (req.body.move == 'left') {
        if (cd.data.players[req.params.id].x > 0) {
          cd.data.players[req.params.id].x = cd.data.players[req.params.id].x - 10;

          for (l in cd.data.links){
            if (cd.data.links[l].source.id == req.params.id) {
              cd.data.links[l].source.x  -= 10;
            }
            if (cd.data.links[l].target.id == req.params.id) {
              cd.data.links[l].target.x -= 10;
            }
          }
        }
        else {
          cd.data.players[req.params.id].x = 0;
          
          for (l in cd.data.links){
            if (cd.data.links[l].source.id == req.params.id) {
              cd.data.links[l].source.x  = 0;
            }
            if (cd.data.links[l].target.id == req.params.id) {
              cd.data.links[l].target.x = 0;
            }
          }
        }
      }
      else if (req.body.move == 'right') {
        if (cd.data.players[req.params.id].x < cd.data.screen.height) {
          cd.data.players[req.params.id].x = cd.data.players[req.params.id].x + 10;
          
          for (l in cd.data.links){
            if (cd.data.links[l].source.id == req.params.id) {
              cd.data.links[l].source.x  += 10;
            }
            if (cd.data.links[l].target.id == req.params.id) {
              cd.data.links[l].target.x += 10;
            }
          }
        }
        else {
          cd.data.players[req.params.id].x = cd.data.screen.width;
          
          for (l in cd.data.links){
            if (cd.data.links[l].source.id == req.params.id) {
              cd.data.links[l].source.x  += cd.data.screen.width;
            }
            if (cd.data.links[l].target.id == req.params.id) {
              cd.data.links[l].target.x += cd.data.screen.width;
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

// find distance between two objects, return distance in pixels
// if return value is 0, objects are touching
// if return value is negative, objects are touching and overlapping
var findDistance = function(obj1, obj2) {
  if ((obj1 !== null) && (obj2 !== null)) {
    var dx = obj1.x - obj2.x;
    var dy = obj1.y - obj2.y;
    var dr = Math.sqrt(dx * dx + dy*dy);
    var d = (obj1.radius + obj2.radius) - dr ;
    // var r = obj1.radius + obj2.radius;
    // console.log(dr + " " +r + " " + "distance = " +  d);
    return d;
  }
};

var checkForLinks = function(){

    // console.log("No. of Player : " + cd.data.players.length + " No. of links : "+ cd.data.links.length);
    for( i in cd.data.players){
      for(j in cd.data.players){
        if(cd.data.players[i] !== null && cd.data.players[j] !==null){
            
          // console.log(cd.data.players[i].id +" : "+cd.data.players[j].id);
          
          if(cd.data.players[i].id !== cd.data.players[j].id){
            if ((findDistance(cd.data.players[i], cd.data.players[j]) >= 0) 
                && (cd.data.players[i].state == 'cooperate' && cd.data.players[j].state == 'cooperate')) {
              addLink(cd.data.players[i].id, cd.data.players[j].id);
            
            }
            else{
              // console.log("Link ignored. Current state of players : " + cd.data.players[i].state + " , "+ cd.data.players[j].state);
            }
          }  
        }
        else{
          console.log("Some players id is null");
        }
        
      }
    }  
}

var addLink = function(sourceId, targetId){

  if(hasLink(sourceId, targetId) == false){
  var newLink  = {     
        "source" :{ 
          "id":cd.data.players[sourceId].id,
          "x": cd.data.players[sourceId].x,
          "y": cd.data.players[sourceId].y
        },
        "target" :{ 
          "id":cd.data.players[targetId].id,
          "x": cd.data.players[targetId].x,
          "y": cd.data.players[targetId].y
        },
        "value" : 1
      };

      console.log("Added new link");
      cd.data.links.push(newLink);
  }
}

var removeLink = function(id){
  var i = cd.data.links.length;
  console.log("Checking for links to remove with id :" + id );
  while(i--){
      console.log("Checking index :" + i);
    //if id is a link source remove that link
    if(cd.data.links[i].source.id == id){
        //remove link object
        console.log("Removing source link at index : " + i );
        cd.data.links.splice(i,1);
    } 

    //if id is a link target remove
    if(cd.data.links[i].target.id == id){
      console.log("Removing target link at index : " + i );
      cd.data.links.splice(i,1);
    }

  }
  console.log("Done Checking");
}

var hasLink = function(id1,id2){
  for(i in cd.data.links){
    if(cd.data.links[i].source.id == id1){
        if(cd.data.links[i].target.id == id2){
          return true;
          console.log("Link found between id :" + id1 + " and id :" +id2);
        }
    }
  }   

  for(j in cd.data.links){
    if(cd.data.links[j].source.id == id2){
      if(cd.data.links[j].target.id == id1){
        console.log("Link found between id :" + id1 + " and id :" +id2);
        return true;
      }
    }
  }
  console.log(" No Link found between id :" + id1 + " and id :" +id2);
  return false;
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
    "score": 0,
    "currentRank":cd.data.players.length
  };
  console.log("New Player added !");
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

var flipCoin = function() {
  if (Math.random() < 0.5) {
    return -1;
  }
  else {
    return 1;
  }
};

// add a new orb
var createOrb = function() {
  console.log("in createOrb");
  var orb = new Object();
  orb.x = Math.floor(Math.random() * cd.data.screen.width);
  orb.y = Math.floor(Math.random() * cd.data.screen.height);
  orb.radius = cd.defaultRadius;
  orb.id = cd.data.orbs.length;
  orb.xSpeed = Math.ceil(Math.random() * 10) * flipCoin();
  orb.ySpeed = Math.ceil(Math.random() * 10) * flipCoin();
  cd.data.orbs.push(orb);
}
