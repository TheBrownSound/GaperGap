// Fuse dependencies
// @depends Game.js
// @depends Hill.js

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
    console.log('Game:init')
    stage = gapergap.stage = new createjs.Stage(document.getElementById(canvasId));

    //Enable User Inputs
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = false;
    stage.snapToPixelEnabled = true;

    manifest = [
      {src:"skier.png", id:"skier"},
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