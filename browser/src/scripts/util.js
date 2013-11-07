define(function() {
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

  var toHHMMSS = function (time) {
    var sec_num = parseInt(time, 10); // don't forget the second parm
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    var timeString = hours + ':' + minutes + ':' + seconds;
    return timeString;
  }
  
  return {
    "randomRGB": randomRGB,
    "toHHMMSS": toHHMMSS,
  };
});
