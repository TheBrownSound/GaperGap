var Tree = function() {
  var hitSize = 40;
  var hasBeenHit = false;

  var tree = new createjs.Container();
  tree.type = 'tree';
  
  var leaves = new createjs.Bitmap(
    GaperGap.assets['tree-'+GaperGap.utils.getRandomInt(1,3)]
  );

  var trunk = new createjs.Bitmap(
    GaperGap.assets['trunk-'+GaperGap.utils.getRandomInt(1,2)]
  );
  var hitBox = new createjs.Bitmap(GaperGap.assets['trunk-hitbox']);
  hitBox.alpha = 0;
  
  tree.addChild(hitBox, trunk, leaves);

  hitBox.regX = hitBox.image.width/2;
  hitBox.regY = hitBox.image.height;
  trunk.regX = trunk.image.width/2;
  trunk.regY = trunk.image.height;
  leaves.regX = leaves.image.width/2;
  leaves.regY = leaves.image.height*0.8;
  leaves.y = -trunk.image.height;

  //leaves.scaleX = (GaperGap.utils.yesNo()) ? 1:-1;// Reverses tree, note: messes up hit detection :(

  tree.hit = function(player, collision) {
    if (!player.airborne && collision.width > 25*player.scaleX) {
      player.crash("tree");
    }

    if (!hasBeenHit) {
      player.hit(tree);
      var coords = trunk.globalToLocal(collision.x, collision.y);
      var impact = (coords.x-(trunk.image.width/2));
      createjs.Tween.get(leaves, {override:false})
        .to({rotation:-impact/2}, 100, createjs.Ease.circIn)
        .to({rotation:-impact/4}, 3000, createjs.Ease.elasticOut);
      hasBeenHit = true;
    }
  };

  tree.__defineGetter__('hitArea', function(){
    return hitBox;
  });

  tree.__defineGetter__('foreground', function(){
    return tree;
  });

  return tree;
};