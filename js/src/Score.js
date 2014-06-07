var Score = function(player, elementId){
  var score = {};
  var _total = 0;

  var _airtime = 0;
  var _speedtime = 0;

  var speedSlug;
  var airSlug;

  var scoreElement = $('#score');
  var scoreBox = $('#score .board');
  scoreElement.addClass('show');

  function addToScore(amount) {
    console.log('Score:add - ', amount);
    _total += amount;
    scoreBox.html(_total);
  }

  player.addEventListener('hit', function(event) {
    if (event.target.type == "tree") {
      var slug = new ScoreSlug('Treehugger', addToScore);
      slug.addScore(50);
      addToScore(slug.amount);
      slug.done();
    }
  });

  score.reset = function() {
    _total = 0;
    addToScore(0);
  };

  score.update = function() {
    if (player.airborne) {
      if (!airSlug) {
        airSlug = new ScoreSlug('Air', addToScore);
      } else {
        airSlug.addScore(2);
      }
    } else if (airSlug) {
      airSlug.done();
      addToScore(airSlug.amount);
      airSlug = false;
    }

    var totalSpeed = GaperGap.utils.getTotalSpeed(player.speed.x, player.speed.y);
    if (totalSpeed > 10) {
      if (!speedSlug) {
        speedSlug = new ScoreSlug('Speedy McSpeederson', addToScore);
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

var ScoreSlug = function(name, scoreFn) {
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
    setTimeout(function(){
      stubElement.animate({
        marginTop: "-60px",
        opacity: 0
      }, 500, function() {
        scoreFn(score);
        stubElement.remove();
      });
    }, 1000);
  };

  slug.__defineGetter__('amount', function(){
    return score;
  });

  return slug;
};