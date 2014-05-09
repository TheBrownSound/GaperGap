var Game = function() {
  var game = new createjs.Container();
  var skier = new createjs.Bitmap(GaperGap.assets['skier']);
  skier.regX = 25;
  skier.regY = 110;

  var momentum = {x: 0, y: 0};
    
  var hill = new Hill();

  game.addChild(hill, skier);

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
    skier.x = event.width/2;
    skier.y = event.height/2;
  });

  createjs.Ticker.addEventListener("tick", updateGame);

  function updateGame() {
    hill.move(momentum.x, momentum.y);
  }
  
  return game;
};