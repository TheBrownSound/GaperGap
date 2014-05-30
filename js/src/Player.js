var Player = function() {
  var player = new createjs.Container();
  var dispatcher = createjs.EventDispatcher.initialize(player);

  var skier = new Skier();

  // Hitbox
  var hitBox = new createjs.Bitmap(GaperGap.assets['player-hitbox']);
  hitBox.regX = hitBox.image.width/2;
  hitBox.regY = hitBox.image.height/2;
  hitBox.alpha = 0;

  player.scaleX = player.scaleY = 0.75;

  player.addChild(hitBox, skier);

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
  var _jumpGravity = 0.12;

  // Falling
  var _fallFeature = false;
  var _falling = 0;
  var _fallGravity = 0.5;

  function calculateSpeed() {
    // calculate potential speed momentum
    if (player.airborne) {
      return _speed;
    } else if (_scrubbing) {
      _speed -= _scrubRate;
    } else {
      var angle = _turnAngle;
      var accel = 85-(Math.abs(angle));
      accel = Math.round( accel * 10) / 1000; // decreases number/decimal for animation
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

    var turnSpeed = 4;
    if (player.airborne) {
      turnSpeed = 6;
    } else if (_tucking) {
      turnSpeed = 2;
    }
    _turnAngle += (_turnMomentum/_acceleration)*turnSpeed;
    if (_air <= 0) {
      if (_turnAngle > _maxTurnAngle) {
        _turnAngle = _maxTurnAngle;
      } else if (_turnAngle < -_maxTurnAngle) {
        _turnAngle = -_maxTurnAngle;
      }
    } else if (_turnAngle < -180) {
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
    skier.squat(true);
  };

  player.jump = function(power) {
    skier.squat(false);
    if (_jump === 0) { // prevents 'floating'
      _jumpAngle = _turnAngle;
      _jump = power;
      player.dispatchEvent('jump');
    }
  };

  player.fall = function(feature) {
    if (feature != _fallFeature) {
      _fallFeature = feature;
      _falling += _fallGravity;
    }
  };

  player.crash = function() {
    _speed = 0;
  };

  player.update = function() {
    var turnAngle = calculateTurnAngle();
    skier.angle = turnAngle;

    if (!_falling && _jump !== 0) {
      _air += _jump;
      player.scaleX = player.scaleY = (_air/100)+0.75;
      _jump -= _jumpGravity;
      if (_air >= 40) {
        skier.cross(true);
      } else if (skier.crossed) {
        skier.cross(false);
      }
      
      if (_air <= 0) {
        player.dispatchEvent('land');
        _air = _jump = 0;
      }
    } else if (_falling > 0) {
      var hit = ndgmr.checkPixelCollision(player.hitArea, _fallFeature.hitArea, 0, true);
      if (!hit) {
        _falling = 0;
      } else {
        _falling += _fallGravity;
      }
    }

    calculateSpeed();
  };

  player.__defineGetter__('speed', function(){
    var angle = (_air > 0) ? _jumpAngle : _turnAngle;
    return {
      x: Math.sin(angle*Math.PI/180)*_speed,
      y: -(Math.cos(angle*Math.PI/180)*_speed+_falling)
    };
  });

  player.__defineGetter__('maxSpeed', function(){
    return _maxSpeed+_maxTuck;
  });

   player.__defineGetter__('airborne', function(){
    return (_air > 0 || _falling > 0);
  });

  player.__defineGetter__('hitArea', function(){
    return hitBox;
  });

  return player;
};