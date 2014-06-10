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

var SnowBall = function() {
  var ball = new createjs.Bitmap(GaperGap.assets['snow-ball']);
  ball.regX = ball.image.width/2;
  ball.regY = ball.image.height/2;

  ball.destroy = function() {
    this.parent.removeChild(this);
  };

  ball.plow = function() {
    var xDest = GaperGap.utils.getRandomInt(-40, 40);
    var yDest = GaperGap.utils.getRandomInt(-40, 0);
    var angle = GaperGap.utils.getRandomInt(0, 360);

    createjs.Tween.get(ball, {override:true}).to({
      x: xDest,
      y: yDest,
      rotation: angle
    }, 700, createjs.Ease.sineOut).to({
      alpha: 0
    }, 1000, createjs.Ease.sineOut).call(this.destroy);
  };
  return ball;
};