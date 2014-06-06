var Jump = function() {
  var jump = new createjs.Container();
  var suffix = "s";
  var kick = 0.5;
  var switcher = GaperGap.utils.getRandomInt(0,4);

  if (switcher >= 4) {
    suffix = "m";
    kick = 0.7;
  }

  var kicker = new createjs.Bitmap(GaperGap.assets['jump-'+suffix]);
  
  kicker.regX = kicker.image.width/2;
  // kicker.regY = kicker.image.height;

  jump.hit = function(player) {
    var thrust = Math.round(GaperGap.utils.getTotalSpeed(player.speed.x, player.speed.y)*kick);
    player.jump(thrust);
    player.drop(kicker.image.height/2);
  };
  
  jump.__defineGetter__('hitArea', function(){
    return kicker;
  });

  jump.addChild(kicker);

  jump.__defineGetter__('background', function(){
    return jump;
  });

  return jump;
};