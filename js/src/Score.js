var Score = function(player){
  var score = {};
  var _total = 0;

  var _traveled = 0;
  var debugText = $('#score');
  debugText.addClass('show');

  function addToScore(amount) {
    _total += amount;
    debugText.innerHTML = "Score: "+_total;
  }

  score.reset = function() {
    addToScore(0);
    _total = 0;
  };

  score.__defineSetter__('traveled', function(distance) {
    var difference = distance - _traveled;
    var currentSpeed = GaperGap.utils.getTotalSpeed(player.speed.x, player.speed.y);
    _traveled = distance;
    var travelScore = Math.round(difference*currentSpeed/10);

    addToScore(travelScore);
    return _traveled;
  });

  return score;
};