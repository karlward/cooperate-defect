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

  ],
  "orbs": [
    {
      "id": 0,
      "x": 250,
      "y": 250,
      "xSpeed": 5,
      "ySpeed": 5,
      "radius": cd.defaultRadius,
    }
  ],
  "links": [
  ],
  "leaderBoard":[


  ],
  "groups":[
      // { "ids" :[ 0,0,0,0] 
  ]
};

var updateFrame = function() {
  if (cd.data.orbs.length === 0) {
    createOrb();
  }

  updatePlayers();
  updateLinks();
  updateOrbs();
  //FIXME: I dont think this needs to be updated every frame. It should do it anytime an orb is eaten by a player.
  updateLeaderBoard();
  updateChains();
};

var updateChains = function(){

  cd.data.links.forEach(function(element,index,array){

    if(cd.data.groups.length <= 0){

      cd.data.groups.push( { "players" :[ element.source.id, element.target.id ] });     
      // console.log("adding new group"); 
    }
    else{
      cd.data.groups.forEach(function(groupElement,groupIndex, groupArray){
        // console.log("Checking if: " + groupElement.players + " contains "+ element.source);
        if(contains(groupElement.players, element.source.id)){
          groupElement.players.push(element.target);
          // console.log("element id : " +element.target + "  added to group"); 
        }
        else if(contains(groupElement.players, element.target.id)){
          groupElement.players.push(element.source);
          // console.log("element id : " +element.source + "  added to group");
        }
        else{

          cd.data.groups.push({"players" :[ element.source.id, element.target.id ] }); 
          // console.log("element not found in current group adding new group  ");
        }
      });      
    }

  });

  if(cd.data.groups.length <= 0){
  
    cd.data.groups.forEach(function(groupElement,groupIndex, groupArray){ 
      deduplicate(groupElement.players);
    });

  }
  
}

var deduplicate = function(a){
  
  // for (var i = a.length; i >= 0 ; i--) {
  //   for(var j =a.length; j>=0 ; j--){
  //       if(a[i] == a[j] &&  i !== j){
  //         a.splice(j,1);
  //       }
  //   }
  // }


}

var contains  = function(a, obj) {
    
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

var updateLeaderBoard = function(){

  var playersCopy =[];
  cd.data.players;
  cd.data.leaderBoard = [];
  //Because js passes vars by reference. KW if you have a better way of doing this im open to ideas.
  for( i in cd.data.players){
    playersCopy.push(cd.data.players[i]);
  }

  playersCopy.sort(sortBy("score"));
  
  //clear the old leaderboard data
  

    for(i in playersCopy){
      // console.log(playersCopy[i].id +" : "+playersCopy[i].score)

      var newLeaderBoardItem  = { "index": i, "color":playersCopy[i].color};
      cd.data.leaderBoard.push(newLeaderBoardItem);
    }
  
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
    cd.data.links.forEach(function(element, index, array) {
      element.source.x = cd.data.players[element.source.id].x;
      element.source.y = cd.data.players[element.source.id].y;
      element.target.x = cd.data.players[element.target.id].x;
      element.target.y = cd.data.players[element.target.id].y;
    });
    checkForLinks();
}

var updateOrbs = function() {
  cd.data.orbs.forEach(function(orb, index, array) {
    orb.x = orb.x + orb.xSpeed;
    orb.y = orb.y + orb.ySpeed;
    
    cd.data.players.forEach(function(player, index2, array2) {
      if (!!cd.data.orbs[index]) {
        var dist = findDistance(orb, player);
        if (dist >= 0) {
          console.log('player ' + player.id + ' captured orb at distance ' + dist);
          cd.data.orbs.splice(index);
          player.mass += 2;
          player.radius += 2;
        }
      }
    });
    
    if (!!cd.data.orbs[index]) {
      if ((orb.x >= cd.data.screen.width)
        || (orb.x <= 0)
        || (orb.y >= cd.data.screen.height)
        || (orb.y <= 0)) {
        console.log('removing orb');
        cd.data.orbs.splice(index); // remove it, no player captured this orb
      }
    }
  });
};
  
/*    //for (i in cd.data.orbs) {
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
}; */

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

var movePlayer = function(playerId, direction) {
  // accleration based on mass and speed
  //console.log('in movePlayer for player ' + playerId + ' direction ' + direction);
  if (!!cd.data.players[playerId]) {
    var element = cd.data.players[playerId];
    if (direction === 'up') {
      if (Math.abs(element.ySpeed) < 15) {
        element.ySpeed += cd.data.screen.frameRate/-5 + (-1 * (cd.data.screen.frameRate + element.ySpeed) / element.mass);
      }
    }
    else if (direction === 'down') {
      if (Math.abs(element.ySpeed) < 15) {
        element.ySpeed += cd.data.screen.frameRate/5 + ((cd.data.screen.frameRate + element.ySpeed) / element.mass);
      }
    }
    else if (direction === 'left') {
      if (Math.abs(element.xSpeed) < 15) {
        element.xSpeed += cd.data.screen.frameRate/-5 + (-1 * (cd.data.screen.frameRate + element.xSpeed) / element.mass);
      }
    }
    else if (direction === 'right') {
      if (Math.abs(element.xSpeed) < 15) {
        element.xSpeed += cd.data.screen.frameRate/5 + ((cd.data.screen.frameRate + element.xSpeed) / element.mass);
      }
    }
  }
};

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
    if (!!req.body.move && (req.body.move.match(/^(up|down|left|right)$/))) {
      movePlayer(req.params.id, req.body.move);
    }
  }
  else {
    console.log('not a move or a state change');
    res.statusCode = 400;
  } res.end();  
});

// find distance between two objects, return distance in pixels
// if return value is 0, objects are touching
// if return value is positive, objects are touching and overlapping
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
      cd.data.players[sourceId].numberOfLinks++; 
      cd.data.players[targetId].numberOfLinks++;
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
        cd.data.players[cd.data.links[i].source.id].numberOfLinks--; 
        cd.data.players[cd.data.links[i].target.id].numberOfLinks--;
        cd.data.links.splice(i,1);
    } 

    //if id is a link target remove
    if(cd.data.links[i].target.id == id){
      console.log("Removing target link at index : " + i );
      cd.data.players[cd.data.links[i].source.id].numberOfLinks--; 
      cd.data.players[cd.data.links[i].target.id].numberOfLinks--;
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
    "xSpeed": 0,
    "ySpeed": 0,
    "radius": cd.defaultRadius,
    "mass": cd.defaultMass,
    "state": cd.defaultState,
    "effect": "new",
    "color": randomRGB(),
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
  orb.xSpeed = Math.ceil(Math.random() * cd.data.screen.frameRate) * flipCoin();
  orb.ySpeed = Math.ceil(Math.random() * cd.data.screen.frameRate) * flipCoin();
  cd.data.orbs.push(orb);
}



