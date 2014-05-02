// Fuse dependencies

// Parent Game Logic
var Game = (function(){
  var game = {}
  var _canvas;

  var dispatcher = createjs.EventDispatcher.initialize(game);
  var stage;
  var skier;

  function startGame(gameObject) {
    //Ticker
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);

    sizeCanvas();
  }

  function sizeCanvas() {
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    skier.x = stage.canvas.width/2;
    skier.y = stage.canvas.height/2;
    
    game.dispatchEvent({type:'stageResized', width:stage.canvas.width, height:stage.canvas.height});
  }

  function onKeyDown(event) {
    switch(event.keyCode) {
      default:
        game.dispatchEvent({type:'onKeyDown', key:event.keyCode});
    }
  }

  function onKeyUp(event) {
    switch(event.keyCode) {
      default:
        game.dispatchEvent({type:'onKeyUp', key:event.keyCode});
    }
  }

  game.init = function(canvasId) {
    stage = game.stage = new createjs.Stage(document.getElementById(canvasId));

    //Enable User Inputs
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = false;
    stage.snapToPixelEnabled = true;

    skier = new createjs.Bitmap('assets/skier.png');
    skier.regX = 25;
    skier.regY = 110;
    skier.x = stage.canvas.width/2;
    skier.y = stage.canvas.height/2;
    stage.addChild(skier);

    startGame();
  }

  function tick() {
    stage.update();
  }

  $(document).ready(function(){
    console.log('DOCUMENT READY');
    window.onresize = sizeCanvas;
    window.onkeydown = onKeyDown;
    window.onkeyup = onKeyUp;
  });

  return game;
})();