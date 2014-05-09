var Player = function() {
  var player = new createjs.Container();
  var graphic = new createjs.Bitmap(GaperGap.assets['arrow']);
  graphic.regX = graphic.image.width/2;
  graphic.regY = graphic.image.height/2;;

  player.addChild(graphic);

  var _acceleration = 30;//updates it takes to get to full greatest turn amount
  
  var _speed = 0;
  var _speedMomentum = 0;
  var _maxSpeed = 8;
  var _direction = null;
  var _turnAngle = 0;
  var _turnMomentum = 0;
  var _maxTurnAngle = 90;

  function calculateTurnAngle() {
    // Should be called at update intervals
    if (_direction == "left" || (!_direction && _turnMomentum > 0)) {
      decreaseTurnRate();
    }
    if (_direction == "right" || (!_direction && _turnMomentum < 0)) {
      increaseTurnRate();
    }
    _turnAngle += (_turnMomentum/_acceleration)*4;
    if (_turnAngle > _maxTurnAngle) {
      _turnAngle = _maxTurnAngle;
    } else if (_turnAngle < -_maxTurnAngle) {
      _turnAngle = -_maxTurnAngle;
    }
    return _turnAngle;
  }

  function calculateSpeed() {
    // calculate potential speed momentum
    var accel = 70-(Math.abs(_turnAngle));
    accel =  Math.round( accel * 10) / 1000; // decreases number/decimal for animation
    //console.log("SPEED!: ",accel);
    _speed += accel;
    if (_speed > _maxSpeed) {
      _speed = _maxSpeed;
    } else if (_speed < 0) {
      _speed = 0;
    }
    return _speed;
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

  player.turnLeft = function() {
    _direction = "left";
  };

  player.turnRight = function() {
    _direction = "right";
  };

  player.stopTurning = function() {
    _direction = false;
  };

  player.update = function() {
    player.rotation = calculateTurnAngle();
    calculateSpeed();
  };

  player.__defineGetter__('speed', function(){
    return {
      x: Math.sin(_turnAngle*Math.PI/180)*_speed,
      y: -(Math.cos(_turnAngle*Math.PI/180)*_speed)
    };
  });

  return player;
};