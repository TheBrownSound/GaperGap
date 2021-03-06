// Fuse dependencies
// @depends Utils.js
// @depends Game.js
// @depends Score.js
// @depends Particles.js
// @depends Skier.js
// @depends Player.js
// @depends Hill.js
// @depends Section.js
// @depends Tree.js
// @depends Jump.js
// @depends PowderStash.js
// @depends Cliff.js

// Parent Game Logic
var GaperGap = (function(){

  var _maxWidth = 1000;
  var _maxHeight = 600;

  var gapergap = {
    utils: new Utils()
  };
  var _preloadAssets = [];
  var _canvas;

  var dispatcher = createjs.EventDispatcher.initialize(gapergap);
  var preloader, stage, game;

  var messageBox = $('#message');

  function handleFileLoad(event) {
    console.log('handleFileLoad: ', event);
    _preloadAssets.push(event.item);
  }

  function startGame(gameObject) {
    console.log('Game:startGame');
    gapergap.assets = {};
    for (var i = 0; i < _preloadAssets.length; i++) {
      gapergap.assets[_preloadAssets[i].id] = preloader.getResult(_preloadAssets[i].id);
    }
    console.log('Game.assets', gapergap.assets);

    game = new Game();

    messageBox.removeClass('initial');
    messageBox.removeClass('show');

    stage.addChild(game);

    //Ticker
    createjs.Ticker.setFPS(64);
    createjs.Ticker.addEventListener("tick", tick);

    sizeCanvas();
  }

  function sizeCanvas() {
    var topMargin = (window.innerHeight > _maxHeight) ? (window.innerHeight-_maxHeight)/2 : 0;
    console.log('top margin: ', topMargin);
    stage.canvas.style.marginTop = topMargin+'px';
    stage.canvas.width = (window.innerWidth > _maxWidth) ? _maxWidth : window.innerWidth;
    stage.canvas.height = (window.innerHeight > _maxHeight) ? _maxHeight : window.innerHeight;

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
    document.getElementById('fps').innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
  }

  gapergap.showMessage = function(msg) {
    messageBox.html(msg);
    messageBox.addClass('show');
  };

  gapergap.hideMessage = function() {
    messageBox.removeClass('show');
  };

  gapergap.init = function(canvasId) {
    console.log('Game:init');
    stage = gapergap.stage = new createjs.Stage(document.getElementById(canvasId));

    //Enable User Inputs
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = false;
    stage.snapToPixelEnabled = true;

    manifest = [
      {src:"gapergap_logo.png", id:"logo"},
      {src:"gaper_sprite.png", id:"gabe"},
      {src:"bodies.png", id:"body-sprite"},
      {src:"pants.png", id:"pants-sprite"},
      {src:"ski_sprite.png", id:"ski-sprite"},
      {src:"hitbox.png", id:"player-hitbox"},
      {src:"snow_ball.png", id:"snow-ball"},
      {src:"powder_blob.png", id:"powder-blob"},
      {src:"trunk_hit.png", id:"trunk-hitbox"},
      {src:"trunk_1.png", id:"trunk-1"},
      {src:"trunk_2.png", id:"trunk-2"},
      {src:"tree_1.png", id:"tree-1"},
      {src:"tree_2.png", id:"tree-2"},
      {src:"tree_3.png", id:"tree-3"},
      {src:"powder_patch.png", id:"powder-stash"},
      {src:"cliff_1.png", id:"cliff-1"},
      {src:"cliff_massive.png", id:"cliff-massive"},
      {src:"jump_small.png", id:"jump-s"},
      {src:"jump_medium.png", id:"jump-m"},
      {src:"hill_background.png", id:"hill-background"},
      {src:"sky.png", id:"sky"}
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

    if ('ontouchstart' in window) { // mobile stuff
      $('body').addClass('touch');

      $('left-turn').bind('touchstart', function(){
        console.log('rawr');
        gapergap.dispatchEvent({type:'onKeyDown', key:"touch-left"});
      }).bind('touchend', function(){
        gapergap.dispatchEvent({type:'onKeyUp', key:"touch-left"});
      });

      $('right-turn').bind('touchstart', function(){
        gapergap.dispatchEvent({type:'onKeyDown', key:"touch-right"});
      }).bind('touchend', function(){
        gapergap.dispatchEvent({type:'onKeyUp', key:"touch-right"});
      });

    }

    window.onresize = sizeCanvas;
    window.onkeydown = onKeyDown;
    window.onkeyup = onKeyUp;
  });

  return gapergap;
})();
