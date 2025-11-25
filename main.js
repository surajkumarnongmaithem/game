const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");
const scoreLabel = document.getElementById("score");
const bestScoreLabel = document.getElementById("best-score");
const overlay = document.getElementById("game-overlay");
const overlayMessage = document.getElementById("overlay-message");

const CELL_SIZE = 24;
const BOARD_SIZE = canvas.width / CELL_SIZE;
const STEP_MS = 140;

const COLORS = {
  snake: "#22d3ee",
  head: "#34d399",
  apple: "#f97316",
  board: "#0b1220",
  grid: "#111827",
};

let lastUpdate = 0;
let rafId;
let score = 0;
let bestScore = Number(localStorage.getItem("snake-best") || "0");
let direction = "RIGHT";
let nextDirection = direction;
let snake = [];
let apple = null;
let running = false;
let gameOver = false;

function resetGame() {
  direction = "RIGHT";
  nextDirection = direction;
  score = 0;
  scoreLabel.textContent = score;
  snake = [
    { x: 6, y: 10 },
    { x: 5, y: 10 },
    { x: 4, y: 10 },
  ];
  spawnApple();
  gameOver = false;
  hideOverlay();
}

function spawnApple() {
  const openCells = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        openCells.push({ x, y });
      }
    }
  }

  apple = openCells[Math.floor(Math.random() * openCells.length)];
}

function drawBoard() {
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i < BOARD_SIZE; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvas.width, i * CELL_SIZE);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? COLORS.head : COLORS.snake;
    ctx.fillRect(
      segment.x * CELL_SIZE + 1,
      segment.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2,
    );
  });
}

function drawApple() {
  if (!apple) return;
  ctx.fillStyle = COLORS.apple;
  ctx.beginPath();
  ctx.arc(
    apple.x * CELL_SIZE + CELL_SIZE / 2,
    apple.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function tick(timestamp) {
  rafId = requestAnimationFrame(tick);
  if (!running) return;
  if (timestamp - lastUpdate < STEP_MS) return;
  lastUpdate = timestamp;

  direction = getValidDirection(nextDirection);
  const head = { ...snake[0] };
  moveHead(head, direction);

  if (isCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (apple && head.x === apple.x && head.y === apple.y) {
    score += 10;
    scoreLabel.textContent = score;
    bestScore = Math.max(bestScore, score);
    bestScoreLabel.textContent = bestScore;
    localStorage.setItem("snake-best", String(bestScore));
    spawnApple();
  } else {
    snake.pop();
  }

  draw();
}

function moveHead(head, dir) {
  if (dir === "UP") head.y -= 1;
  if (dir === "DOWN") head.y += 1;
  if (dir === "LEFT") head.x -= 1;
  if (dir === "RIGHT") head.x += 1;
}

function isCollision(head) {
  const hitsWall =
    head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE;
  if (hitsWall) return true;
  return snake.some((segment) => segment.x === head.x && segment.y === head.y);
}

function draw() {
  drawBoard();
  drawSnake();
  drawApple();
}

function startGame() {
  if (running) return;
  if (gameOver) resetGame();
  hideOverlay();
  running = true;
  lastUpdate = 0;
  draw();
}

function pauseGame() {
  running = false;
}

function endGame() {
  running = false;
  gameOver = true;
  overlayMessage.textContent = `Game over! Score: ${score}`;
  overlay.hidden = false;
}

function hideOverlay() {
  overlay.hidden = true;
  overlayMessage.textContent = "";
}

function getValidDirection(next) {
  if (snake.length < 2) return next;
  const [head, neck] = snake;
  if (next === "UP" && head.y - 1 === neck.y) return direction;
  if (next === "DOWN" && head.y + 1 === neck.y) return direction;
  if (next === "LEFT" && head.x - 1 === neck.x) return direction;
  if (next === "RIGHT" && head.x + 1 === neck.x) return direction;
  return next;
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") nextDirection = "UP";
  if (key === "arrowdown" || key === "s") nextDirection = "DOWN";
  if (key === "arrowleft" || key === "a") nextDirection = "LEFT";
  if (key === "arrowright" || key === "d") nextDirection = "RIGHT";
  if (key === " ") {
    running ? pauseGame() : startGame();
  }
}

function bindEvents() {
  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", pauseGame);
  restartButton.addEventListener("click", () => {
    resetGame();
    startGame();
  });
  window.addEventListener("keydown", handleKeydown);
}

function init() {
  bestScoreLabel.textContent = bestScore;
  resetGame();
  draw();
  bindEvents();
  rafId = requestAnimationFrame(tick);
}

window.addEventListener("load", init);
window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
