var Hill = function(player){
  var _width = 300;
  var _height = 300;

  var features = [];

  var hill = new createjs.Container();
  var snow = new createjs.Shape();
  var featureWrapper = new createjs.Container();

  hill.addChild(snow, player, featureWrapper);

  var featureInterval = setInterval(addFeature, 500);

  function drawHill() {
    var crossWidth = _width*2 + _height*2;
    snow.graphics.clear();
    snow.graphics.beginBitmapFill(GaperGap.assets['hill-background']);
    snow.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);
    snow.graphics.endFill();
  }

  function addFeature() {
    console.log('addFeature');
    var tree = new Tree();
    features.push(tree);
    tree.x = (-featureWrapper.x)+GaperGap.utils.getRandomInt(-_width*2,_width*2);
    tree.y = (-featureWrapper.y)+(_height*2);
    featureWrapper.addChild(tree);
  }

  hill.update = function() {
    //document.getElementById('coords').innerHTML = ('x:'+hill.position.x+' - y:'+hill.position.y);
    snow.x = (snow.x+player.speed.x) % 400;
    snow.y = (snow.y+player.speed.y) % 400;
    featureWrapper.x += player.speed.x;
    featureWrapper.y += player.speed.y;
  };

  hill.__defineSetter__('height', function(value){
    _height = value;
    return _height;
  });

  hill.__defineGetter__('height', function(){
    return _height;
  });

  hill.__defineSetter__('width', function(value){
    _height = value;
    return _width;
  });

  hill.__defineGetter__('width', function(){
    return _width;
  });

  drawHill(); // trigger draw on create;

  return hill;
};
