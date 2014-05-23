var Section = function(size, density) {
  density = density || 10;
  var _features = [];
  var section = new createjs.Container();
  var debugShape = new createjs.Shape();
  debugShape.graphics.beginStroke("#F00").drawRect(0, 0, size, size).endStroke();

  section.addChild(debugShape);

  while (_features.length < density) {
    var switcher = GaperGap.utils.getRandomInt(0,10);
    var feature = (switcher > 9) ? new Jump() : new Tree();
    feature.x = GaperGap.utils.getRandomInt(0,size);
    feature.y = GaperGap.utils.getRandomInt(0,size);
    _features.push(feature);
    section.addChild(feature);
  }

  section.__defineGetter__('features', function(){
    return _features;
  });

  return section;
};