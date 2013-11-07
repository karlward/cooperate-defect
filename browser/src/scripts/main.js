require(['util', 'drawing', 'cd'], function(util, drawing, cd) {

  var elapsedTimeString = "0";
  // when DOM is ready, pull in state from game server, call initScreen
  $(document).ready(function() {
    //console.log('in getGame()');
    d3.json('http://' + cd.server + '/games/' + cd.gameId, function(err, json) {
      if (err) {
        return console.warn(err);
      }
      //console.log('got JSON');
      cd.data = json;
      $.ajax({
        dataType: 'json',
        url: 'http://' + cd.server + '/players/',
        type: 'POST',
        success: function(postData) {
          //console.log("POST succeeded for new player " + postData.id);
          console.dir(postData);
          cd.playerId = postData.id;
          //console.log('set playerId to ' + cd.playerId);
        },
        error: function() {
          //console.log("POST failed for new player");
        }
      });
      drawing.initScreen();
    });

    // capture controller keys
    $('input#controller').keydown(function(e) {
      e = e || window.event; // shim
      //console.log('checkKey fired for ' + e.keyCode);
      var data = new Object();
      var controlKeys = {38: "up", 40: "down", 37: "left", 39: "right", 67: "cooperate", 68: "defect"};
      if (!!controlKeys[e.keyCode]) {
        if (controlKeys[e.keyCode].match(/cooperate|defect/)) {
          //console.log('setting state to ' + controlKeys[e.keyCode]);
          data.state = controlKeys[e.keyCode];
        }
        else {
          //console.log('setting move to ' + controlKeys[e.keyCode]);
          data.move = controlKeys[e.keyCode];
        }
        $.ajax({
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          url: 'http://' + cd.server + '/players/' + cd.playerId,
          type: 'PATCH',
          data: JSON.stringify(data),
          success: function() {
            //console.log("PATCH succeeded");
          },
          error: function() {
            //console.log("PATCH failed");
          }
        });
      }
    });
  });
});