// Fuse dependencies
var Game = function() {
  var game = new createjs.Container();
  var momentum = {x: 0, y: 0};
  var player = new Player();
  var hill = new Hill();

  game.addChild(hill, player);

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

  createjs.Ticker.addEventListener("tick", updateGame);
  
  return game;
};
var Player = function() {
  var player = new createjs.Container();
  var graphic = new createjs.Bitmap(GaperGap.assets['arrow']);
  graphic.regX = graphic.image.width/2;
  graphic.regY = graphic.image.height/2;;

  player.addChild(graphic);

  return player;
};
var Hill = function(width, height){
  var _position = {x:0, y:0};
  var _width = 300;
  var _height = 300;
  var hill = new createjs.Container();
  var snow = new createjs.Shape();

  hill.addChild(snow);

  function drawHill() {
    var crossWidth = _width*3 + _height*3;
    snow.graphics.clear();
    snow.graphics.beginBitmapFill(GaperGap.assets['bg']);
    snow.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);
    snow.graphics.endFill();
  }

  hill.move = function(x, y) {
    //document.getElementById('coords').innerHTML = ('x:'+hill.position.x+' - y:'+hill.position.y);
    snow.x = (snow.x+x) % 120;
    snow.y = (snow.y+y) % 120;
  };

  hill.__defineSetter__('height', function(value){
    _height = value;
    return _height;
  });

  hill.__defineGetter__('height', function(){
    return _height;
  });

  hill.__defineSetter__('width', function(value){
    _height = value;
    return _width;
  });

  hill.__defineGetter__('width', function(){
    return _width;
  });

  drawHill(); // trigger draw on create;

  return hill;
};


// Parent Game Logic
var GaperGap = (function(){
  var gapergap = {};
  var _preloadAssets = [];
  var _canvas;

  var dispatcher = createjs.EventDispatcher.initialize(gapergap);
  var preloader, stage, game;

  function handleFileLoad(event) {
    console.log('handleFileLoad: ', event);
    _preloadAssets.push(event.item);
  }

  function startGame(gameObject) {
    console.log('Game:startGame')
    gapergap.assets = {};
    for (var i = 0; i < _preloadAssets.length; i++) {
      gapergap.assets[_preloadAssets[i].id] = preloader.getResult(_preloadAssets[i].id);
    };
    console.log('Game.assets', gapergap.assets);

    game = new Game();

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
  }

  gapergap.init = function(canvasId) {
    console.log('Game:init');
    stage = gapergap.stage = new createjs.Stage(document.getElementById(canvasId));

    //Enable User Inputs
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = false;
    stage.snapToPixelEnabled = true;

    manifest = [
      {src:"skier.png", id:"skier"},
      {src:"arrow.png", id:"arrow"},
      {src:"background-repeat.png", id:"bg"}
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
    window.onresize = sizeCanvas;
    window.onkeydown = onKeyDown;
    window.onkeyup = onKeyUp;
  });

  return gapergap;
})();