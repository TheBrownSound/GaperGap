var PowderPatch = function() {
  var patch = new createjs.Bitmap(GaperGap.assets['powder-patch']);
  patch.type = 'powder';

  patch.hit = function(player, collision) {
    if (!player.airborne) {
      player.sink(this);
    }
  };

  patch.__defineGetter__('hitArea', function(){
    return patch;
  });

  patch.__defineGetter__('background', function(){
    return patch;
  });

  return patch;
};