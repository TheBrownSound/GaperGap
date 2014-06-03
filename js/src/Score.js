var Score = function(player, elementId){
  var score = {};
  var _total = 0;

  var _airtime = 0;
  var _speedtime = 0;
  var _speedScore = 0;

  var scoreBox = $('#score');
  scoreBox.addClass('show');

  function addToScore(amount) {
    _total += amount;
    scoreBox.html(_total);
  }

  score.reset = function() {
    _total = 0;
    addToScore(0);
  };

  score.update = function() {
    if (player.airborne) {
      _airtime++;
    } else if (_airtime > 0) {
      addToScore(_airtime);
      _airtime = 0;
    }

    var totalSpeed = GaperGap.utils.getTotalSpeed(player.speed.x, player.speed.y);
    if (totalSpeed > 10) {
      _speedtime++;
      _speedScore = _speedtime*_speedtime;
    } else if (_speedtime > 0 ) {
      _speedtime = 0;
      addToScore(_speedScore);
      _speedScore = 0;
    }
  };

  return score;
};