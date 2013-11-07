//utility functions
var util = new Object();

// return an array that has all unique values from array "a"
var deduplicate = function(a){
  var seen = new Object();
  for (i in a) {
    seen[a[i]]++;
  }
  return Object.keys(seen);
}

// does object "obj" contain item "a"? true/false
var contains = function(a, obj) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] == obj) {
      return true;
    }
  }
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

// return true/false at random
var flipCoin = function() {
  if (Math.random() < 0.5) {
    return -1;
  }
  else {
    return 1;
  }
};

// comparator function
function sortBy(prop) {
  return function(a,b) {
    if (a[prop] > b[prop]){
      return 1;
    }
    else if (a[prop] < b[prop]){
      return -1;
    }
    return 0;
  }
}

util = {
    "deduplicate": deduplicate,
    "contains": contains,
    "randomRGB": randomRGB,
    "flipCoin": flipCoin,
    "sortBy": sortBy,
};
module.exports = util;