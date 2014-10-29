var Utils = function() {
  var utils = {};

  utils.getTotalSpeed = function(xSpeed, ySpeed) {
    return Math.sqrt(xSpeed * xSpeed + ySpeed * ySpeed);
  };

  utils.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  utils.getRandomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
  };

  utils.yesNo = function() {
    return (this.getRandomInt(0,1) == 1) ? true:false;
  };

  utils.removeFromArray = function(array, item) {
    var itemIndex = array.indexOf(item);
    if (itemIndex >= 0) {
      array.splice(item, 1);
      return true;
    }
    return false;
  };

  return utils;
};
