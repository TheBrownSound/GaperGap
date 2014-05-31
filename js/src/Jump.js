var Jump = function() {
  var jump = new createjs.Container();
  var kicker = new createjs.Bitmap(GaperGap.assets['jump']);
  
  kicker.regX = kicker.image.width/2;
  // kicker.regY = kicker.image.height;

  jump.hit = function(player) {
    player.jump(5);
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