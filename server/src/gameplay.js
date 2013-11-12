// Game functions
var gameplay = new Object();
var cd = require('./cd');
var util = require('./util');

var updateFrame = function() {
  //if ((cd.data.orbs.length < 5) && (cd.data.orbs.length < cd.data.players.length - 1)) {
  if(cd.data.game.running === true){
    if (cd.data.orbs.length < 1) {
      createOrb();
    }

    updatePlayers();
    updateLinks();
    updateOrbs();
    updateGroups();
  }
  else{
    console.log("game over!");
  }
};

var updatePlayers = function() {
  cd.data.players.forEach(function (player, index, players) {
    var newX = player.x + player.xSpeed;
    if (newX < 0) {
      newX = 0;
    }
    else if (newX > cd.data.screen.width) {
      newX = cd.data.screen.width;
    }
    player.x = newX;

    var newY = player.y + player.ySpeed;
    if (newY < 0) {
      newY = 0;
    }
    else if (newY > cd.data.screen.height) {
      newY = cd.data.screen.height;
    }
    player.y = newY;

    // deceleration based on mass and current speed
    if (player.xSpeed > 0) {
      player.xSpeed -= cd.data.screen.frameRate/10 + ((cd.data.screen.frameRate + player.xSpeed) / player.mass); // slow yo roll dawg
    }
    else if (player.xSpeed < 0) {
      player.xSpeed += cd.data.screen.frameRate/10 + ((cd.data.screen.frameRate + player.xSpeed) / player.mass);  // slow yo negative roll
    }

    if (player.ySpeed > 0) {
      player.ySpeed -= cd.data.screen.frameRate/10 + ((cd.data.screen.frameRate + player.xSpeed) / player.mass);
    }
    else if (player.ySpeed < 0) {
      player.ySpeed += cd.data.screen.frameRate/10 + ((cd.data.screen.frameRate + player.xSpeed) / player.mass);
    }
    for (var i in players) { // non-overlapping player code, not perfect
      if (player !== players[i]) {
        if(findDistance(player, players[i]) >= 0) {
          ensureGrouped(player.id, players[i].id);
          while(findDistance(player, players[i]) >= 0) { // push them apart
            if (player.mass < players[i].mass) {
              player.x += players[i].xSpeed * (players[i].mass / player.mass);
              player.y += players[i].ySpeed * (players[i].mass / player.mass);
            }
            else if (player.mass > players[i].mass) {
              players[i].x += player.xSpeed * (player.mass / players[i].mass);
              players[i].y += player.ySpeed * (player.mass / players[i].mass);
            }
            else {
              players[i].x += player.xSpeed;
              player.y += players[i].ySpeed;
            }
          }
        }
        else if (hasLink(player.id, players[i].id) && (findDistance(player, players[i]) < -150)) {
          var totalMass = players[i].mass + player.mass;
          var xSpeedGroup = (player.xSpeed * player.mass / totalMass) + (players[i].xSpeed * players[i].mass / totalMass);
          var ySpeedGroup = (player.ySpeed * player.mass / totalMass) + (players[i].ySpeed * players[i].mass / totalMass);
          
/*          player.xSpeed = xSpeedGroup;
          player.ySpeed = ySpeedGroup;
          players[i].xSpeed = xSpeedGroup;
          players[i].ySpeed = ySpeedGroup;*/
         // while (findDistance(player, players[i]) < -150) {
            var newX1 = player.x + player.xSpeed;
            var newY1 = player.y + player.ySpeed;
            var newX2 = players[i].x + players[i].xSpeed;
            var newY2 = players[i].y + players[i].ySpeed;
            if (Math.abs(player.x - players[i].x) < Math.abs(newX1 - newX2)) { // check x direction
              player.x += xSpeedGroup + Math.random();
              players[i].x += xSpeedGroup + Math.random();
              player.xSpeed = xSpeedGroup + Math.random();
              players[i].xSpeed = xSpeedGroup + Math.random();
            }
            else {
              player.x += player.xSpeed;
              players[i].x += players[i].xSpeed;
            }
            if (Math.abs(player.y - players[i].y) < Math.abs(newY1 - newY2)) { // check y direction
              player.y += ySpeedGroup + Math.random();
              players[i].y += ySpeedGroup + Math.random();
              player.ySpeed = ySpeedGroup + Math.random();
              players[i].ySpeed = ySpeedGroup + Math.random();
            }
            else {
              player.y += player.ySpeed;
              players[i].y += players[i].ySpeed;
            }
        //  }
        }
      }
    }
  });
};

var updateLeaderBoard = function() {
  var playersCopy =[];
  cd.data.players;
  cd.data.leaderBoard = [];
  //Because js passes vars by reference. KW if you have a better way of doing this im open to ideas.
  for (var i in cd.data.players) {
    playersCopy.push(cd.data.players[i]);
  }

  playersCopy.sort(util.sortBy("mass"));

  //clear the old leaderboard data
  for(var i in playersCopy) {
    // console.log(playersCopy[i].id +" : "+playersCopy[i].score)
    var newLeaderBoardItem  = {"index": i, "color":playersCopy[i].color, "playerId": playersCopy[i].id, "name": playersCopy[i].name};
    cd.data.leaderBoard.push(newLeaderBoardItem);
  }
}

var updateLinks = function() {
  cd.data.groups.forEach(function(group, groupIndex, groups) {
    group.players.forEach(function(player, playerIndex, players) {
      for (var i = 0; i < players.length; i++) {
        addLink(player, players[i]);
      }
    });
  });
  cd.data.links.forEach(function(link, linkIndex, links) {
    link.source.x = cd.data.players[link.source.id].x;
    link.source.y = cd.data.players[link.source.id].y;
    link.target.x = cd.data.players[link.target.id].x;
    link.target.y = cd.data.players[link.target.id].y;
  });
};

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
            if (util.contains(group.players, player.id)) {
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
  //console.log("Game over!");
  cd.data.players =[];
  cd.data.links = [];
  cd.data.orbs = [];
  cd.data.groups = [];
  cd.data.game.running = false;
}

//this updates game state
var updateCountdown = function(){
  //currentTime += 1000;
  cd.data.game["elapsedMS"] += 1000;
  // console.logtypeof(cd.data.game["elapsedMS"]) );
}

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

var updateGroups = function() {
  //console.log('in updateGroups');
  //console.log("Number of Players : " + cd.data.players.length + " No. of links : "+ cd.data.links.length);
  for (var i in cd.data.players) {
    for (var j in cd.data.players) {
      if (!!cd.data.players[i] && !!cd.data.players[j]) {
        //console.log(cd.data.players[i].id + " : " +cd.data.players[j].id);
        if (cd.data.players[i].id !== cd.data.players[j].id){
          if ((findDistance(cd.data.players[i], cd.data.players[j]) >= 0)
              && (cd.data.players[i].state === 'cooperate')
              && (cd.data.players[j].state === 'cooperate')
          ) {
            ensureGrouped(cd.data.players[i].id, cd.data.players[j].id);
          }
          else {
            //console.log("Link ignored. Current state of players : " + cd.data.players[i].state + " , "+ cd.data.players[j].state);
          }
        }  
      }
      else {
        //console.log("Some players id is null");
      }
    }
  }  
}

var ensureGrouped = function(a, b) {
  //console.log('in ensureGrouped for ' + a + ', ' + b);
  var found = false;
  if (cd.data.groups.length === 0) { // no groups at all, create a new group
    var newGroup = new Object();
    newGroup.players = [a, b];
    cd.data.groups.push(newGroup);
    found = true;
  }
  else { // look for an existing group
    for (var groupIndex in cd.data.groups) {
      if (util.contains(cd.data.groups[groupIndex].players, a)) {
        cd.data.groups[groupIndex].players.push(b);
        found = true;
      }
      if (util.contains(cd.data.groups[groupIndex].players, b)) {
        cd.data.groups[groupIndex].players.push(a);
        found = true;
      }
      cd.data.groups[groupIndex].players = util.deduplicate(cd.data.groups[groupIndex].players);
      //console.log('group is now ');
      //console.dir(cd.data.groups[groupIndex].players);
    }
    // FIXME: combine any overlapping groups here
  }
  if (found === false) { // create a new group
    var newGroup = new Object();
    newGroup.players = [a, b];
    cd.data.groups.push(newGroup);
  }
};

var ensureUngrouped = function(a) {
  console.log('in ensureUngrouped for ' + a);
  for (var groupIndex in cd.data.groups) {
    for (var playerIndex in cd.data.groups[groupIndex].players) {
      if (a === cd.data.groups[groupIndex].players[playerIndex]) {
        cd.data.groups[groupIndex].players.splice(playerIndex, 1); // remove player from group
        if (cd.data.groups[groupIndex].players.length <= 1) {
          cd.data.groups.splice(groupIndex, 1); // remove group entirely
        }
      }
    }
  }
  removeLink(a);
//  console.log('group is now ');
//  console.dir(cd.data.groups[groupIndex].players);
};

var addLink = function(sourceId, targetId) {
  //console.log('in addLink');
  if ((sourceId !== targetId)
      && (hasLink(sourceId, targetId) === false)
      && (cd.data.players[sourceId].state === 'cooperate')
      && (cd.data.players[targetId].state === 'cooperate')) {
    var newLink = {
        "source": {
          "id": cd.data.players[sourceId].id,
          "x": cd.data.players[sourceId].x,
          "y": cd.data.players[sourceId].y
        },
        "target": {
          "id": cd.data.players[targetId].id,
          "x": cd.data.players[targetId].x,
          "y": cd.data.players[targetId].y
        },
        "value": 1
    };
    cd.data.players[sourceId].numberOfLinks++; 
    cd.data.players[targetId].numberOfLinks++;
    console.log("Added new link");
    cd.data.links.push(newLink);
  }
}

var removeLink = function(id) {
  //Remove from links
  //console.log("Checking for links to remove with id: " + id );
  //cd.data.links.forEach(function(link, linkIndex, links) {
  var linkIndex = 0;
  for (var linkIndex = 0; linkIndex < cd.data.links.length; linkIndex++) {
    if ((cd.data.links[linkIndex].source.id === id) || (cd.data.links[linkIndex].target.id === id)) {
      cd.data.players[cd.data.links[linkIndex].source.id].numberOfLinks--;
      cd.data.players[cd.data.links[linkIndex].target.id].numberOfLinks--;
      cd.data.links.splice(linkIndex, 1); // FIXME: does this affect linkIndex in other loop iterations?
      linkIndex--;
    }
  }
  //console.log("Done Checking");
}

var hasLink = function(id1,id2) {
  for (var i in cd.data.links) {
    if (cd.data.links[i].source.id === id1) {
      if (cd.data.links[i].target.id === id2) {
        //console.log("Link found between id: " + id1 + " and id: " + id2);
        return true;
      }
    }
  }

  for (var j in cd.data.links) {
    if (cd.data.links[j].source.id === id2) {
      if(cd.data.links[j].target.id === id1) {
        //console.log("Link found between id: " + id1 + " and id: " + id2);
        return true;
      }
    }
  }
  //console.log("No Link found between id: " + id1 + " and id: " + id2);
  return false;
};

//find distance between two objects, return distance in pixels
//if return value is 0, objects are touching
//if return value is positive, objects are touching and overlapping
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

//add a new orb
var createOrb = function() {
  console.log("in createOrb");
  var orb = new Object();
  orb.x = Math.floor(Math.random() * cd.data.screen.width);
  orb.y = Math.floor(Math.random() * cd.data.screen.height);
  orb.radius = cd.defaultRadius;
  orb.id = cd.data.orbs.length;
  orb.xSpeed = Math.ceil(Math.random() * cd.data.screen.frameRate) * util.flipCoin();
  orb.ySpeed = Math.ceil(Math.random() * cd.data.screen.frameRate) * util.flipCoin();
  cd.data.orbs.push(orb);
}

gameplay = {
  "updateFrame": updateFrame,
  "updateGroups": updateGroups,
  "updatePlayers": updatePlayers,
  "updateLeaderBoard": updateLeaderBoard,
  "updateLinks": updateLinks,
  "updateOrbs": updateOrbs,
  "gameOver": gameOver,
  "updateCountdown": updateCountdown,
  "movePlayer": movePlayer,
  "addLink": addLink,
  "removeLink": removeLink,
  "hasLink": hasLink,
  "findDistance": findDistance,
  "createOrb": createOrb,
  "ensureGrouped": ensureGrouped,
  "ensureUngrouped": ensureUngrouped
};

module.exports = gameplay;

