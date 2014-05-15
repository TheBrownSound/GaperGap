var Section = function(size, density) {
  density = density || 10;
  var _features = [];
  var section = new createjs.Container();

  while (_features.length < density) {
    var switcher = GaperGap.utils.getRandomInt(0,5);
    var feature = (switcher > 3) ? new Jump() : new Tree();
    feature.x = GaperGap.utils.getRandomInt(size,size);
    feature.y = GaperGap.utils.getRandomInt(size,size);
    _features.push(feature);
    section.addChild(feature);
  }

  section.__defineGetter__('features', function(){
    return _features;
  });

  return section;
};