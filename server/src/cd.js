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
    "players": [],
    "orbs": [],
    "links": [],
    "leaderBoard":[],
    "groups":[]
};

module.exports = cd;