var Score = function(player){
  var score = {};
  var _total = 0;

  var _traveled = 0;
  var debugText = document.getElementById('score');

  function addToScore(amount) {
    _total += amount;
    debugText.innerHTML = "Score: "+_total;
  }

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