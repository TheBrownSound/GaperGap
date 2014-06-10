var PowderStash = function() {
  var stash = new createjs.Bitmap(GaperGap.assets['powder-stash']);
  stash.type = 'powder';

  stash.hit = function(player, collision) {
    if (!player.airborne) {
      player.sink(this);
    }
  };

  stash.__defineGetter__('hitArea', function(){
    return stash;
  });

  stash.__defineGetter__('background', function(){
    return stash;
  });

  return stash;
};