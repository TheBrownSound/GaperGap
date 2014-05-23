var Hill = function(player){
  var _width = 300;
  var _height = 300;

  var section_size = 1000;
  var section_density = 6;
  var sections = {};

  var hill = new createjs.Container();
  var snow = new createjs.Shape();
  var sectionWrapper = new createjs.Container();

  var hillDebugMarker = new createjs.Shape();

  sectionWrapper.addChild(hillDebugMarker);
  hill.addChild(snow, player, sectionWrapper);


  function drawHill() {
    var crossWidth = _width*2 + _height*2;
    snow.graphics.clear();
    snow.graphics.beginBitmapFill(GaperGap.assets['hill-background']);
    snow.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);
    snow.graphics.endFill();
  }

  function addSection(col, row) {
    console.log('Hill:addSection - ', col, row);
    var section = new Section(section_size, section_density);
    section.x = col*section_size;
    section.y = row*section_size;
    sections[col+'_'+row] = section;
    sectionWrapper.addChild(section);
  }

  hill.update = function() {
    //document.getElementById('coords').innerHTML = ('x:'+hill.position.x+' - y:'+hill.position.y);
    snow.x = (snow.x+player.speed.x) % 400;
    snow.y = (snow.y+player.speed.y) % 400;
    sectionWrapper.x += player.speed.x;
    sectionWrapper.y += player.speed.y;
    var currentSection = {
      col: Math.floor(-sectionWrapper.x/section_size),
      row: Math.floor(-sectionWrapper.y/section_size)
    };
    
    // hillDebugMarker.graphics.clear().beginStroke('#F00').drawRect(visibleHill.x,visibleHill.y,visibleHill.width, visibleHill.height);
    var visibleSections = getVisibleSections();

    for (var visibleSection in visibleSections) {
      var gridPosition = visibleSections[visibleSection];
      if (!sections[gridPosition.column+'_'+gridPosition.row]) {
        addSection(gridPosition.column, gridPosition.row);
      }
    }
    
    for (var section in sections) {
      // check if section is higher than the screen, if it is remove it!
      var sect = sections[section];
      if (sect.y+section_size < (-sectionWrapper.y) - (_height/2)) {
        sectionWrapper.removeChild(sect);
        delete sections[section];
      } else {
        if (section == currentSection.col+"_"+currentSection.row) {
          var playerLoc = this.localToLocal(0,0, sectionWrapper);
          console.log(playerLoc.y);
          sect.drawTrack(playerLoc.x, playerLoc.y);
        }
        var features = sect.features;
        for (var feature in features) {
          var hit = ndgmr.checkPixelCollision(player.hitArea, features[feature].hitArea, 0, true);
          if (hit) {
            features[feature].hit(player, hit);
          }
        }
      }
    }

  };

  function getVisibleSections() {
    var x = (-sectionWrapper.x) - (_width/2);
    var y = (-sectionWrapper.y) - (_height/2);

    var visibleKeys = [];
    var startingColumn = Math.floor(x/section_size);
    var startingRow = Math.floor(y/section_size);

    var cols = Math.ceil(_width/section_size)+1;
    var rows = Math.ceil(_height/section_size)+1;

    for (var i = 0; i < cols*rows; i++) {
      var col = i%cols+startingColumn;
      var row = Math.floor(i/cols)+startingRow;
      visibleKeys.push({column:col, row:row});
    }

    return visibleKeys;
  }

  hill.__defineSetter__('height', function(value){
    _height = value;
    return _height;
  });

  hill.__defineGetter__('height', function(){
    return _height;
  });

  hill.__defineSetter__('width', function(value){
    _width = value;
    return _width;
  });

  hill.__defineGetter__('width', function(){
    return _width;
  });

  drawHill(); // trigger draw on create;

  return hill;
};
