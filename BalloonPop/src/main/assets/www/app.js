let timerInterval; 
function startTimer(duration, display) {
  var timer = duration, minutes, seconds, milliseconds;
  var startTime = Date.now(); // Record the start time

  timerInterval = setInterval(function () {
    var currentTime = Date.now(); // Get the current time
    var elapsedTime = currentTime - startTime; // Calculate the elapsed time in milliseconds

    timer = duration - Math.floor(elapsedTime / 1000); // Update the timer based on elapsed time

    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    milliseconds = Math.floor((elapsedTime % 1000) / 10); // Calculate the milliseconds based on elapsed time

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    milliseconds = milliseconds < 10 ? "0" + milliseconds : milliseconds;

    display.textContent = minutes + ":" + seconds + "." + milliseconds;

    if (timer < 0) {
      timer = duration;
      startTime = Date.now(); // Reset the start time
	  stopGame();
	  document.getElementById('sorryTryAgain').style.display = 'block';
    }
  }, 10); // Use an interval of 10 milliseconds for smoother updates
}


// explosion construction
// explosion construction
function explode(x, y) {
  const particles = 15;
  // explosion container and its reference to be able to delete it on animation end
  const explosion = document.createElement('div');
  explosion.classList.add('explosion');

  // put the explosion container into the body to be able to get it's size
  document.body.appendChild(explosion);

  // position the container to be centered on click
  explosion.style.left = `${x - explosion.clientWidth / 2}px`;
  explosion.style.top = `${y - explosion.clientHeight / 2}px`;

  for (let i = 0; i < particles; i++) {
    // positioning x,y of the particle on the circle (little randomized radius)
    const xCoord = (explosion.clientWidth / 2) + rand(80, 150) * Math.cos(2 * Math.PI * i / rand(particles - 10, particles + 10)),
      yCoord = (explosion.clientHeight / 2) + rand(80, 150) * Math.sin(2 * Math.PI * i / rand(particles - 10, particles + 10)),
      color = `${rand(0, 255)}, ${rand(0, 255)}, ${rand(0, 255)}`,
      // particle element creation (could be anything other than div)
      elm = document.createElement('div');
    elm.className = 'particle';
    elm.style.backgroundColor = `rgb(${color})`;
    elm.style.top = `${yCoord}px`;
    elm.style.left = `${xCoord}px`;

    if (i == 0) { // no need to add the listener on all generated elements
      // css3 animation end detection
      elm.addEventListener('animationend', function(e) {
        explosion.remove(); // remove this explosion container when animation ended
      }, {once: true});
    }
    explosion.appendChild(elm);
  }
}
// get random number between min and max value
function rand(min, max) {
  return Math.floor(Math.random() * (max + 1)) + min;
}

function getLowProbabilityRandom(oneOutofMax=8) {
  // Generate a random integer between 0 and 19 (inclusive)
  var randomInt = Math.floor(Math.random() * oneOutofMax);

  // If the result is 0, return 1; otherwise, return 0
  return randomInt === 0 ? 1 : 0;
}

const balloonsContainer = document.getElementById('balloons');
const scoreContainer = document.getElementById('score');
let score = 0;
let maxBalloons = 10;

const BALLOON_POP_SOUND = document.getElementById('popup0')
BALLOON_POP_SOUND.volume = 0.4;

const BALLOON_EVIL_SOUND = document.getElementById('evil');
 BALLOON_EVIL_SOUND.volume = 0.4; 
 
const DINO = document.getElementById('dino');
 DINO.volume = 0.4; 
 
function updateScore(balloonType) {

  if (balloonType === 'evil') {
    score -= 10;
    scoreContainer.style.color = 'red';
  }
  else {
    score++;
    scoreContainer.style.color = '#ffffff';
  }
  if (score > 150) {
    stopGame();
    Confettiful(document.querySelector('.js-container'));
  }
  if (score < -100) {
    stopGame();
    document.getElementById('sorryTryAgain').style.display = 'block';
  }

  scoreContainer.innerHTML = 'Score: ' + score;
}
 
 
function playSound(balloonType) {
  if (balloonType === 'evil') {
	BALLOON_EVIL_SOUND.pause();
	BALLOON_EVIL_SOUND.currentTime = 0;
	BALLOON_EVIL_SOUND.play();
  }
  else {
	(balloonType === 'heart')?DINO.play():BALLOON_POP_SOUND.play();
  }
   
}

function handleBalloonClick(event) {
  event.preventDefault();
  const rect = this.getBoundingClientRect();
  if (rect.left) {
    explode(rect.left + 60, rect.top + 70);
  }
  this.remove();

  // Determine the type of balloon based on its CSS classes
  const balloonType = this.classList.contains('evilBalloon')
    ? 'evil'
    : this.classList.contains('heartBalloon')
      ? 'heart'
      : 'normal';
	  
  updateScore(balloonType);
  playSound(balloonType);
}
 
 
function createBalloon() {
  if (balloonsContainer.childElementCount < maxBalloons) {
    const balloon = document.createElement('div');
	balloon.innerHTML =  document.getElementById('ballonTemplate').innerHTML;
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
	const evilBalloon = getLowProbabilityRandom(8)? 'evilBalloon':'';
	const heartBalloon = getLowProbabilityRandom(30) && !evilBalloon? 'heartBalloon':'';
    balloon.className = `balloon balloon-${randomColor} ${evilBalloon}  ${heartBalloon}`;
    balloon.style.setProperty('--random', Math.random());
    balloon.addEventListener('animationend', () => {
      balloon.remove();
    });
    balloon.addEventListener('transitionend', () => {
      balloon.remove();
    });
	

    balloon.addEventListener('mouseover', handleBalloonClick);	
	balloon.addEventListener('touchstart', handleBalloonClick);

	
    balloonsContainer.appendChild(balloon);
  }
}
let interval1, interval2, interval3;
function startGame(){
	startTimer(180, clockTimer);
 interval1 = setInterval(function(){
	createBalloon();
	}, 1000);
interval2 = setInterval(function(){
	createBalloon();
	}, 800);
interval3 = setInterval(function(){
	createBalloon();
	}, 2000);
}




const startGameBtn = document.getElementById('startGameBtn');
const celebrate = document.getElementById('celebrate');
const sorryTryAgain = document.getElementById('sorryTryAgain');
function stopGame(){
	clearInterval(interval1);
	clearInterval(interval2);
	clearInterval(interval3);
	clearInterval(timerInterval);
	startGameBtn.style.display ='block';
	score = 0;
}


	startGameBtn.addEventListener("click", function() {
	  startGame();
	  startGameBtn.style.display ='none';
	  celebrate.style.display ='none';
	  sorryTryAgain.style.display ='none';
	  clearInterval(confettiInterval);
});


 