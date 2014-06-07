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