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
  var _airAngle = 0;

  function calculateSpeed() {
    // calculate potential speed momentum
    var angle = (player.airborne) ? _airAngle : _turnAngle;
    
    if (_scrubbing) {
      _speed -= _scrubRate;
    } else {
      var accel = 85-(Math.abs(angle));
      accel = Math.round( accel * 10) / 1000; // decreases number/decimal for animation
      _speed += accel;
      var max = _maxSpeed+calculateTuckModifier();
      if (_speed > max) {
        _speed = max;
      }
    }

    if (_speed < 0) {
      _speed = 0;
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
      turnSpeed = 6;
    } else if (_tucking) {
      turnSpeed = 2;
    }
    _turnAngle += (_turnMomentum/_acceleration)*turnSpeed;
    if (!player.airborne) {
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

  player.jump = function(thrust) {
    skier.squat(false);
    if (!player.airborne) { // prevents 'floating'
      _airAngle = _turnAngle;
      _verticalMomentum = thrust;
      player.dispatchEvent('jump');
    }
  };

  player.drop = function(distance) {
    if (!player.airborne) {
      _airAngle = _turnAngle;
    }
    _drop = distance;
  };

  player.crash = function() {
    _speed = 0;
  };

  player.update = function() {
    var turnAngle = calculateTurnAngle();
    skier.angle = turnAngle;

    if (_verticalMomentum > 0 || _air > 0 || _drop > 0) {

      if (_verticalMomentum > 0 || _air > 0) { // Figure out if you need to scale the player for air
        _air += _verticalMomentum;
        if (_air <= 0) {
          _air = 0;
        }
        player.scaleX = player.scaleY = (_air/100)+0.75;
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
        console.log('land!')
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