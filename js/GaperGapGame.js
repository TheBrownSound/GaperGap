// Fuse dependencies
var Utils = function() {
  var utils = {};

  utils.getTotalSpeed = function(xSpeed, ySpeed) {
    return Math.sqrt(xSpeed * xSpeed + ySpeed * ySpeed);
  }

  utils.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  utils.getRandomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
  }

  utils.yesNo = function() {
    return (this.getRandomInt(0,1) == 1) ? true:false;
  }

  utils.removeFromArray = function(array, item) {
    var itemIndex = array.indexOf(item);
    if (itemIndex >= 0) {
      array.splice(item, 1);
      return true;
    }
    return false;
  }

  return utils;
};
var Game = function() {
  var game = new createjs.Container();
  var momentum = {x: 0, y: 0};
  var player = new Player();
  var hill = new Hill(player);

  game.addChild(hill);

  var updateInterval = setInterval(updateGame, Math.floor(1000/60));
  var viewInterval = setInterval(updateView, 500);

  function updateView() {
    var totalSpeed = GaperGap.utils.getTotalSpeed(player.speed.x, player.speed.y);
    document.getElementById('speed').innerHTML = "Speed: "+totalSpeed;
    //var scale = Math.floor(player.maxSpeed-totalSpeed)/(player.maxSpeed*2)+0.5;
    if (totalSpeed > 10) {
      changeScale(0.5);
    } else if (totalSpeed > 6) {
      changeScale(0.75);
    } else {
      changeScale(1);
    }
  }

  function updateGame() {
    player.update();
    hill.update();
  }

  function changeScale(perc) {
    if (perc != game.scaleX) {
      createjs.Tween.get(game, {override:true}).to({
        scaleX:perc,
        scaleY:perc
      }, 4000, createjs.Ease.sineOut);
    }
  }

  GaperGap.addEventListener('onKeyDown', function(event) {
    switch(event.key) {
      case 37: //Left
        player.turnRight();
        break;
      case 38: //Up
        player.tuckDown(true);
        break;
      case 39: //Right
        player.turnLeft();
        break;
      case 40: //Down
        player.scrubSpeed(true);
        break;
      default:
        console.log("unhandled keydown! - ", event.key);
    }
  });

  GaperGap.addEventListener('onKeyUp', function(event) {
    switch(event.key) {
      case 37: //Left
      case 39: //Right
        player.stopTurning();
        break;
      case 38: //Up
        player.tuckDown(false);
        break;
      case 40: //Down
        player.scrubSpeed(false);
        break;
      default:
        console.log("unhandled keyup! - ", event.key);
    }
  });

  GaperGap.addEventListener('stageResized', function(event){
    console.log('stageResized', event);
    game.x = event.width/2;
    game.y = event.height/2;
    hill.width = event.width;
    hill.height = event.height;
  });
  
  return game;
};
var Player = function() {
  var player = new createjs.Container();
  var gaper = new createjs.Bitmap(GaperGap.assets['skier']);

  var pantsData = {
    images: [GaperGap.assets['pants-sprite']],
    frames: {width:30, height: 25}
  };

  var pantsSprite = new createjs.SpriteSheet(pantsData);
  var pants = new createjs.Sprite(pantsSprite);
  pants.regX = pantsData.frames.width/2;
  pants.y = -pantsData.frames.height+4;
  pants.gotoAndStop(2);

  var skiData = {
     images: [GaperGap.assets['ski-sprite']],
     frames: {width:10, height:60}
  };

  var ski = new createjs.SpriteSheet(skiData);
  var leftSki = new createjs.Sprite(ski);
  var rightSki = new createjs.Sprite(ski);

  gaper.regX = gaper.image.width/2;
  gaper.regY = gaper.image.height;
  gaper.y = -8;

  leftSki.regX = rightSki.regX = skiData.frames.width/2;
  leftSki.regY = rightSki.regY = skiData.frames.height/2;

  leftSki.gotoAndStop(2);
  rightSki.gotoAndStop(2);

  leftSki.x = -10;
  rightSki.x = 10;

  player.addChild(leftSki, rightSki, pants, gaper);

  var _acceleration = 10;//updates it takes to get to full greatest turn amount
  var _jumping = false;
  var _jumpAngle = 0;

  // Speed Variables
  var _speed = 0;
  var _speedMomentum = 0;
  var _maxSpeed = 8;

  // Tuck Variables
  var _tucking = false;
  var _tuck = 0;
  var _tuckRate = 0.2;
  var _maxTuck = 4;

  // Scrub Variables
  var _scrubbing = false;
  var _scrubRate = 0.2;

  // Turning Variables
  var _direction = null;
  var _turnAngle = -90;
  var _turnMomentum = 0;
  var _maxTurnAngle = 90;

  function calculateSpeed() {
    // calculate potential speed momentum
    if (_scrubbing) {
      _speed -= _scrubRate;
    } else {
      var angle = (_jumping) ? _jumpAngle : _turnAngle;
      var accel = 85-(Math.abs(angle));
      accel =  Math.round( accel * 10) / 1000; // decreases number/decimal for animation
      //console.log("SPEED!: ",accel);
      _speed += accel;
      if (_speed > _maxSpeed) {
        _speed = _maxSpeed;
      }
      _speed += calculateTuckModifier();
    }

    if (_speed < 0) {
      _speed = 0;
    }
    
    return _speed;
  }

  function calculateTuckModifier() {
    //Player tucking?
    if (_tucking && _tuck < _maxTuck) {
      _tuck += _tuckRate; // GO FAST!
    } else if (_tuck > 0) {
      _tuck -= _tuckRate;
    }

    return _tuck;
  }

  function calculateTurnAngle() {
    // Should be called at update intervals
    if (_direction == "left" || (!_direction && _turnMomentum > 0)) {
      decreaseTurnRate();
    }
    if (_direction == "right" || (!_direction && _turnMomentum < 0)) {
      increaseTurnRate();
    }
    var turnSpeed = (_tucking) ? 2 : 4; // longer turns when tucking
    _turnAngle += (_turnMomentum/_acceleration)*turnSpeed;
    if (_turnAngle > _maxTurnAngle) {
      _turnAngle = _maxTurnAngle;
    } else if (_turnAngle < -_maxTurnAngle) {
      _turnAngle = -_maxTurnAngle;
    }
    
    return _turnAngle;
  }

  function increaseTurnRate() {
    _turnMomentum++;
    if (_turnMomentum > _acceleration) {
      _turnMomentum = _acceleration;
    }
  }

  function decreaseTurnRate() {
    _turnMomentum--;
    if (_turnMomentum < -_acceleration) {
      _turnMomentum = -_acceleration;
    }
  }

  player.tuckDown = function(bool) {
    _tucking = bool;
  };

  player.scrubSpeed = function(bool) {
    _scrubbing = bool;
  };

  player.turnLeft = function() {
    _direction = "left";
  };

  player.turnRight = function() {
    _direction = "right";
  };

  player.stopTurning = function() {
    _direction = false;
  };

  player.jump = function() {
    _jumpAngle = _turnAngle;
    _jumping = true;
    createjs.Tween.get(player, {override:false})
      .to({scaleX:1.5, scaleY:1.5}, 500, createjs.Ease.sineIn)
      .to({scaleX:1, scaleY:1}, 500, createjs.Ease.sineOut)
      .call(function(){
        _jumping = false;
      });
  };

  player.crash = function() {
    _speed = 0;
  };

  player.update = function() {
    var turnAngle = calculateTurnAngle();
    leftSki.rotation = rightSki.rotation = turnAngle;

    leftSki.y = (-turnAngle/90)*2;
    rightSki.y = (turnAngle/90)*2;

    //leftSki.x = (-turnAngle/90)*-10;
    //rightSki.x = (-turnAngle/90)*0.2+10;

    if (turnAngle < -60) {
      pants.gotoAndStop(4);
      leftSki.gotoAndStop(4);
      rightSki.gotoAndStop(4);
    } else if (turnAngle > 60) {
      pants.gotoAndStop(0);
      leftSki.gotoAndStop(0);
      rightSki.gotoAndStop(0);
    } else if (turnAngle < -30) {
      pants.gotoAndStop(3);
      leftSki.gotoAndStop(3);
      rightSki.gotoAndStop(3);
    } else if (turnAngle > 30) {
      pants.gotoAndStop(1);
      leftSki.gotoAndStop(1);
      rightSki.gotoAndStop(1);
    } else {
      pants.gotoAndStop(2);
      leftSki.gotoAndStop(2);
      rightSki.gotoAndStop(2);
    }

    if (_tucking) {
      gaper.scaleY = 0.8;
    } else if (_scrubbing) {
      gaper.scaleY = 1.1;
    } else {
      gaper.scaleY = 1;
    }
    calculateSpeed();
  };

  player.__defineGetter__('speed', function(){
    var angle = (_jumping) ? _jumpAngle : _turnAngle;
    return {
      x: Math.sin(angle*Math.PI/180)*_speed,
      y: -(Math.cos(angle*Math.PI/180)*_speed)
    };
  });

  player.__defineGetter__('maxSpeed', function(){
    return _maxSpeed+_maxTuck;
  });

  player.__defineGetter__('hitArea', function(){
    return gaper;
  });

  return player;
};
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
var Tree = function() {
  var hitSize = 40;
  var hasBeenHit = false;

  var tree = new createjs.Container();
  var trunk = new createjs.Bitmap(GaperGap.assets['trunk']);
  var branches = new createjs.Bitmap(GaperGap.assets['tree']);

  trunk.regX = trunk.image.width/2;
  trunk.regY = trunk.image.height;
  branches.regX = branches.image.width/2;
  branches.regY = branches.image.height*0.9;

  branches.y = -trunk.image.height*0.7;

  tree.addChild(trunk, branches);

  tree.hit = function(player, collision) {
    player.crash();
    if (!hasBeenHit) {
      var coords = tree.globalToLocal(collision.x, collision.y);
      var impact = -(coords.x);
      createjs.Tween.get(branches, {override:false})
        .to({rotation:impact/2}, 100, createjs.Ease.circIn)
        .to({rotation:impact/4}, 3000, createjs.Ease.elasticOut);
      hasBeenHit = true;
    }
  };

  tree.__defineGetter__('hitArea', function(){
    return trunk;
  });

  return tree;
};
var Jump = function() {
  var jump = new createjs.Container();
  var kicker = new createjs.Bitmap(GaperGap.assets['jump']);
  
  kicker.regX = kicker.image.width/2;
  kicker.regY = kicker.image.height;

  jump.hit = function(player) {
    player.jump();
  };
  
  jump.__defineGetter__('hitArea', function(){
    return kicker;
  });

  jump.addChild(kicker);

  return jump;
};

// Parent Game Logic
var GaperGap = (function(){
  var gapergap = {
    utils: new Utils()
  };
  var _preloadAssets = [];
  var _canvas;

  var dispatcher = createjs.EventDispatcher.initialize(gapergap);
  var preloader, stage, game;

  function handleFileLoad(event) {
    console.log('handleFileLoad: ', event);
    _preloadAssets.push(event.item);
  }

  function startGame(gameObject) {
    console.log('Game:startGame');
    gapergap.assets = {};
    for (var i = 0; i < _preloadAssets.length; i++) {
      gapergap.assets[_preloadAssets[i].id] = preloader.getResult(_preloadAssets[i].id);
    }
    console.log('Game.assets', gapergap.assets);

    game = new Game();

    stage.addChild(game);

    //Ticker
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);

    sizeCanvas();
  }

  function sizeCanvas() {
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
    
    gapergap.dispatchEvent({type:'stageResized', width:stage.canvas.width, height:stage.canvas.height});
  }

  function onKeyDown(event) {
    switch(event.keyCode) {
      default:
        gapergap.dispatchEvent({type:'onKeyDown', key:event.keyCode});
    }
  }

  function onKeyUp(event) {
    switch(event.keyCode) {
      default:
        gapergap.dispatchEvent({type:'onKeyUp', key:event.keyCode});
    }
  }

  function tick() {
    stage.update();
    document.getElementById('fps').innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
  }

  gapergap.init = function(canvasId) {
    console.log('Game:init');
    stage = gapergap.stage = new createjs.Stage(document.getElementById(canvasId));

    //Enable User Inputs
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = false;
    stage.snapToPixelEnabled = true;

    manifest = [
      {src:"gaper_gabe.png", id:"skier"},
      {src:"trunk.png", id:"trunk"},
      {src:"tree.png", id:"tree"},
      {src:"jump.png", id:"jump"},
      {src:"arrow.png", id:"arrow"},
      {src:"pants_sprite.png", id:"pants-sprite"},
      {src:"ski_sprite.png", id:"ski-sprite"},
      {src:"hill_background.png", id:"hill-background"}
    ];

    preloader = new createjs.LoadQueue(true, "assets/");
    //preload.on("progress", handleProgress);
    preloader.on("complete", startGame);
    preloader.on("fileload", handleFileLoad);
    preloader.loadManifest(manifest, true, "assets/");
  };

  gapergap.__defineGetter__('height', function(){
    return stage.canvas.height;
  });

  gapergap.__defineGetter__('width', function(){
    return stage.canvas.width;
  });

  $(document).ready(function(){
    console.log('DOCUMENT READY');
    window.onresize = sizeCanvas;
    window.onkeydown = onKeyDown;
    window.onkeyup = onKeyUp;
  });

  return gapergap;
})();