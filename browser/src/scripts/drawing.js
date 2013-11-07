define(['util', 'cd'], function(util, cd) {
//this function is used to draw the links. It allows us to decide how to handle the data and interpolate
var lineFunction = d3.svg.line()
  .x(function(d) { return d.source.x; })
  .y(function(d) { return d.target; })
  .interpolate("basis");
  
//actually move elements to match game state
var updateFrame = function() {
  //console.log('in updateFrame() at frame rate ' + cd.data.screen.frameRate);
  getGameData();
  
  if (cd.data.game.running === true) {
    updateLeaderboard();
    updatePlayer();
    updateLinks();
    updateOrbs();
    updateBackground();
  }
  else if (cd.data.game.running === false) {
    gameOver();
    console.log("Game Over");
  }
};

// initial setup of the screen, which is just an SVG element in the browser window
var initScreen = function() {
  cd.svg = d3.select('body')
    .append('svg:svg')
    .attr('width', cd.data.screen["width"])
    .attr('height', cd.data.screen["height"]);

  cd.scoreSvg = d3.select('body')
    .append('svg:svg')
    .attr('width', cd.data.screen["scoreWidth"])
    .attr('height', cd.data.screen["scoreHeight"])
    .attr('x', cd.data.screen["width"])
    .attr('y', 0);
      

  cd.d3bg = cd.svg.selectAll('rect.background')
    .data(cd.data.screen);
  cd.d3bg
    .enter()
    .append("rect")
    .attr("class","background")
    .attr('x',0)
    .attr('y',0)
    .attr('width', function(d) { return d.width;} )
    .attr('height', function(d) { return d.height;})
    .attr('fill','white');

  cd.d3links = cd.svg.selectAll("line.link")
    .data(cd.data.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .attr("stroke", "blue")
    .attr("stroke-width", 1)
    .attr("fill", "none");
  

  cd.d3leaderBoard = cd.scoreSvg.selectAll("rect.leaderboard")
    .data(cd.data.leaderBoard)
    .enter()
    .append("rect")
    .attr("class","leaderboard")
    .attr("x", 20)
    .attr("y", function(d) { return ((cd.data.leaderBoard.length - d.index)*20 + 20); })
    .attr("width",20)
    .attr("height",60)
    .attr("fill",function(d) { return (d.color); });

  cd.d3leaderBoardText = cd.scoreSvg.selectAll("text.playerID")
    .data(cd.data.leaderBoard)
    .enter()
    .append("text");
  cd.d3leaderBoardText
    .attr("class","playerID")
    .attr("x",30)
    .attr("y",function(d){return ((cd.data.leaderBoard.length - d.index)*20 + 30 );})
    .text(function(d){return d.name ; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "black");

      
  cd.d3leaderBoardTime = cd.scoreSvg.selectAll("text.time")
    .data(cd.data.game)
    .enter();
  cd.d3leaderBoardTime
    .append("text")
    .attr("class","time")
    .attr("x",cd.data.screen["scoreWidth"]/2)
    .attr("y",cd.data.screen["scoreHeight"]/2)
    .text(function(d){return d.elapsedMS ; })
  // .text(function(d){return d.elapsedMS})
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "black");

/*
  cd.d3leaderBoard = cd.svg.selectAll("rect.leaderboard")
    .data(cd.data.leaderBoard)
    .enter()
    .append("rect")
    .attr("class","leaderboard")
    .attr("x", 10)
    .attr("y", function(d) { return ((cd.data.screen.height - d.index*10)); })
    .attr("width",10)
    .attr("height",10)
    .attr("fill",function(d) { return (d.color); })
*/

/*
  selectAll('path.link')
    .data(cd.data.links)
    .enter()
    .append("path")
    .attr("d", tick())
    .attr("class", "link")
    .attr("stroke", "blue")
    .attr("stroke-width", 1)
    .attr("fill", "none");
*/

  // store d3 elements for players in a convenient variable
  cd.d3players = cd.svg.selectAll('circle.player')
    .data(cd.data.players)
    .enter()
    .append('circle')
    .attr('class', 'player')
    .attr('cx', function(d) {
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    })
    .attr('r', function(d) {
      return d.radius;
    })
    .attr('fill', function(d) {
      return d.color;
    })
    .attr('stroke', 'black');

  // store d3 elements for players in a convenient variable
  cd.d3orbs = cd.svg.selectAll('circle.orb')
    .data(cd.data.orbs)
    .enter()
    .append('circle')
    .attr('class', 'orb')
    .attr('cx', function(d) {
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    })
    .attr('r', function(d) {
      return d.radius;
    })
    .attr('fill', util.randomRGB());
//        .attr('stroke', 'black');

  // this is what redraws each frame
  window.setInterval(updateFrame, 1000/cd.data.screen.frameRate);
}

var updateLeaderboard = function(){
  cd.d3leaderBoard = cd.scoreSvg.selectAll("rect.leaderboard")
    .data(cd.data.leaderBoard);

  cd.d3leaderBoard
    .enter()
    .append("rect")
    .attr("class","leaderboard")
    .attr("x", 20)
    .attr("y", function(d) { return (  (cd.data.leaderBoard.length - d.index)* 20 ); })
    .attr("width",60)
    .attr("height",20)
    .attr("fill",function(d) { return (d.color); });

  cd.d3leaderBoard
    .attr("rect.leaderboard","update")
    .transition()
    .attr("x", 20)
    .attr("y", function(d) { return ( (cd.data.leaderBoard.length - d.index)*20 ); })
    .attr("width",60)
    .attr("height",20)
    .attr("fill",function(d) { return (d.color); });

  cd.d3leaderBoard
    .exit()
    .remove(); 

  cd.d3leaderBoardText = cd.scoreSvg.selectAll("text.playerID")
    .data(cd.data.leaderBoard);

  cd.d3leaderBoardText
    .attr("text.playerID","update")
    .attr("x",30)
    .attr("y",function(d){return ((cd.data.leaderBoard.length - d.index) +30);})
    .text(function(d){return d.name ; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "black");

  cd.d3leaderBoardText
    .enter()
    .append('text')
    .attr("class","playerID")
    .attr("x",30)
    .attr("y",function(d){return ((cd.data.leaderBoard.length - d.index)*20+ 30 );})
    .text(function(d){return d.name ; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "black");        

  cd.d3leaderBoardText
    .exit()
    .remove();

  cd.d3leaderBoardTime = cd.scoreSvg.selectAll("text.time")
    .data(cd.data.game);

  cd.d3leaderBoardTime
    .attr("text.time","update")
    .attr("x",30)
    .attr("y",function(d){return ((cd.data.leaderBoard.length - d.index)*20 + 20);})
    .text(function(d){console.log("d");   return d.name ; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "black");  

  cd.d3leaderBoardTime
    .enter()
    .append('text')
    .attr("class","time")
    .attr("x",cd.data.screen["scoreWidth"]/2)
    .attr("y",cd.data.screen["scoreHeight"]/2)
    // .text(function(d){console.log(d);return d.elapsedMS})
    .text(function(d){return d.elapsedMS; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "black"); 
}    

var updateBackground = function(){
  cd.d3bg = cd.svg.selectAll("rect.background")
    .data(cd.data);
  cd.d3bg
    .enter()
    .append("rect")
    .attr('class','background')
    .attr('x',0)
    .attr('y',0)
    .attr('width', function(d) { return d.screen.width;} )
    .attr('height', function(d) { return d.screen.height;})
    .attr('fill','white');
}

var updatePlayer   = function(){
  cd.d3players = cd.svg.selectAll("circle.player").data(cd.data.players);
  cd.d3players
    .enter() // add any new players that have appeared in the data
    .append('circle')
    .attr('class', 'player')
    .attr('cx', function(d) {
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    })
    .attr('r', function(d) {
      return d.radius;
    })
    .attr('fill', function(d) {
      return d.color;
    })
    .attr('stroke', 'black');

  cd.d3players // remove any players that don't exist in the data anymore
    .exit()
    .transition() // we're going to fade them out
    .duration(200)
    .attr('stroke', 'none')
    .style("fill-opacity", 1e-6)
    .remove();
  cd.d3players.transition() // move any players that have moved in the data
    .attr('cx', function(d) {
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    })
    .attr('r', function(d) {
      return d.radius;
    })
    .attr('fill', function(d) {
      return d.color;
    })
    .attr('stroke', 'black');    
}

var updateLinks = function(){
  cd.d3links = cd.svg.selectAll("line.link")
    .data(cd.data.links);
    //FIXME: Update draws over circles dont know why.
  cd.d3links
    .attr("line.link","update")
    .transition()
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  cd.d3links
    .enter()
    .append("line")
    .attr("class","link")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .attr("stroke", "blue")
    .attr("stroke-width", 1)
    .attr("fill", "none");

  cd.d3links
    .exit()
    .remove();
}

var updateOrbs = function(){
  // same thing, but for orbs
  cd.d3orbs = cd.svg.selectAll("circle.orb").data(cd.data.orbs);
  cd.d3orbs
    .enter() // add any new orbs that have appeared in the data
    .append('circle')
    .attr('class', 'orb')
    .attr('cx', function(d) {
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    })
    .attr('r', function(d) {
      return d.radius;
    })
    .attr('fill', util.randomRGB());
    //        .attr('stroke', 'black');
  cd.d3orbs // remove any orbs that don't exist in the data anymore
    .exit()
    .transition() // we're going to fade them out
    .duration(200)
    //        .attr('fill', '#ffffff')
    .attr('r', 200)
    .style("fill-opacity", 1e-6)
    .remove();
  cd.d3orbs.transition() // move any orbs that have moved in the data
    .duration(100/cd.data.screen.frameRate)
    .attr('cx', function(d) {
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    })
    .attr('r', function(d) {
      return (Math.floor(Math.random() * d.radius)); // radius changes at random
    })
    .style("fill-opacity", 1)
    .attr('fill', util.randomRGB()) // color changes at random
    .attr('stroke', util.randomRGB());      
}

//get fresh state from game server
var getGameData = function() {
//console.log('in getGameData()');
d3.json('http://' + cd.server + '/games/  ' + cd.gameId, function(err, json) {
 if (err) {
   return console.warn(err);
 }
 cd.data = json;
// console.log(typeof(cd.data.game.elapsedMS));

});
};

var gameOver = function(){
  cd.d3leaderBoardText = cd.scoreSvg.selectAll("text.gameStatus")
    .data(cd.data.leaderBoard);

  cd.d3leaderBoardText
   .enter()
   .append('text')
    .attr("class","gameStatus")
    .attr("x",cd.data.screen["scoreWidth"]/2)
    .attr("y",cd.data.screen["scoreHeight"]/2)
    .text("Game Over!")
    .attr("font-family", "sans-serif")
    .attr("font-size", "12px")
    .attr("fill", "red");        
}

  return {
    "lineFunction": lineFunction,
    "initScreen": initScreen,
    "updateLeaderboard": updateLeaderboard,
    "updateBackground": updateBackground,
    "updatePlayer": updatePlayer,
    "updateLinks": updateLinks,
    "updateOrbs": updateOrbs,
    "gameOver": gameOver,
  };
});