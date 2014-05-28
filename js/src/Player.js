var Player = function() {
  var player = new createjs.Container();

  var dispatcher = createjs.EventDispatcher.initialize(player);

  var gaper = new createjs.Bitmap(GaperGap.assets['skier']);
  var hitBox = new createjs.Bitmap(GaperGap.assets['player-hitbox']);

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

  hitBox.regX = hitBox.image.width/2;
  hitBox.regY = hitBox.image.height/2;
  hitBox.alpha = 0;
  gaper.regX = gaper.image.width/2;
  gaper.regY = gaper.image.height;
  gaper.y = 8;

  leftSki.regX = rightSki.regX = skiData.frames.width/2;
  leftSki.regY = rightSki.regY = skiData.frames.height/2;

  leftSki.gotoAndStop(2);
  rightSki.gotoAndStop(2);

  leftSki.x = -10;
  rightSki.x = 10;

  player.addChild(hitBox, leftSki, rightSki, pants, gaper);

  var _acceleration = 10;//updates it takes to get to full greatest turn amount

  // Speed Variables
  var _speed = 0;
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
  var _jumping = false;
  var _jump = 0;
  var _air = 0;
  var _jumpAngle = 0;
  var _gravity = 0.2;

  function calculateSpeed() {
    // calculate potential speed momentum
    if (_air > 0) {
      return _speed;
    } else if (_scrubbing) {
      _speed -= _scrubRate;
    } else {
      var angle = _turnAngle;
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
    gaper.y = (bool) ? 14:8;
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

  player.jump = function(power) {
    if (_jump === 0) { // prevents 'floating'
      _jumpAngle = _turnAngle;
      _jump = power;
      player.dispatchEvent('jump');
    }
  };

  player.crash = function() {
    _speed = 0;
  };

  player.update = function() {
    var turnAngle = calculateTurnAngle();
    leftSki.rotation = rightSki.rotation = turnAngle;

    leftSki.y = (-turnAngle/90)*2;
    rightSki.y = (turnAngle/90)*2;

    if (_jump !== 0) {
      _air += _jump;
      player.scaleX = player.scaleY = (_air/100)+1;
      _jump -= _gravity;
      if (_air <= 0) {
        player.dispatchEvent('land');
        _air = _jump = 0;
      }
    }

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

    calculateSpeed();
  };

  player.__defineGetter__('speed', function(){
    var angle = (_air > 0) ? _jumpAngle : _turnAngle;
    return {
      x: Math.sin(angle*Math.PI/180)*_speed,
      y: -(Math.cos(angle*Math.PI/180)*_speed)
    };
  });

  player.__defineGetter__('maxSpeed', function(){
    return _maxSpeed+_maxTuck;
  });

   player.__defineGetter__('airborne', function(){
    return (_air > 0);
  });

  player.__defineGetter__('hitArea', function(){
    return hitBox;
  });

  return player;
};