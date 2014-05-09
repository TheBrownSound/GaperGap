var Player = function() {
  var player = new createjs.Container();
  var graphic = new createjs.Bitmap(GaperGap.assets['arrow']);
  graphic.regX = graphic.image.width/2;
  graphic.regY = graphic.image.height/2;;

  player.addChild(graphic);

  return player;
};