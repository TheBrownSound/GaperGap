var Shred = function(size) {
  var flake = new createjs.Shape();

  var g = flake.graphics;
  g.beginFill('#FFF');
  // g.beginFill('#F00');
  g.drawCircle(0,0,size);
  g.endFill();

  flake.animate = function(xVel,yVel) {
    createjs.Tween.get(flake, {override:true}).to({
      x: flake.x+xVel,
      y: flake.y+yVel,
      alpha: 0
    }, 700, createjs.Ease.sineOut);
  };

  return flake;
};