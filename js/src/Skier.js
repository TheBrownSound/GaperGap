var Skier = function() {
  var _angle = 0;
  var _crossed = 0;
  var _tucked = false;
  var _sunk = false;
  var skier = new createjs.Container();

  var _bodyBase = {
    rotation: 0,
    y: -32
  };

  var _headBase = {
    rotation: 0,
    y: -40
  };

  // Body (Holds head and torso)
  var body = new createjs.Container();
  body.y = _bodyBase.y;

  // Head
  var headData = {
    images: [GaperGap.assets['gabe']],
    frames: {width:100, height:114}
  };

  var headSprite = new createjs.SpriteSheet(headData);
  var head = new createjs.Sprite(headSprite);

  head.regX = headData.frames.width/2;
  head.regY = headData.frames.height*0.7;
  head.y = _headBase.y;
  head.gotoAndStop(0);

  // Torso Sprite
  var torsoData = {
    images: [GaperGap.assets['body-sprite']],
    frames: {width:140, height:140}
  };

  var torsoSprite = new createjs.SpriteSheet(torsoData);
  var torso = new createjs.Sprite(torsoSprite);

  torso.regX = torsoData.frames.width/2;
  torso.regY = torsoData.frames.height/2+6;
  torso.gotoAndStop(0);

  // Pants Sprite
  var pantsData = {
    images: [GaperGap.assets['pants-sprite']],
    frames: {width:80, height:56}
  };

  var pantsSprite = new createjs.SpriteSheet(pantsData);
  var pants = new createjs.Sprite(pantsSprite);
  
  pants.regX = pantsData.frames.width/2;
  pants.y = -pantsData.frames.height+14;
  pants.gotoAndStop(2);

  // Ski Sprites
  var skiData = {
    images: [GaperGap.assets['ski-sprite']],
    frames: {width:40, height:120}
  };

  var ski = new createjs.SpriteSheet(skiData);
  var leftSki = new createjs.Sprite(ski);
  var rightSki = new createjs.Sprite(ski);

  leftSki.regX = rightSki.regX = skiData.frames.width/2;
  leftSki.regY = rightSki.regY = skiData.frames.height/2-8;
  
  leftSki.gotoAndStop(2);
  rightSki.gotoAndStop(2);

  // Powder Blob
  var blob = new createjs.Bitmap(GaperGap.assets['powder-blob']);
  blob.regX = blob.image.width/2;
  blob.regY = blob.image.height/2;
  blob.scaleX = blob.scaleY = 0;

  body.addChild(torso, head);
  skier.addChild(leftSki, rightSki, pants, blob, body);

  skier.turn = function(dir) {
    var tilt = 10;
    switch (dir) {
      case 'left':
        createjs.Tween.get(body, {override:true}).to({
          rotation:_bodyBase.rotation+tilt
        }, 100, createjs.Ease.linear);
        createjs.Tween.get(head, {override:true}).to({
          rotation:_headBase.rotation-tilt
        }, 100, createjs.Ease.linear);
        break;
      case 'right':
        createjs.Tween.get(body, {override:true}).to({
          rotation:_bodyBase.rotation-tilt
        }, 100, createjs.Ease.linear);
        createjs.Tween.get(head, {override:true}).to({
          rotation:_headBase.rotation+tilt
        }, 100, createjs.Ease.linear);
        break;
      default:
        createjs.Tween.get(body, {override:true}).to({
          rotation:_bodyBase.rotation
        }, 100, createjs.Ease.linear);
        createjs.Tween.get(head, {override:true}).to({
          rotation:_headBase.rotation
        }, 100, createjs.Ease.linear);
    }
  };

  skier.squat = function(bool) {
    if (bool) {
      body.y = _bodyBase.y+4;
    } else {
      body.y = _bodyBase.y;
    }
  };

  skier.tuck = function(bool) {
    _tucked = bool;
    if (_tucked) {
      body.y = _bodyBase.y+4;
      head.y = _headBase.y+2;
      torso.gotoAndStop(1);
    } else {
      body.y = _bodyBase.y;
      head.y = _headBase.y;
      torso.gotoAndStop(0);
    }
  };

  skier.plow = function(bool) {
    if (bool) {
      _crossed = 10;
    } else {
      _crossed = 0;
    }
  };

  skier.cross = function(bool) {
    //_crossed = bool;
  };

  skier.crash = function(type) {
    if (type === "tree") {
      var leftXForce = GaperGap.utils.getRandomInt(-10, -400);
      var leftYForce = GaperGap.utils.getRandomInt(0,200);
      createjs.Tween.get(leftSki, {override:true}).to({
        x: leftXForce,
        y: leftYForce,
        rotation: GaperGap.utils.getRandomInt(-leftXForce,leftXForce)
      }, Math.abs(leftXForce+leftYForce)*2, createjs.Ease.sineOut);

      var rightXForce = GaperGap.utils.getRandomInt(10, 400);
      var rightYForce = GaperGap.utils.getRandomInt(0,200);
      createjs.Tween.get(rightSki, {override:true}).to({
        x: rightXForce,
        y: rightYForce,
        rotation: GaperGap.utils.getRandomInt(-rightXForce,rightXForce)
      }, (rightXForce+rightYForce)*2, createjs.Ease.sineOut);
    }
  };

  skier.sink = function(bool) {
    console.log('sink! - ', bool);
    _sunk = bool;
    if (bool) {
      createjs.Tween.get(skier, {override:true}).to({
        y: 20
      }, 500, createjs.Ease.sineIn);

      createjs.Tween.get(blob, {override:true}).to({
        scaleX: 1,
        scaleY: 1
      }, 300, createjs.Ease.bounceOut);
    } else {
      createjs.Tween.get(skier, {override:true}).to({
        y: 0
      }, 200, createjs.Ease.circOut);

      createjs.Tween.get(blob, {override:true}).to({
        scaleX: 0,
        scaleY: 0
      }, 500, createjs.Ease.circOut);
    }
  };

  skier.reset = function(deg) {
    skier.squat(false);
    skier.tuck(false);
    _crossed = 0;
    skier.angle = deg;
  };

  skier.__defineGetter__('crossed', function(){
    return _crossed;
  });

  skier.__defineSetter__('angle', function(deg) {
    _angle = deg;

    if (_sunk) {
      blob.rotation++;
    }

    if (_angle < -90 || _angle > 90) {
      torso.gotoAndStop(2);
      head.gotoAndStop(1);
    } else {
      if (_tucked) {
        torso.gotoAndStop(1);
      } else {
        torso.gotoAndStop(0);
      }
      head.gotoAndStop(0);
    }

    leftSki.rotation = _angle-_crossed;
    rightSki.rotation = _angle+_crossed;

    var lift = (_angle < -90 || _angle > 90) ? 2 : 0;

    var radians = _angle*Math.PI/180;
    radians = (Math.abs(_angle) > 90) ? radians : radians*0.7; // allows for skier leg offset
    leftSki.x = Math.cos(radians)*-20;
    leftSki.y = Math.sin(radians)*-8-lift;
    rightSki.x = Math.cos(radians)*20;
    rightSki.y = Math.sin(radians)*8-lift;
    
    if (_angle < -150 || _angle > 150) {
      pants.gotoAndStop(9);
      leftSki.gotoAndStop(2);
      rightSki.gotoAndStop(2);
    } else if (_angle < -120) {
      pants.gotoAndStop(10);
    } else if (_angle > 120) {
      pants.gotoAndStop(8);
    } else if (_angle < -90) {
      pants.gotoAndStop(11);
      leftSki.gotoAndStop(3);
      rightSki.gotoAndStop(3);
    } else if (_angle > 90) {
      pants.gotoAndStop(7);
      leftSki.gotoAndStop(1);
      rightSki.gotoAndStop(1);
    } else if (_angle < -70) {
      pants.gotoAndStop(6);
      leftSki.gotoAndStop(4);
      rightSki.gotoAndStop(4);
    } else if (_angle > 70) {
      pants.gotoAndStop(0);
      leftSki.gotoAndStop(0);
      rightSki.gotoAndStop(0);
    } else if (_angle < -50) {
      pants.gotoAndStop(5);
      leftSki.gotoAndStop(3);
      rightSki.gotoAndStop(3);
    } else if (_angle > 50) {
      pants.gotoAndStop(1);
      leftSki.gotoAndStop(1);
      rightSki.gotoAndStop(1);
    } else if (_angle < -20) {
      pants.gotoAndStop(4);
      leftSki.gotoAndStop(3);
      rightSki.gotoAndStop(3);
    } else if (_angle > 20) {
      pants.gotoAndStop(2);
      leftSki.gotoAndStop(1);
      rightSki.gotoAndStop(1);
    } else {
      pants.gotoAndStop(3);
      leftSki.gotoAndStop(2);
      rightSki.gotoAndStop(2);
    }
    return _angle;
  });

  return skier;
};