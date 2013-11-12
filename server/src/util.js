//utility functions
var util = new Object();

// return an array that has all unique values from array "a"
var deduplicate = function(a){
  var unique = new Array();
  for (var i in a) {
    if (!util.contains(unique, a[i])) {
      unique.push(a[i]);
    }  
  }
  /*console.log('deduplicate from: ');
  console.dir(a);
  console.log('deduplicate to: ');
  console.dir(unique);*/
  return unique;
}

// does object "a" contain item "obj"? true/false
var contains = function(a, obj) {
  if (a.indexOf(obj) !== -1) {
    return true;
  }
  else {
    return false;
  }
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