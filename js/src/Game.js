var Game = function() {
  var game = new createjs.Container();
  var momentum = {x: 0, y: 0};
  var player = new Player();
  var hill = new Hill();

  game.addChild(hill, player);

  var updateInterval = setInterval(updateGame, Math.floor(1000/60));

  function updateGame() {
    hill.move(momentum.x, momentum.y);
  }

  GaperGap.addEventListener('onKeyDown', function(event) {
    switch(event.key) {
      case 37: //Left
        momentum.x += 1;
        break;
      case 38: //Up
        momentum.y += 1;
        break;
      case 39: //Right
        momentum.x -= 1;
        break;
      case 40: //Down
        momentum.y -= 1;
        break;
      default:
        console.log("unhandled keydown! - ", event.key);
    }
  });

  GaperGap.addEventListener('stageResized', function(event){
    player.x = event.width/2;
    player.y = event.height/2;
  });
  
  return game;
};