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
  var score = new Score(player);

  var _crashed = false;
  var _startOffset = 120;

  game.addChild(hill);

  var updateInterval = setInterval(updateGame, Math.floor(1000/60));
  var viewInterval = setInterval(updateView, 500);

  function updateView() {
    var totalSpeed = GaperGap.utils.getTotalSpeed(player.speed.x, player.speed.y);
    document.getElementById('speed').innerHTML = "Speed: "+Math.round(totalSpeed);
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
    if (!_crashed) {
      player.update();
      hill.update();
      score.update();
    }

    // hill offset for game start
    if (_startOffset > 0) {
      hill.y = _startOffset;
      _startOffset += player.speed.y;
    } else if (_startOffset < 0 ) {
      _startOffset = 0;
      hill.y = 0;
    }
  }

  function changeScale(perc, instant) {
    if (instant) {
      hill.scaleX = hill.scaleY = perc;
    } else if (perc != hill.scaleX) {
      createjs.Tween.get(hill, {override:true}).to({
        scaleX:perc,
        scaleY:perc
      }, 4000, createjs.Ease.sineOut);
    }
  }

  game.reset = function() {
    _startOffset = 120;
    player.reset();
    hill.reset();
    score.reset();
    changeScale(1, true);
  };

  player.addEventListener('crash', function(event) {
    // show reset
    GaperGap.showMessage("Press enter to restart.");
    _crashed = true;
  });

  GaperGap.addEventListener('onKeyDown', function(event) {
    if (_crashed) return;
    switch(event.key) {
      case 32: //Space
        player.squat();
        break;
      case 'touch-left':
      case 37: //Left
        player.turnRight();
        break;
      case 38: //Up
        player.tuckDown(true);
        break;
      case 'touch-right':
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
    if (_crashed) {
      if (event.key === 13) { // ENTER
        game.reset();
        _crashed = false;
        GaperGap.hideMessage();
      }
      return;
    }
    switch(event.key) {
      case 32: //Space
        player.jump();
        break;
      case 'touch-left':
      case 'touch-right':
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
var Score = function(player, elementId){
  var score = {};
  var _total = 0;

  var _airtime = 0;
  var _speedtime = 0;

  var speedSlug;
  var airSlug;

  var scoreElement = $('#score');
  var scoreBox = $('#score .board');
  scoreElement.addClass('show');

  function addToScore(amount) {
    console.log('Score:add - ', amount);
    _total += amount;
    scoreBox.html(_total);
  }

  player.addEventListener('hit', function(event) {
    if (event.target.type == "tree") {
      var slug = new ScoreSlug('Treehugger', addToScore);
      slug.addScore(50);
      addToScore(slug.amount);
      slug.done();
    }
  });

  score.reset = function() {
    _total = 0;
    addToScore(0);
  };

  score.update = function() {
    if (player.airborne) {
      if (!airSlug) {
        airSlug = new ScoreSlug('Air', addToScore);
      } else {
        airSlug.addScore(2);
      }
    } else if (airSlug) {
      airSlug.done();
      addToScore(airSlug.amount);
      airSlug = false;
    }

    var totalSpeed = GaperGap.utils.getTotalSpeed(player.speed.x, player.speed.y);
    if (totalSpeed > 10) {
      if (!speedSlug) {
        speedSlug = new ScoreSlug('Speedy McSpeederson', addToScore);
      } else {
        speedSlug.addScore(1);
      }
    } else if (speedSlug) {
      speedSlug.done();
      addToScore(speedSlug.amount);
      speedSlug = false;
    }
  };

  return score;
};

var ScoreSlug = function(name, scoreFn) {
  var slug = {};
  var score = 0;

  var stubElement = $('<div class=\"slug\">'+name+' <span class=\"points\">+0</span></div>');
  stubElement.appendTo($('#score'));

  stubElement.animate({
    marginTop: "10px",
    opacity: 1
  }, 500);

  slug.addScore = function(amount) {
    score += amount;
    var prefix = (score < 0) ? "":"+";
    stubElement.find('.points').html(prefix+score);
  };

  slug.done = function() {
    setTimeout(function(){
      stubElement.animate({
        marginTop: "-60px",
        opacity: 0
      }, 500, function() {
        scoreFn(score);
        stubElement.remove();
      });
    }, 1000);
  };

  slug.__defineGetter__('amount', function(){
    return score;
  });

  return slug;
};
var Shred = function(size) {
  var flake = new createjs.Shape();

  var g = flake.graphics;
  g.beginFill('#FFF');
  // g.beginFill('#F00');
  g.drawCircle(0,0,size);
  g.endFill();

  flake.animate = function(xVel,yVel) {
    createjs.Tween.get(flake, {override:true}).to({
      x: flake.x+xVel,
      y: flake.y+yVel,
      alpha: 0
    }, 700, createjs.Ease.sineOut);
  };

  return flake;
};
var Skier = function() {
  var _angle = 0;
  var _crossed = 0;
  var _tucked = false;
  var skier = new createjs.Container();

  var _bodyBase = {
    rotation: 0,
    y: -32
  };

  var _headBase = {
    rotation: 0,
    y: -40
  };

  // Body (Holds head and torso)
  var body = new createjs.Container();
  body.y = _bodyBase.y;

  // Head
  var headData = {
    images: [GaperGap.assets['gabe']],
    frames: {width:100, height:114}
  };

  var headSprite = new createjs.SpriteSheet(headData);
  var head = new createjs.Sprite(headSprite);

  head.regX = headData.frames.width/2;
  head.regY = headData.frames.height*0.7;
  head.y = _headBase.y;
  head.gotoAndStop(0);

  // Torso Sprite
  var torsoData = {
    images: [GaperGap.assets['body-sprite']],
    frames: {width:140, height:140}
  };

  var torsoSprite = new createjs.SpriteSheet(torsoData);
  var torso = new createjs.Sprite(torsoSprite);

  torso.regX = torsoData.frames.width/2;
  torso.regY = torsoData.frames.height/2+6;
  torso.gotoAndStop(0);

  // Pants Sprite
  var pantsData = {
    images: [GaperGap.assets['pants-sprite']],
    frames: {width:80, height:56}
  };

  var pantsSprite = new createjs.SpriteSheet(pantsData);
  var pants = new createjs.Sprite(pantsSprite);
  
  pants.regX = pantsData.frames.width/2;
  pants.y = -pantsData.frames.height+14;
  pants.gotoAndStop(2);

  // Ski Sprites
  var skiData = {
    images: [GaperGap.assets['ski-sprite']],
    frames: {width:40, height:120}
  };

  var ski = new createjs.SpriteSheet(skiData);
  var leftSki = new createjs.Sprite(ski);
  var rightSki = new createjs.Sprite(ski);

  leftSki.regX = rightSki.regX = skiData.frames.width/2;
  leftSki.regY = rightSki.regY = skiData.frames.height/2-8;
  
  leftSki.gotoAndStop(2);
  rightSki.gotoAndStop(2);

  body.addChild(torso, head);
  skier.addChild(leftSki, rightSki, pants, body);

  skier.turn = function(dir) {
    var tilt = 10;
    switch (dir) {
      case 'left':
        createjs.Tween.get(body, {override:true}).to({
          rotation:_bodyBase.rotation+tilt
        }, 100, createjs.Ease.linear);
        createjs.Tween.get(head, {override:true}).to({
          rotation:_headBase.rotation-tilt
        }, 100, createjs.Ease.linear);
        break;
      case 'right':
        createjs.Tween.get(body, {override:true}).to({
          rotation:_bodyBase.rotation-tilt
        }, 100, createjs.Ease.linear);
        createjs.Tween.get(head, {override:true}).to({
          rotation:_headBase.rotation+tilt
        }, 100, createjs.Ease.linear);
        break;
      default:
        createjs.Tween.get(body, {override:true}).to({
          rotation:_bodyBase.rotation
        }, 100, createjs.Ease.linear);
        createjs.Tween.get(head, {override:true}).to({
          rotation:_headBase.rotation
        }, 100, createjs.Ease.linear);
    }
  };

  skier.squat = function(bool) {
    if (bool) {
      body.y = _bodyBase.y+4;
    } else {
      body.y = _bodyBase.y;
    }
  };

  skier.tuck = function(bool) {
    _tucked = bool;
    if (_tucked) {
      body.y = _bodyBase.y+4;
      head.y = _headBase.y+2;
      torso.gotoAndStop(1);
    } else {
      body.y = _bodyBase.y;
      head.y = _headBase.y;
      torso.gotoAndStop(0);
    }
  };

  skier.plow = function(bool) {
    if (bool) {
      _crossed = 10;
    } else {
      _crossed = 0;
    }
  };

  skier.cross = function(bool) {
    //_crossed = bool;
  };

  skier.crash = function(type) {
    if (type === "tree") {
      _crossed = -40;
      this.angle = _angle;
    }
  };

  skier.sink = function(bool) {
    console.log('sink! - ', bool);
    if (bool) {
      pants.alpha = leftSki.alpha = rightSki.alpha = 0;
    } else {
      pants.alpha = leftSki.alpha = rightSki.alpha = 1;
    }
  };

  skier.reset = function(deg) {
    skier.squat(false);
    skier.tuck(false);
    _crossed = 0;
    skier.angle = deg;
  };

  skier.__defineGetter__('crossed', function(){
    return _crossed;
  });

  skier.__defineSetter__('angle', function(deg) {
    _angle = deg;

    if (_angle < -90 || _angle > 90) {
      torso.gotoAndStop(2);
      head.gotoAndStop(1);
    } else {
      if (_tucked) {
        torso.gotoAndStop(1);
      } else {
        torso.gotoAndStop(0);
      }
      head.gotoAndStop(0);
    }

    leftSki.rotation = _angle-_crossed;
    rightSki.rotation = _angle+_crossed;

    var lift = (_angle < -90 || _angle > 90) ? 2 : 0;

    var radians = _angle*Math.PI/180;
    radians = (Math.abs(_angle) > 90) ? radians : radians*0.7; // allows for skier leg offset
    leftSki.x = Math.cos(radians)*-20;
    leftSki.y = Math.sin(radians)*-8-lift;
    rightSki.x = Math.cos(radians)*20;
    rightSki.y = Math.sin(radians)*8-lift;
    
    if (_angle < -150 || _angle > 150) {
      pants.gotoAndStop(9);
      leftSki.gotoAndStop(2);
      rightSki.gotoAndStop(2);
    } else if (_angle < -120) {
      pants.gotoAndStop(10);
    } else if (_angle > 120) {
      pants.gotoAndStop(8);
    } else if (_angle < -90) {
      pants.gotoAndStop(11);
      leftSki.gotoAndStop(3);
      rightSki.gotoAndStop(3);
    } else if (_angle > 90) {
      pants.gotoAndStop(7);
      leftSki.gotoAndStop(1);
      rightSki.gotoAndStop(1);
    } else if (_angle < -70) {
      pants.gotoAndStop(6);
      leftSki.gotoAndStop(4);
      rightSki.gotoAndStop(4);
    } else if (_angle > 70) {
      pants.gotoAndStop(0);
      leftSki.gotoAndStop(0);
      rightSki.gotoAndStop(0);
    } else if (_angle < -50) {
      pants.gotoAndStop(5);
      leftSki.gotoAndStop(3);
      rightSki.gotoAndStop(3);
    } else if (_angle > 50) {
      pants.gotoAndStop(1);
      leftSki.gotoAndStop(1);
      rightSki.gotoAndStop(1);
    } else if (_angle < -20) {
      pants.gotoAndStop(4);
      leftSki.gotoAndStop(3);
      rightSki.gotoAndStop(3);
    } else if (_angle > 20) {
      pants.gotoAndStop(2);
      leftSki.gotoAndStop(1);
      rightSki.gotoAndStop(1);
    } else {
      pants.gotoAndStop(3);
      leftSki.gotoAndStop(2);
      rightSki.gotoAndStop(2);
    }
    return _angle;
  });

  return skier;
};
var Player = function() {
  var player = new createjs.Container();
  var dispatcher = createjs.EventDispatcher.initialize(player);

  var skier = new Skier();

  var shadow = new createjs.Shape();
  shadow.graphics.beginFill('#000');
  shadow.graphics.drawEllipse(0,0,60,30);
  shadow.graphics.endFill();
  shadow.regX = 30;
  shadow.regY = 15;
  shadow.alpha = 0.5;

  // Hitbox
  var hitBox = new createjs.Bitmap(GaperGap.assets['player-hitbox']);
  hitBox.regX = hitBox.image.width/2;
  hitBox.regY = hitBox.image.height/2;
  hitBox.alpha = 0;

  player.scaleX = player.scaleY = 0.75;

  player.addChild(hitBox, shadow, skier);

  var _acceleration = 10;//updates it takes to get to full greatest turn amount

  // Speed Variables
  var _speed = 0;
  var _crashed = false;
  var _axisSpeed = {
    x: 0,
    y: 0
  };

  var _speedMomentum = 0;
  var _maxSpeed = 8;

  // Tuck
  var _tucking = false;
  var _tuck = 0;
  var _tuckRate = 0.2;
  var _maxTuck = 4;

  // Scrub
  var _scrubbing = false;
  var _scrubRate = 0.2;

  // Turning
  var _direction = null;
  var _turnAngle = -90;
  var _turnMomentum = 0;
  var _maxTurnAngle = 90;

  // Jumping
  var _air = 0; // vertical representation
  var _drop = 0; // speed accelerator
  var _verticalMomentum = 0;
  var _gravity = 0.2;
  var _airAngle = false;
  var _airSpeed = 0;
  var _squatting = false;

  // Powder
  var _sunk = false;
  var _powderFields = [];

  function calculateSpeed() {
    // calculate potential speed momentum
    var angle = (player.airborne) ? _airAngle : _turnAngle;

    if (_crashed) {
      _axisSpeed = {x:0,y:0};
      return;
    } else if (player.airborne) {
      _speed = _airSpeed;
    } else if (_airAngle !== false) {
      //TODO Might want to handle angle difference to adjust landing speed
      // If going the reverse direction, swap the speed to match for landing
      if ( (_airSpeed > 0 && Math.abs(angle) > 90) || (_airSpeed < 0 && Math.abs(angle) < 90) ) {
        _speed = -_speed;
      }
      // just landed, reset the air angle
      _airAngle = false;
      _airSpeed = 0;
    }
    
    var accel = 90-(Math.abs(angle));
    accel = Math.round(accel * 10) / 1000; // decreases number/decimal for animation
    _speed += accel;

    var scrubModifier = (_scrubbing) ? 4 : 0;

    var max = _maxSpeed+calculateTuckModifier()-scrubModifier;
    if (_speed > max) {
      _speed = max;
    } else if (_speed < -max) {
      _speed = -max;
    }

    _axisSpeed = {
      x: Math.sin(angle*Math.PI/180)*_speed,
      y: -(Math.cos(angle*Math.PI/180)*_speed-_verticalMomentum)
    };
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

    var turnSpeed = 4;
    if (player.airborne) {
      turnSpeed = 8;
    } else if (_tucking || _sunk) {
      turnSpeed = 2;
    }
    _turnAngle += (_turnMomentum/_acceleration)*turnSpeed;
    
    /*
    if (!player.airborne) {
      if (_turnAngle > _maxTurnAngle) {
        _turnAngle = _maxTurnAngle;
      } else if (_turnAngle < -_maxTurnAngle) {
        _turnAngle = -_maxTurnAngle;
      }
    } else*/
    if (_turnAngle < -180) {
      _turnAngle = 180; // basically for 360s
    } else if (_turnAngle > 180) {
      _turnAngle = -180; // basically for 360s
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
    skier.tuck(bool);
  };

  player.scrubSpeed = function(bool) {
    skier.plow(bool);
    _scrubbing = bool;
  };

  player.turnLeft = function() {
    _direction = "left";
    skier.turn(_direction);
  };

  player.turnRight = function() {
    _direction = "right";
    skier.turn(_direction);
  };

  player.stopTurning = function() {
    _direction = false;
    skier.turn(_direction);
  };

  player.squat = function() {
    _squatting = true;
    skier.squat(true);
  };

  player.sink = function(field){
    _powderFields.push(field);
  };

  player.jump = function(thrust) {
    thrust = thrust || 0;
    if (_squatting) {
      thrust += 2;
      _squatting = false;
      skier.squat(false);
    }

    if (!player.airborne) { // prevents 'floating'
      _airAngle = _turnAngle;
      _airSpeed = _speed;
      _verticalMomentum = thrust;
      player.dispatchEvent('jump');
    }
  };

  player.drop = function(distance) {
    if (!player.airborne) {
      _airAngle = _turnAngle;
      _airSpeed = _speed;
    }
    _drop = distance;
  };

  player.crash = function(type) {
    _crashed = true;
    type = type || "";
    skier.crash(type);
    _speed = 0;
    player.update();
    player.dispatchEvent('crash');
  };

  player.hit = function(feature) {
    player.dispatchEvent('hit', feature);
  };

  player.reset = function() {
    _crashed = false;
    _speed = _turnMomentum = _axisSpeed.x = _axisSpeed.y = 0;
    _direction = null;
    _squatting = false;
    skier.reset(-90);
    _turnAngle = -90;
  };

  player.update = function() {
    if (_powderFields.length > 0) {
      if (!_sunk) {
        _sunk = true;
        skier.sink(true);
      }
      _powderFields.length = 0;
    } else if (_sunk) {
      skier.sink(false);
      _sunk = false;
    }

    var turnAngle = calculateTurnAngle();
    skier.angle = turnAngle;

    if (_verticalMomentum > 0 || _air > 0 || _drop > 0) {

      if (_verticalMomentum > 0 || _air > 0) { // Figure out if you need to scale the player for air
        _air += _verticalMomentum;
        if (_air <= 0) {
          _air = 0;
        }
        player.scaleX = player.scaleY = (_air/300)+0.75;
      }

      _verticalMomentum -= _gravity; // apply gravity after air
      
      if (_drop > 0) {
        _drop += _verticalMomentum;
        if (_drop <= 0) {
          _drop = 0;
        }
      }
      // check for landing
      if (_air === 0 && _drop === 0) {
        console.log('land!');
        _verticalMomentum = 0;
        player.dispatchEvent('land');
      }
    }

    shadow.y = _air+_drop;
    shadow.alpha = (shadow.y > 0) ? shadow.y/1000 : 0;

    calculateSpeed();
  };

  player.__defineGetter__('speed', function(){
    return _axisSpeed;
  });

  player.__defineGetter__('maxSpeed', function(){
    return _maxSpeed+_maxTuck;
  });

   player.__defineGetter__('airborne', function(){
    return (_air > 0 || _drop > 0);
  });

  player.__defineGetter__('hitArea', function(){
    return hitBox;
  });

  return player;
};
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

var Section = function(size, density, coords) {
  density = density || 10;
  var section = {};
  var _x = 0;
  var _y = 0;
  var _location = {
    x: coords.x || 0,
    y: coords.y || 0
  };

  console.log('coords:', coords);

  var _features = [];
  var _foreground = new createjs.Container();
  var _background = new createjs.Container();
  var trackShape = new createjs.Shape();
  //var debugOutline = new createjs.Shape();
  //debugOutline.graphics.beginStroke("#F00").drawRect(0, 0, size, size).endStroke();

  //_background.addChild(trackShape);
  //trackShape.alpha = 0.3;

  //_background.addChild(debugOutline);

  var sectionType = "default";
  if (coords.y < 0) {
    sectionType = "sky";
  } else {
    var switcher = GaperGap.utils.getRandomInt(0,10);
    if (switcher == 10) {
      sectionType = "massive-cliff";
    } else if (switcher == 9) {
      sectionType = "powder-field";
    }
  }

  populateSection(sectionType);

  function populateSection(type) {
    console.log("section:type", type);
    if (type === 'sky') {
      var sky = new createjs.Bitmap(GaperGap.assets['sky']);
      _background.addChild(sky);
    } else if (type === 'massive-cliff') {
      var cliff = new Cliff("cliff-massive");
      cliff.x = cliff.y = size/2;
      addFeature(cliff);
    } else {
      while (_features.length < density) {
        var feature;
        if (type === "powder-field") {
          feature = new PowderPatch();
        } else {
          feature = getRandomFeature();
        }
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
      case 3:
        return new PowderPatch();
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
var Tree = function() {
  var hitSize = 40;
  var hasBeenHit = false;

  var tree = new createjs.Container();
  tree.type = 'tree';
  
  var leaves = new createjs.Bitmap(
    GaperGap.assets['tree-'+GaperGap.utils.getRandomInt(1,3)]
  );

  var trunk = new createjs.Bitmap(
    GaperGap.assets['trunk-'+GaperGap.utils.getRandomInt(1,2)]
  );
  var hitBox = new createjs.Bitmap(GaperGap.assets['trunk-hitbox']);
  hitBox.alpha = 0;
  
  tree.addChild(hitBox, trunk, leaves);

  hitBox.regX = hitBox.image.width/2;
  hitBox.regY = hitBox.image.height;
  trunk.regX = trunk.image.width/2;
  trunk.regY = trunk.image.height;
  leaves.regX = leaves.image.width/2;
  leaves.regY = leaves.image.height*0.8;
  leaves.y = -trunk.image.height;

  //leaves.scaleX = (GaperGap.utils.yesNo()) ? 1:-1;// Reverses tree, note: messes up hit detection :(

  tree.hit = function(player, collision) {
    if (!player.airborne && collision.width > 25*player.scaleX) {
      player.crash("tree");
    }

    if (!hasBeenHit) {
      player.hit(tree);
      var coords = trunk.globalToLocal(collision.x, collision.y);
      var impact = (coords.x-(trunk.image.width/2));
      createjs.Tween.get(leaves, {override:false})
        .to({rotation:-impact/2}, 100, createjs.Ease.circIn)
        .to({rotation:-impact/4}, 3000, createjs.Ease.elasticOut);
      hasBeenHit = true;
    }
  };

  tree.__defineGetter__('hitArea', function(){
    return hitBox;
  });

  tree.__defineGetter__('foreground', function(){
    return tree;
  });

  return tree;
};
var Jump = function() {
  var jump = new createjs.Container();
  var suffix = "s";
  var kick = 0.5;
  var switcher = GaperGap.utils.getRandomInt(0,4);

  if (switcher >= 4) {
    suffix = "m";
    kick = 0.7;
  }

  var kicker = new createjs.Bitmap(GaperGap.assets['jump-'+suffix]);
  
  kicker.regX = kicker.image.width/2;
  // kicker.regY = kicker.image.height;

  jump.addChild(kicker);

  jump.hit = function(player) {
    var thrust = Math.round(GaperGap.utils.getTotalSpeed(player.speed.x, player.speed.y)*kick);
    player.jump(thrust);
    player.drop(kicker.image.height/2);
  };
  
  jump.__defineGetter__('hitArea', function(){
    return kicker;
  });

  jump.__defineGetter__('background', function(){
    return jump;
  });

  return jump;
};
var PowderPatch = function() {
  var patch = new createjs.Bitmap(GaperGap.assets['powder-patch']);
  patch.type = 'powder';

  patch.hit = function(player, collision) {
    if (!player.airborne) {
      player.sink(this);
    }
  };

  patch.__defineGetter__('hitArea', function(){
    return patch;
  });

  patch.__defineGetter__('background', function(){
    return patch;
  });

  return patch;
};
var Cliff = function(variant) {
  variant = variant || 'cliff-'+GaperGap.utils.getRandomInt(1,1);
  var cliff = new createjs.Bitmap(GaperGap.assets[variant]);

  cliff.regX = cliff.image.width/2;
  cliff.regY = cliff.image.height/2;

  cliff.hit = function(player, collision) {
    var coords = cliff.globalToLocal(collision.x, collision.y);
    console.log("Cliff:hit - ", coords.y);
    player.drop(cliff.image.height-coords.y);
  };

  cliff.__defineGetter__('hitArea', function(){
    return cliff;
  });

  cliff.__defineGetter__('background', function(){
    return cliff;
  });
  
  return cliff;
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

  var messageBox = $('#message');

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

    messageBox.removeClass('initial');
    messageBox.removeClass('show');

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

  gapergap.showMessage = function(msg) {
    messageBox.html(msg);
    messageBox.addClass('show');
  };

  gapergap.hideMessage = function() {
    messageBox.removeClass('show');
  };

  gapergap.init = function(canvasId) {
    console.log('Game:init');
    stage = gapergap.stage = new createjs.Stage(document.getElementById(canvasId));

    //Enable User Inputs
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = false;
    stage.snapToPixelEnabled = true;

    manifest = [
      {src:"gapergap_logo.png", id:"logo"},
      {src:"gaper_sprite.png", id:"gabe"},
      {src:"bodies.png", id:"body-sprite"},
      {src:"pants.png", id:"pants-sprite"},
      {src:"ski_sprite.png", id:"ski-sprite"},
      {src:"hitbox.png", id:"player-hitbox"},
      {src:"trunk_hit.png", id:"trunk-hitbox"},
      {src:"trunk_1.png", id:"trunk-1"},
      {src:"trunk_2.png", id:"trunk-2"},
      {src:"tree_1.png", id:"tree-1"},
      {src:"tree_2.png", id:"tree-2"},
      {src:"tree_3.png", id:"tree-3"},
      {src:"powder_patch.png", id:"powder-patch"},
      {src:"cliff_1.png", id:"cliff-1"},
      {src:"cliff_massive.png", id:"cliff-massive"},
      {src:"jump_small.png", id:"jump-s"},
      {src:"jump_medium.png", id:"jump-m"},
      {src:"hill_background.png", id:"hill-background"},
      {src:"sky.png", id:"sky"}
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
    
    if ('ontouchstart' in window) { // mobile stuff
      $('body').addClass('touch');
      
      $('left-turn').bind('touchstart', function(){
        console.log('rawr');
        gapergap.dispatchEvent({type:'onKeyDown', key:"touch-left"});
      }).bind('touchend', function(){
        gapergap.dispatchEvent({type:'onKeyUp', key:"touch-left"});
      });

      $('right-turn').bind('touchstart', function(){
        gapergap.dispatchEvent({type:'onKeyDown', key:"touch-right"});
      }).bind('touchend', function(){
        gapergap.dispatchEvent({type:'onKeyUp', key:"touch-right"});
      });

    }

    window.onresize = sizeCanvas;
    window.onkeydown = onKeyDown;
    window.onkeyup = onKeyUp;
  });

  return gapergap;
})();