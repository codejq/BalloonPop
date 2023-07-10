var confettiInterval; 
function Confettiful(el) {
	const celebrate = document.getElementById('celebrate');
	celebrate.style.display ='block';
  var self = this;

  this.el = el;
  this.containerEl = null;

  this.confettiFrequency = 3;
  this.confettiColors = ['#EF2964', '#00C09D', '#2D87B0', '#48485E', '#EFFF1D'];
  this.confettiAnimations = ['slow', 'medium', 'fast'];

  function setupElements() {
    var containerEl = document.createElement('div');
    var elPosition = self.el.style.position;

    if (elPosition !== 'relative' || elPosition !== 'absolute') {
      self.el.style.position = 'relative';
    }

    containerEl.classList.add('confetti-container');

    self.el.appendChild(containerEl);

    self.containerEl = containerEl;
  }

  function renderConfetti() {
     confettiInterval = setInterval(function() {
      var confettiEl = document.createElement('div');
      var confettiSize = (Math.floor(Math.random() * 3) + 7) + 'px';
      var confettiBackground = self.confettiColors[Math.floor(Math.random() * self.confettiColors.length)];
      var confettiLeft = (Math.floor(Math.random() * self.el.offsetWidth)) + 'px';
      var confettiAnimation = self.confettiAnimations[Math.floor(Math.random() * self.confettiAnimations.length)];

      confettiEl.classList.add('confetti', 'confetti--animation-' + confettiAnimation);
      confettiEl.style.left = confettiLeft;
      confettiEl.style.width = confettiSize;
      confettiEl.style.height = confettiSize;
      confettiEl.style.backgroundColor = confettiBackground;

      destoryAnnimation = setTimeout(function() {
        confettiEl.parentNode.removeChild(confettiEl);
      }, 3000);

      self.containerEl.appendChild(confettiEl);
    }, 25);
  }

  setupElements();
  renderConfetti();
}


