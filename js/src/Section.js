var Section = function(size, density) {
  density = density || 10;
  var _features = [];
  var section = new createjs.Container();
  var trackShape = new createjs.Shape();
  var debugOutline = new createjs.Shape();
  debugOutline.graphics.beginStroke("#F00").drawRect(0, 0, size, size).endStroke();

  section.addChild(trackShape,debugOutline);
  trackShape.alpha = 0.3;

  while (_features.length < density) {
    var switcher = GaperGap.utils.getRandomInt(0,10);
    var feature = (switcher > 9) ? new Jump() : new Tree();
    feature.x = GaperGap.utils.getRandomInt(0,size);
    feature.y = GaperGap.utils.getRandomInt(0,size);
    _features.push(feature);
    section.addChild(feature);
  }

  section.drawTrack = function(x,y) {
    trackShape.graphics.beginFill("#00").drawCircle(x, y, 4).endFill();
  };

  section.__defineGetter__('features', function(){
    return _features;
  });

  return section;
};