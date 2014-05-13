var Tree = function() {
  var hitSize = 40;
  var hasBeenHit = false;

  var tree = new createjs.Container();
  var trunk = new createjs.Bitmap(GaperGap.assets['trunk']);
  var branches = new createjs.Bitmap(GaperGap.assets['tree']);

  trunk.regX = trunk.image.width/2;
  trunk.regY = trunk.image.height;
  branches.regX = branches.image.width/2;
  branches.regY = branches.image.height*0.9;

  branches.y = -trunk.image.height*0.7;

  tree.addChild(trunk, branches);

  tree.hit = function(player, collision) {
    player.crash();
    if (!hasBeenHit) {
      var coords = tree.globalToLocal(collision.x, collision.y);
      var impact = -(coords.x);
      createjs.Tween.get(branches, {override:false})
        .to({rotation:impact/2}, 100, createjs.Ease.circIn)
        .to({rotation:impact/4}, 3000, createjs.Ease.elasticOut);
      hasBeenHit = true;
    }
  };

  tree.__defineGetter__('hitArea', function(){
    return trunk;
  });

  return tree;
};