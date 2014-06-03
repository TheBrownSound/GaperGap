var Tree = function() {
  var hitSize = 40;
  var hasBeenHit = false;

  var tree = {};
  
  var branches = new createjs.Container();
  var leaves = new createjs.Bitmap(
    GaperGap.assets['tree-'+GaperGap.utils.getRandomInt(1,3)]
  );

  var base = new createjs.Container();
  var trunk = new createjs.Bitmap(
    GaperGap.assets['trunk-'+GaperGap.utils.getRandomInt(1,2)]
  );
  var hitBox = new createjs.Bitmap(GaperGap.assets['trunk-hitbox']);
  //hitBox.alpha = 0;
  
  base.addChild(hitBox, trunk);
  branches.addChild(leaves);

  hitBox.regX = hitBox.image.width/2;
  hitBox.regY = hitBox.image.height;
  trunk.regX = trunk.image.width/2;
  trunk.regY = trunk.image.height;
  branches.regY = trunk.image.height;
  leaves.regX = leaves.image.width/2;
  leaves.regY = leaves.image.height*0.8;

  //leaves.scaleX = (GaperGap.utils.yesNo()) ? 1:-1;// Reverses tree, note: messes up hit detection :(

  tree.hit = function(player, collision) {
    if (!player.airborne && collision.width > 25) {
      player.crash();
    }

    if (!hasBeenHit) {
      var coords = trunk.globalToLocal(collision.x, collision.y);
      var impact = (coords.x-(trunk.image.width/2));
      createjs.Tween.get(branches, {override:false})
        .to({rotation:-impact/2}, 100, createjs.Ease.circIn)
        .to({rotation:-impact/4}, 3000, createjs.Ease.elasticOut);
      hasBeenHit = true;
    }
  };

  tree.__defineGetter__('hitArea', function(){
    return hitBox;
  });

  tree.__defineGetter__('foreground', function(){
    return branches;
  });

  tree.__defineGetter__('background', function(){
    return base;
  });

  tree.__defineSetter__('x', function(val){
    _x = base.x = branches.x = val;
    return _x;
  });

  tree.__defineGetter__('x', function(){
    return _x;
  });

  tree.__defineSetter__('y', function(val){
    _y = base.y = val;
    branches.y = val-20;
    return _y;
  });

  tree.__defineGetter__('y', function(){
    return _y;
  });

  return tree;
};