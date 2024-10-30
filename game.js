// Game variables
const gameContainer = document.querySelector(".game-container");
const player = document.querySelector(".player");
let score = 0;
let gameStarted = false;
let gameWon = false;
let starGenerationInterval;
let missedStars = 0;
const MAX_MISSED_STARS = 3;
const WINNING_SCORE = 10;
let isGameOver = false;
let isMovingLeft = false;
let isMovingRight = false;
let movementInterval;
// Add these near your other game variables at the top
let isPaused = false;
let isMuted = false;
const audioElements = {
  background: document.getElementById("backgroundMusic"),
  collect: document.getElementById("collectSound"),
  miss: document.getElementById("missSound"),
};
const volumeSlider = document.getElementById("volume-slider");
const volumeValue = document.querySelector(".volume-value");
const MAX_STARS_ON_SCREEN = 4;
function initAudio() {
  // Set initial volumes
  Object.values(audioElements).forEach((audio) => {
    if (audio) {
      audio.volume = 0.5; // Set default volume to 50%
    }
  });
}
volumeSlider.addEventListener("input", (e) => {
  const volume = e.target.value / 100;
  volumeValue.textContent = `${e.target.value}%`;

  // Update volume for all audio elements
  Object.values(audioElements).forEach((audio) => {
    if (audio) {
      audio.volume = volume;
    }
  });
});

// Movement control
function movePlayer(direction) {
  if (isGameOver || isPaused) return; // Immediately stop if game is over or Paused

  const currentPosition = parseInt(window.getComputedStyle(player).left);
  const gameWidth = gameContainer.offsetWidth;
  const playerWidth = player.offsetWidth;
  const moveSpeed = 30;

  if (direction === "left") {
    const newPosition = Math.max(0, currentPosition - moveSpeed);
    player.style.left = newPosition + "px";
    player.style.transform = "scaleX(-1)";
    if (!player.classList.contains("moving-left")) {
      player.classList.add("moving-left");
      player.classList.remove("moving-right");
    }
  } else {
    const newPosition = Math.min(
      gameWidth - playerWidth,
      currentPosition + moveSpeed
    );
    player.style.left = newPosition + "px";
    player.style.transform = "scaleX(1)";
    if (!player.classList.contains("moving-right")) {
      player.classList.add("moving-right");
      player.classList.remove("moving-left");
    }
  }
  // In your JavaScript
  const starCounter = document.getElementById("starCounter");
  starCounter.textContent = `Stars Left: ${MAX_MISSED_STARS - missedStars} ⭐`;
}

// Keyboard event handlers
function handleKeyDown(event) {
  if (isGameOver) return; // Stop all input if game is over

  if (event.repeat) return;

  switch (event.key) {
    case "ArrowLeft":
    case "a":
      isMovingLeft = true;
      movePlayer("left");
      if (!movementInterval) {
        movementInterval = setInterval(() => {
          if (isMovingLeft) movePlayer("left");
          if (isMovingRight) movePlayer("right");
        }, 16);
      }
      break;
    case "ArrowRight":
    case "d":
      isMovingRight = true;
      movePlayer("right");
      if (!movementInterval) {
        movementInterval = setInterval(() => {
          if (isMovingLeft) movePlayer("left");
          if (isMovingRight) movePlayer("right");
        }, 16);
      }
      break;
  }
}

function handleKeyUp(event) {
  if (isGameOver) return;

  switch (event.key) {
    case "ArrowLeft":
    case "a":
      isMovingLeft = false;
      player.classList.remove("moving-left");
      break;
    case "ArrowRight":
    case "d":
      isMovingRight = false;
      player.classList.remove("moving-right");
      break;
  }

  if (!isMovingLeft && !isMovingRight) {
    clearInterval(movementInterval);
    movementInterval = null;
  }
}
// Star generation and collision
function createStar() {
  if (!gameStarted || gameWon || isGameOver || isPaused) return;

  // Count current stars on screen
  const currentStars = document.querySelectorAll(".star").length;

  // Don't create new star if at max capacity
  if (currentStars >= MAX_STARS_ON_SCREEN) return;

  const star = document.createElement("div");
  star.className = "star";
  star.style.left = Math.random() * (gameContainer.offsetWidth - 30) + "px";
  star.style.top = "-30px";
  star.innerHTML = "⭐";
  gameContainer.appendChild(star);

  let posY = -30;
  const fallInterval = setInterval(() => {
    if (!gameStarted || gameWon || isGameOver || isPaused) {
      clearInterval(fallInterval);
      star.remove();
      return;
    }

    posY += 2;
    star.style.top = posY + "px";

    // Check collision with player
    const starRect = star.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (checkCollision(starRect, playerRect)) {
      score += 1;
      updateScore();
      star.remove();
      clearInterval(fallInterval);
      createSparkleExplosion(starRect.left, starRect.top);

      // Play collect sound
      if (audioElements.collect && !isMuted) {
        audioElements.collect.currentTime = 0; // Reset sound to start
        audioElements.collect.play();
      }

      // Check for win condition
      if (score >= WINNING_SCORE) {
        win();
      }
    }
    // Check for missed stars
    if (posY > gameContainer.offsetHeight) {
      missedStars++;
      updateStarCounter();
      star.remove();
      clearInterval(fallInterval);

      // Play miss sound
      if (audioElements.miss && !isMuted) {
        audioElements.miss.currentTime = 0; // Reset sound to start
        audioElements.miss.play();
      }

      if (missedStars >= MAX_MISSED_STARS) {
        lose("Too many missed stars!");
      }
    }
  }, 16);
}

function startStarGeneration() {
  if (starGenerationInterval) {
    clearInterval(starGenerationInterval);
  }
  // More frequent checks (every 500ms instead of 1000ms)
  starGenerationInterval = setInterval(createStar, 900);
}
function checkCollision(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

// Score and counter updates
function updateScore() {
  const scoreDisplay = document.querySelector(".score");
  if (scoreDisplay) {
    scoreDisplay.textContent = `Score: ${score}`;
  }
}

function updateStarCounter() {
  const starCounter = document.querySelector(".star-counter");
  if (starCounter) {
    starCounter.innerHTML = `Stars Left: ${MAX_MISSED_STARS - missedStars} ⭐`;

    if (MAX_MISSED_STARS - missedStars <= 1) {
      starCounter.classList.add("warning");
    } else {
      starCounter.classList.remove("warning");
    }
  }
}

// Visual effects
function createSparkleExplosion(x, y) {
  for (let i = 0; i < 8; i++) {
    createSparkle(x, y);
  }
}

function createSparkle(x, y) {
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  sparkle.style.left = x + "px";
  sparkle.style.top = y + "px";
  sparkle.style.background = getRandomColor();
  gameContainer.appendChild(sparkle);

  const angle = Math.random() * Math.PI * 2;
  const velocity = Math.random() * 5 + 2;
  let sparkleX = x;
  let sparkleY = y;
  let opacity = 1;

  const moveSparkle = () => {
    sparkleX += Math.cos(angle) * velocity;
    sparkleY += Math.sin(angle) * velocity - 0.5;
    opacity -= 0.02;

    sparkle.style.left = sparkleX + "px";
    sparkle.style.top = sparkleY + "px";
    sparkle.style.opacity = opacity;

    if (opacity > 0) {
      requestAnimationFrame(moveSparkle);
    } else {
      sparkle.remove();
    }
  };

  moveSparkle();
}

function getRandomColor() {
  const colors = [
    "var(--primary)",
    "var(--secondary)",
    "var(--accent)",
    "var(--contrast)",
    "var(--gold)",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
// Win and lose states
function win() {
  isGameOver = true;
  gameWon = true;
  gameStarted = false;

  // Stop all movement
  clearInterval(movementInterval);
  movementInterval = null;
  isMovingLeft = false;
  isMovingRight = false;

  // Remove movement classes and add win state
  player.classList.remove("moving-left", "moving-right");
  player.classList.add("happy");

  // Remove event listeners
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);

  // Stop star generation
  clearInterval(starGenerationInterval);

  // Remove existing stars
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => star.remove());

  // Create win screen
  const winContainer = document.createElement("div");
  winContainer.className = "win-celebration";
  winContainer.innerHTML = `
    <div class="win-message">🎉 You Won! 🎉</div>
    <div class="final-score">Score: ${score}</div>
    <button class="play-again-button">Play Again</button>
  `;
  gameContainer.appendChild(winContainer);

  // Add play again functionality
  const playAgainButton = winContainer.querySelector(".play-again-button");
  playAgainButton.addEventListener("click", () => {
    winContainer.remove();
    player.classList.remove("happy");
    resetGame();
  });
}

function lose(reason = "Game Over!") {
  isGameOver = true;
  gameWon = false;
  gameStarted = false;

  // Stop all movement
  clearInterval(movementInterval);
  movementInterval = null;
  isMovingLeft = false;
  isMovingRight = false;

  // Remove movement classes and add lose state
  player.classList.remove("moving-left", "moving-right");
  player.classList.add("sad");

  // Remove event listeners
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);

  // Stop star generation
  clearInterval(starGenerationInterval);

  // Create lose screen
  const loseContainer = document.createElement("div");
  loseContainer.className = "lose-celebration";
  loseContainer.innerHTML = `
    <div class="lose-message">😢 ${reason} 😢</div>
    <div class="final-score">Score: ${score}</div>
    <button class="play-again-button">Try Again</button>
  `;
  gameContainer.appendChild(loseContainer);

  // Add try again functionality
  const playAgainButton = loseContainer.querySelector(".play-again-button");
  playAgainButton.addEventListener("click", () => {
    loseContainer.remove();
    player.classList.remove("sad");
    resetGame();
  });
}

// Game state management
function resetGame() {
  // Reset game flags
  isGameOver = false;
  score = 0;
  gameWon = false;
  gameStarted = true;
  missedStars = 0;

  // Reset player state
  player.classList.remove("happy", "sad", "moving-left", "moving-right");

  // Center the player
  player.style.left =
    gameContainer.offsetWidth / 2 - player.offsetWidth / 2 + "px";

  // Re-add event listeners
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Update displays
  updateScore();
  updateStarCounter();

  // Restart star generation
  if (starGenerationInterval) {
    clearInterval(starGenerationInterval);
  }
  startStarGeneration();
}

function initGame() {
  initAudio();
  // Initialize game state
  score = 0;
  gameWon = false;
  gameStarted = true;
  missedStars = 0;
  isGameOver = false;

  // Center the player
  player.style.left =
    gameContainer.offsetWidth / 2 - player.offsetWidth / 2 + "px";

  // Create game stats container
  const statsContainer = document.createElement("div");
  statsContainer.className = "game-stats";
  gameContainer.appendChild(statsContainer);

  // Create score display
  if (!document.querySelector(".score")) {
    const scoreDisplay = document.createElement("div");
    scoreDisplay.className = "score";
    scoreDisplay.textContent = "Score: 0";
    statsContainer.appendChild(scoreDisplay);
  }

  // Create star counter
  if (!document.querySelector(".star-counter")) {
    const starCounter = document.createElement("div");
    starCounter.className = "star-counter";
    starCounter.innerHTML = `Stars Left: ${MAX_MISSED_STARS} ⭐`;
    statsContainer.appendChild(starCounter);
  }

  // Add event listeners
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Start star generation
  createStar();
  if (starGenerationInterval) {
    clearInterval(starGenerationInterval);
  }
  startStarGeneration();
}
// Start the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".game-container")) {
    setTimeout(initGame, 500);
  }
});
const muteButton = document.getElementById("muteButton");
const pauseButton = document.getElementById("pauseButton");

// SVG paths for different states
const icons = {
  mute: {
    on: '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>',
    off: '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>',
  },
  pause: {
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>',
  },
};
muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
  muteButton.querySelector("svg").innerHTML = isMuted
    ? icons.mute.off
    : icons.mute.on;

  // Store previous volume when muting
  if (isMuted) {
    volumeSlider.setAttribute("data-previous-value", volumeSlider.value);
    volumeSlider.value = 0;
    volumeValue.textContent = "0%";
  } else {
    // Restore previous volume when unmuting
    const previousValue =
      volumeSlider.getAttribute("data-previous-value") || 50;
    volumeSlider.value = previousValue;
    volumeValue.textContent = `${previousValue}%`;
  }

  // Update all audio elements
  Object.values(audioElements).forEach((audio) => {
    if (audio) {
      audio.muted = isMuted;
    }
  });
});
pauseButton.addEventListener("click", () => {
  isPaused = !isPaused;

  // Update button icon and style
  pauseButton.querySelector("svg").innerHTML = isPaused
    ? icons.pause.play
    : icons.pause.pause;

  // Toggle active class for color change
  pauseButton.classList.toggle("active", isPaused);

  if (isPaused) {
    pauseGame();
  } else {
    resumeGame();
  }
});

// Make the controls div match the score width
window.addEventListener("load", () => {
  const score = document.querySelector(".score");
  const controls = document.querySelector(".game-controls");
  controls.style.width = `${score.offsetWidth}px`;
});
function pauseGame() {
  // Pause star animations
  document.querySelectorAll(".star").forEach((star) => {
    star.style.animationPlayState = "paused";
  });

  // Pause sparkle animations
  document.querySelectorAll(".sparkle").forEach((sparkle) => {
    sparkle.style.animationPlayState = "paused";
  });

  // Stop intervals
  clearInterval(starGenerationInterval);
  clearInterval(movementInterval);
  movementInterval = null;

  // Disable controls
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);

  // Show pause overlay
  showPauseOverlay();
}
function resumeGame() {
  // Resume star animations
  document.querySelectorAll(".star").forEach((star) => {
    star.style.animationPlayState = "running";
  });

  // Resume sparkle animations
  document.querySelectorAll(".sparkle").forEach((sparkle) => {
    sparkle.style.animationPlayState = "running";
  });

  // Restart intervals if game is still active
  if (gameStarted && !gameWon && !isGameOver) {
    starGenerationInterval = setInterval(createStar, 1000);
  }

  // Re-enable controls if game is still active
  if (!isGameOver && !gameWon) {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
  }

  // Remove pause overlay
  hidePauseOverlay();
}

function showPauseOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "pause-overlay";
  overlay.innerHTML = `
      <div class="pause-message">PAUSED</div>
  `;
  gameContainer.appendChild(overlay);
}
function hidePauseOverlay() {
  const overlay = document.querySelector(".pause-overlay");
  if (overlay) {
    overlay.remove();
  }
}
