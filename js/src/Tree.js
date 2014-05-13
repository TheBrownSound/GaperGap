var Tree = function() {
  var hitSize = 40;

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

  tree.__defineGetter__('hitArea', function(){
    return graphic;
  });

  return tree;
};