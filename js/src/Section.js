var Section = function(size, density, coords) {
  density = (undefined) ? 10 : density;
  var section = {};
  var sectionTypes = [];
  var _x = 0;
  var _y = 0;
  var _location = {
    x: coords.x || 0,
    y: coords.y || 0
  };

  var _features = [];
  var _foreground = new createjs.Container();
  var _background = new createjs.Container();
  var trackShape = new createjs.Shape();
  var debugOutline = new createjs.Shape();

  debugOutline.graphics.beginStroke("#F00").drawRect(0, 0, size, size).endStroke();
  _background.addChild(debugOutline);

  //_background.addChild(trackShape);
  // trackShape.alpha = 0.3;

  if (coords.y < 0) {
    sectionTypes.push("sky");
  }

  populateSection(sectionTypes);

  function populateSection(types) {
    console.log("section:type", types);
    if ( types.indexOf('sky') >= 0 ) {
      var sky = new createjs.Bitmap(GaperGap.assets['sky']);
      _background.addChild(sky);
    } else {
      while (_features.length < density) {
        var feature = getRandomFeature();
        feature.x = GaperGap.utils.getRandomInt(0,size);
        feature.y = GaperGap.utils.getRandomInt(0,size);
        addFeature(feature);
      }

      _background.sortChildren(sortFeatures);
      _foreground.sortChildren(sortFeatures);
    }
  }

  function getRandomFeature() {
    var selector = GaperGap.utils.getRandomInt(0,10);
    switch(selector) {
      case 1:
        return new Cliff();
      case 2:
        return new Jump();
      default:
        return new Tree();
    }
  }

  function addFeature(feature) {
    _features.push(feature);

    if (feature.background) {
      _background.addChild(feature.background);
    }
    if (feature.foreground) {
      _foreground.addChild(feature.foreground);
    }
  }

  function sortFeatures(child1, child2, options) {
    if (child1.y > child2.y) { return 1; }
    if (child1.y < child2.y) { return -1; }
    return 0;
  }

  section.drawTrack = function(x,y) {
    trackShape.graphics.beginFill("#000").drawCircle(x, y, 4).endFill();
  };

  section.__defineGetter__('foreground', function(){
    return _foreground;
  });

  section.__defineGetter__('background', function(){
    return _background;
  });

  section.__defineGetter__('features', function(){
    return _features;
  });

  section.__defineGetter__('location', function(){
    return _location;
  });

  section.__defineSetter__('x', function(val){
    _x = _foreground.x = _background.x = val;
    return _x;
  });

  section.__defineGetter__('x', function(){
    return _x;
  });

  section.__defineSetter__('y', function(val){
    _y = _foreground.y = _background.y = val;
    var center = _foreground.globalToLocal(GaperGap.width/2,GaperGap.height/2);
    for (var i = 0; i < _foreground.getNumChildren(); i++) {
      var child = _foreground.getChildAt(i);
      if (child.y < center.y) {
        _background.addChild(child);
      }
    }
    return _y;
  });

  section.__defineGetter__('y', function(){
    return _y;
  });

  return section;
};
