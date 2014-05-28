var Tree = function() {
  var hitSize = 40;
  var hasBeenHit = false;

  var tree = {};
  var trunk = new createjs.Bitmap(GaperGap.assets['trunk']);
  var branches = new createjs.Container();
  var leaves = new createjs.Bitmap(GaperGap.assets['tree']);
  
  branches.addChild(leaves);

  trunk.regX = trunk.image.width/2;
  trunk.regY = trunk.image.height;
  branches.regY = trunk.image.height*0.7;
  leaves.regX = leaves.image.width/2;
  leaves.regY = leaves.image.height*0.9;

  tree.hit = function(player, collision) {
    player.crash();
    if (!hasBeenHit) {
      var coords = trunk.globalToLocal(collision.x, collision.y);
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

  tree.__defineGetter__('foreground', function(){
    return branches;
  });

  tree.__defineGetter__('background', function(){
    return trunk;
  });

  tree.__defineSetter__('x', function(val){
    _x = trunk.x = branches.x = val;
    return _x;
  });

  tree.__defineGetter__('x', function(){
    return _x;
  });

  tree.__defineSetter__('y', function(val){
    _y = trunk.y = branches.y = val;
    return _y;
  });

  tree.__defineGetter__('y', function(){
    return _y;
  });

  return tree;
};