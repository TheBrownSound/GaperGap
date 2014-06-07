var Cliff = function(variant) {
  variant = variant || 'cliff-'+GaperGap.utils.getRandomInt(1,1);
  var cliff = new createjs.Bitmap(GaperGap.assets[variant]);

  cliff.regX = cliff.image.width/2;
  cliff.regY = cliff.image.height/2;

  cliff.hit = function(player, collision) {
    var coords = cliff.globalToLocal(collision.x, collision.y);
    console.log("Cliff:hit - ", coords.y);
    player.drop(cliff.image.height-coords.y);
  };

  cliff.__defineGetter__('hitArea', function(){
    return cliff;
  });

  cliff.__defineGetter__('background', function(){
    return cliff;
  });
  
  return cliff;
};