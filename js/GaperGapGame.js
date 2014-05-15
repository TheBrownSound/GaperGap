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
        player.turnLeft();
        break;
      case 38: //Up
        player.scrubSpeed(true);
        break;
      case 39: //Right
        player.turnRight();
        break;
      case 40: //Down
        player.tuckDown(true);
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
        player.scrubSpeed(false);
        break;
      case 40: //Down
        player.tuckDown(false);
        break;
      default:
        console.log("unhandled keyup! - ", event.key);
    }
  });

  GaperGap.addEventListener('stageResized', function(event){
    game.x = event.width/2;
    game.y = event.height/2;
    hill.width = event.width;
    hill.height = event.height;
  });
  
  return game;
};
var Player = function() {
  var player = new createjs.Container();
  var graphic = new createjs.Bitmap(GaperGap.assets['arrow']);
  graphic.regX = graphic.image.width/2;
  graphic.regY = graphic.image.height/2;

  player.addChild(graphic);

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
    player.rotation = calculateTurnAngle();
    if (_tucking) {
      graphic.scaleY = 1.2;
    } else if (_scrubbing) {
      graphic.scaleY = 0.8;
    } else {
      graphic.scaleY = 1;
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
    return graphic;
  });

  return player;
};
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
      {src:"skier.png", id:"skier"},
      {src:"trunk.png", id:"trunk"},
      {src:"tree.png", id:"tree"},
      {src:"jump.png", id:"jump"},
      {src:"arrow.png", id:"arrow"},
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