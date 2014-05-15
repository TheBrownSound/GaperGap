var Hill = function(player){
  var _width = 300;
  var _height = 300;

  var section_size = 1000;
  var section_density = 20;
  var sections = [];

  var hill = new createjs.Container();
  var snow = new createjs.Shape();
  var sectionWrapper = new createjs.Container();

  hill.addChild(snow, player, sectionWrapper);

  function drawHill() {
    var crossWidth = _width*2 + _height*2;
    snow.graphics.clear();
    snow.graphics.beginBitmapFill(GaperGap.assets['hill-background']);
    snow.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);
    snow.graphics.endFill();
  }

  function addSection(xCoord, yCoord) {
    console.log('Hill:addSection - ', xCoord, yCoord);
    var section = new Section(section_size, section_density);
    section.x = xCoord;
    section.y = yCoord;
    sections.push(section);
    sectionWrapper.addChild(section);
  }

  hill.update = function() {
    //document.getElementById('coords').innerHTML = ('x:'+hill.position.x+' - y:'+hill.position.y);
    snow.x = (snow.x+player.speed.x) % 400;
    snow.y = (snow.y+player.speed.y) % 400;
    sectionWrapper.x += player.speed.x;
    sectionWrapper.y += player.speed.y;

    for (var section in sections) {
      // check if the player is currently in the section,
      // if it is, do hittests on section features
      /*
      for (var feature in features) {
        var hit = ndgmr.checkPixelCollision(player.hitArea, features[feature].hitArea, 0, true);
        if (hit) {
          features[feature].hit(player, hit);
        }
      }*/
      
      // check if section is higher than the screen, if it is remove it!
    }

    // do logic to check to see if we need to add another section.
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
