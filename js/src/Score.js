var Score = function(player, elementId){
  var score = {};
  var _total = 0;

  var _airtime = 0;
  var _speedtime = 0;

  var speedSlug;

  var scoreElement = $('#score');
  var scoreBox = $('#score .box');
  scoreElement.addClass('show');

  function addToScore(amount) {
    _total += amount;
    scoreBox.html(_total);
  }

  player.addEventListener('hit', function(event) {
    if (event.target.type == "tree") {
      var slug = new ScoreSlug('Treehugger');
      slug.addScore(50);
      slug.done();
    }
  });

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
      if (!speedSlug) {
        speedSlug = new ScoreSlug('Speedy McSpeederson');
      } else {
        speedSlug.addScore(1);
      }
    } else if (speedSlug) {
      speedSlug.done();
      addToScore(speedSlug.amount);
      speedSlug = false;
    }
  };

  return score;
};

var ScoreSlug = function(name) {
  var slug = {};
  var score = 0;

  var stubElement = $('<div class=\"slug\">'+name+' <span class=\"points\">+0</span></div>');
  stubElement.appendTo($('#score'));

  stubElement.animate({
    marginTop: "10px",
    opacity: 1
  }, 500);

  slug.addScore = function(amount) {
    score += amount;
    var prefix = (score < 0) ? "":"+";
    stubElement.find('.points').html(prefix+score);
  };

  slug.done = function() {
    stubElement.animate({
      marginTop: "-60px",
      opacity: 0
    }, 500, function() {
      stubElement.remove();
    });
    
  };

  slug.__defineGetter__('amount', function(){
    return score;
  });

  return slug;
};