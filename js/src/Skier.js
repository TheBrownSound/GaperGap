var Skier = function() {
  var _angle = 0;
  var _crossed = false;
  var skier = new createjs.Container();

  var _bodyBase = {
    rotation: 0,
    y: -16
  };

  var _headBase = {
    rotation: 0,
    y: -20
  };

  // Body (Holds head and torso)
  var body = new createjs.Container();
  body.y = _bodyBase.y;

  // Head
  var head = new createjs.Bitmap(GaperGap.assets['gabe']);
  head.regX = head.image.width/2;
  head.regY = head.image.height*0.7;
  head.y = _headBase.y;

  // Torso Sprite
  var torsoData = {
    images: [GaperGap.assets['body-sprite']],
    frames: {width:70, height:70}
  };

  var torsoSprite = new createjs.SpriteSheet(torsoData);
  var torso = new createjs.Sprite(torsoSprite);

  torso.regX = torsoData.frames.width/2;
  torso.regY = torsoData.frames.height/2+6;
  torso.gotoAndStop(0);

  // Pants Sprite
  var pantsData = {
    images: [GaperGap.assets['pants-sprite']],
    frames: {width:40, height:27}
  };

  var pantsSprite = new createjs.SpriteSheet(pantsData);
  var pants = new createjs.Sprite(pantsSprite);
  
  pants.regX = pantsData.frames.width/2;
  pants.y = -pantsData.frames.height+4;
  pants.gotoAndStop(2);

  // Ski Sprites
  var skiData = {
    images: [GaperGap.assets['ski-sprite']],
    frames: {width:20, height:60}
  };

  var ski = new createjs.SpriteSheet(skiData);
  var leftSki = new createjs.Sprite(ski);
  var rightSki = new createjs.Sprite(ski);

  leftSki.regX = rightSki.regX = skiData.frames.width/2;
  leftSki.regY = rightSki.regY = skiData.frames.height/2;
  
  leftSki.gotoAndStop(2);
  rightSki.gotoAndStop(2);
  
  leftSki.x = -10;
  rightSki.x = 10;

  body.addChild(torso, head);
  skier.addChild(leftSki, rightSki, pants, body);

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
    if (bool) {
      body.y = _bodyBase.y+4;
      head.y = _headBase.y+2;
      torso.gotoAndStop(1);
    } else {
      body.y = _bodyBase.y;
      head.y = _headBase.y;
      torso.gotoAndStop(0);
    }
  };

  skier.cross = function(bool) {
    _crossed = bool;
  };

  skier.__defineGetter__('crossed', function(){
    return _crossed;
  });

  skier.__defineSetter__('angle', function(deg) {
    _angle = deg;

    var crosser = (_crossed) ? 40:0;
    leftSki.rotation = _angle-crosser;
    rightSki.rotation = _angle+crosser;

    var radians = _angle*Math.PI/180;
    radians = (Math.abs(_angle) > 90) ? radians : radians*0.7; // allows for skier leg offset
    leftSki.x = Math.cos(radians)*-10;
    leftSki.y = Math.sin(radians)*-4;
    rightSki.x = Math.cos(radians)*10;
    rightSki.y = Math.sin(radians)*4;
    
    //leftSki.y = (-_angle/90)*2;
    //rightSki.y = (_angle/90)*2;

    if (_angle < -60) {
      pants.gotoAndStop(4);
      leftSki.gotoAndStop(4);
      rightSki.gotoAndStop(4);
    } else if (_angle > 60) {
      pants.gotoAndStop(0);
      leftSki.gotoAndStop(0);
      rightSki.gotoAndStop(0);
    } else if (_angle < -30) {
      pants.gotoAndStop(3);
      leftSki.gotoAndStop(3);
      rightSki.gotoAndStop(3);
    } else if (_angle > 30) {
      pants.gotoAndStop(1);
      leftSki.gotoAndStop(1);
      rightSki.gotoAndStop(1);
    } else {
      pants.gotoAndStop(2);
      leftSki.gotoAndStop(2);
      rightSki.gotoAndStop(2);
    }
    return _angle;
  });

  return skier;
};