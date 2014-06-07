var Hill = function(player){
  var _xPos = 0;
  var _yPos = 0;
  var _width = 300;
  var _height = 300;

  var section_size = 1000;
  var section_density = 6;
  var sections = {};

  var hill = new createjs.Container();
  var snow = new createjs.Shape();
  var hillForeground = new createjs.Container();
  var hillParticles = new createjs.Container();
  var hillBackground = new createjs.Container();

  var logo = new createjs.Bitmap(GaperGap.assets['logo']);
  logo.regX = logo.image.width/2;
  logo.regY = 340;

  // var hillDebugMarker = new createjs.Shape();

  // hillWrapper.addChild(hillDebugMarker);
  hill.addChild(snow, hillBackground, hillParticles, player, hillForeground, logo);

  player.addEventListener('jump', playerJumped);
  player.addEventListener('land', playerLanded);

  function drawHill() {
    var crossWidth = _width*2 + _height*2;
    snow.graphics.clear();
    snow.graphics.beginBitmapFill(GaperGap.assets['hill-background']);
    snow.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);
    snow.graphics.endFill();
  }

  function addSection(col, row) {
    console.log('Hill:addSection - ', col, row);
    var section = new Section(section_size, section_density, {
      x:col*section_size,
      y:row*section_size
    });
    section.x = col*section_size;
    section.y = row*section_size;
    sections[col+'_'+row] = section;
    hillForeground.addChild(section.foreground);
    hillBackground.addChild(section.background);
  }

  function removeSection(section) {
    hillForeground.removeChild(section.foreground);
    hillBackground.removeChild(section.background);
  }

  function playerJumped() {
    console.log("player Jumped");
    hill.addChild(player);
  }

  function playerLanded() {
    console.log("player Landed");
    hill.addChildAt(player, hill.getChildIndex(hillBackground)+1);
  }

  hill.update = function() {
    //document.getElementById('coords').innerHTML = ('x:'+hill.position.x+' - y:'+hill.position.y);
    snow.x = (snow.x+player.speed.x) % 400;
    snow.y = (snow.y+player.speed.y) % 400;
    logo.x = hillParticles.x += player.speed.x;
    logo.y = hillParticles.y += player.speed.y;
    _xPos += player.speed.x;
    _yPos += player.speed.y;

    
    var currentSection = {
      col: Math.floor(-_xPos/section_size),
      row: Math.floor(-_yPos/section_size)
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

      if (sect.y+section_size < (-_height/2) ) {
        console.log("removing section");
        removeSection(sect);
        delete sections[section];
      } else {
        /*
        if (section == currentSection.col+"_"+currentSection.row) {
          var playerLoc = this.localToLocal(0,0, sectionWrapper);
          console.log(playerLoc.y);
          sect.drawTrack(playerLoc.x, playerLoc.y);
        }
        */
        var features = sect.features;
        for (var feature in features) {
          var feat = features[feature];
          var hit = ndgmr.checkPixelCollision(player.hitArea, feat.hitArea, 0, true);
          if (hit) {
            feat.hit(player, hit);
          }
        }
      }

      //Move section
      sect.x = sect.location.x+_xPos;
      sect.y = sect.location.y+_yPos;
    }
  };

  function getVisibleSections() {
    var x = (-_xPos) - (_width/2);
    var y = (-_yPos) - (_height/2);

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

  hill.reset = function() {
    for (var section in sections) {
      removeSection(sections[section]);
      delete sections[section];
    }
    logo.x = hillParticles.x = logo.y = hillParticles.y =_xPos = _yPos = 0;
    hill.update();
  };

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

  hill.__defineGetter__('distance', function(){
    return Math.round(-_yPos);
  });

  drawHill(); // trigger draw on create;

  return hill;
};
