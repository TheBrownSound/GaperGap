var Game = function() {
  var game = new createjs.Container();
  var momentum = {x: 0, y: 0};
  var player = new Player();
  var hill = new Hill();

  game.addChild(hill, player);

  var updateInterval = setInterval(updateGame, Math.floor(1000/60));

  function updateGame() {
    player.update();
    hill.move(player.speed.x, player.speed.y);
  }

  GaperGap.addEventListener('onKeyDown', function(event) {
    switch(event.key) {
      case 37: //Left
        player.turnRight();
        break;
      case 38: //Up
        player.scrubSpeed();
        break;
      case 39: //Right
        player.turnLeft();
        break;
      case 40: //Down
        player.tuckDown();
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
      default:
        console.log("unhandled keyup! - ", event.key);
    }
  });

  GaperGap.addEventListener('stageResized', function(event){
    player.x = event.width/2;
    player.y = event.height/2;
  });
  
  return game;
};