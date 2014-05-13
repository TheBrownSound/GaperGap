var Tree = function() {
  var hitSize = 40;
  var hasBeenHit = false;

  var tree = new createjs.Container();
  var graphic = new createjs.Bitmap(GaperGap.assets['tree']);
  var hitContainer = new createjs.Container();
  var hitArea = new createjs.Shape();

  graphic.regX = graphic.image.width/2;
  graphic.regY = graphic.image.height;

  hitArea.graphics.beginFill("red").drawCircle(0, 0, hitSize/2);
  hitContainer.addChild(hitArea);
  tree.addChild(hitContainer, graphic);
  hitContainer.cache(-hitSize/2,-hitSize/2,hitSize,hitSize);

  tree.hit = function(collision) {
    if (!hasBeenHit) {
      var coords = tree.globalToLocal(collision.x, collision.y);
      var impact = -(coords.x);
      createjs.Tween.get(graphic, {override:false})
        .to({rotation:impact/2}, 100, createjs.Ease.circIn)
        .to({rotation:impact/4}, 3000, createjs.Ease.elasticOut);
      hasBeenHit = true;
    }
  };

  tree.__defineGetter__('hitArea', function(){
    return graphic;
  });

  return tree;
};