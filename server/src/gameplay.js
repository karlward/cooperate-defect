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

var updateGroups = function() {
  //console.log('in updateGroups');
  cd.data.links.forEach(function(link, linkIndex, links) {
    if(cd.data.groups.length <= 0){
      cd.data.groups.push({"players": [link.source.id, link.target.id]});     
      //console.log("adding new group"); 
    }
    else {
      cd.data.groups.forEach(function(group, groupIndex, groups) {
        // console.log("Checking if: " + group.players + " contains "+ link.source);
        if (util.contains(group.players, link.source.id)){
          group.players.push(link.target.id);
          //console.log("link id: " + link.target.id + " added to group as target"); 
        }
        else if (util.contains(group.players, link.target.id)) {
          group.players.push(link.source.id);
          //console.log("link id: " + link.source.id + "  added to group as source");
        }
        else {
          groups.push({"players": [link.source.id, link.target.id]}); 
          //console.log("link not found in current group adding new group");
        }
        group.players = util.deduplicate(group.players);
      });      
    }
  });
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

var checkForLinks = function() {
  //console.log('in checkForLinks');
  //console.log("Number of Players : " + cd.data.players.length + " No. of links : "+ cd.data.links.length);
  for (var i in cd.data.players) {
    for (var j in cd.data.players) {
      if (!!cd.data.players[i] && !!cd.data.players[j]) {
        //console.log(cd.data.players[i].id + " : " +cd.data.players[j].id);
        if (cd.data.players[i].id !== cd.data.players[j].id){
          if ((findDistance(cd.data.players[i], cd.data.players[j]) >= 0) 
              && ((cd.data.players[i].state === 'cooperate') && (cd.data.players[j].state === 'cooperate'))) {
            addLink(cd.data.players[i].id, cd.data.players[j].id);
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

var addLink = function(sourceId, targetId) {
  //console.log('in addLink');
  if (hasLink(sourceId, targetId) === false) {
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
  var i = cd.data.links.length;

  //Remove from links
  //console.log("Checking for links to remove with id: " + id );
  cd.data.links.forEach(function(link, linkIndex, links) {
    if (link.source.id === id) {
      cd.data.players[link.source.id].numberOfLinks--;
      cd.data.players[link.target.id].numberOfLinks--;
      links.splice(linkIndex, 1);
    }
    if (link.target.id === id) {
      cd.data.players[link.source.id].numberOfLinks--;
      cd.data.players[link.target.id].numberOfLinks--;
      links.splice(linkIndex, 1);
    }
  });
  
  
/*  while(i--){
    //console.log("Checking index :" + i);
    //if id is a link source remove that link
    if (cd.data.links[i].source.id === id) {
      //remove link object
      //console.log("Removing source link at index : " + i );
      cd.data.players[cd.data.links[i].source.id].numberOfLinks--; 
      cd.data.players[cd.data.links[i].target.id].numberOfLinks--;
      cd.data.links.splice(i,1);
    } 

    //if id is a link target remove
    if (cd.data.links[i].target.id === id) {
      //console.log("Removing target link at index : " + i );
      cd.data.players[cd.data.links[i].source.id].numberOfLinks--; 
      cd.data.players[cd.data.links[i].target.id].numberOfLinks--;
      cd.data.links.splice(i,1);
    }
  } */
  //remove from groups
  cd.data.groups.forEach(function(group, groupIndex, groups) {
    //console.log('checking groups for link to remove');
    if (util.contains(group.players,id)) {
      console.log("Removing player with id: " + id + " from group "+ group.players);
      for (var j in group.players) {
        if (group.players[j] === id) {
          console.log('really removing player ' + group.players[j]);
          group.players.splice(j, 1);
        }
      }
      //cd.data.groups.splice(index,1);
      if (groups.length === 1) {
        console.log('removing single member group, members: ' + groups);
        groups.splice(groupIndex, 1);
      }
    }
  });

  console.log("Done Checking");
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
}

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
  "checkForLinks": checkForLinks,
  "addLink": addLink,
  "removeLink": removeLink,
  "hasLink": hasLink,
  "findDistance": findDistance,
  "createOrb": createOrb,
};

module.exports = gameplay;

