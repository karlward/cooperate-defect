define(function() {
  var cd = new Object(); // for cooperate-defect package globals
  cd.gameId = 1; // FIXME: lookup instead of hardcoding
  //  cd.server = 'drake.itp.tsoa.nyu.edu:8000';
  cd.server = 'localhost:8000';	
  return cd;
});