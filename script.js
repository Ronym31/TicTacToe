// Game elements
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const resetStatsBtn = document.getElementById("resetStats");
const startBtn = document.getElementById("startGame");

const boardDiv = document.getElementById("board");
const inputsDiv = document.getElementById("playerInputs");
const gameControlsDiv = document.getElementById("gameControls");
const scoreboardDiv = document.getElementById("scoreboard");
const statsSection = document.getElementById("statsSection");
const difficultySection = document.getElementById("difficultySection");

const pvpCard = document.getElementById("pvpCard");
const aiCard = document.getElementById("aiCard");
const playerOInput = document.getElementById("playerO");
const playerORow = document.getElementById("playerORow");
const difficultySelect = document.getElementById("difficulty");

// Score elements
const playerXScoreEl = document.getElementById("playerXScore");
const playerOScoreEl = document.getElementById("playerOScore");
const drawScoreEl = document.getElementById("drawScore");
const playerXLabelEl = document.getElementById("playerXLabel");
const playerOLabelEl = document.getElementById("playerOLabel");

// Stats elements
const totalGamesEl = document.getElementById("totalGames");
const winRateEl = document.getElementById("winRate");
const fastestWinEl = document.getElementById("fastestWin");
const avgTimeEl = document.getElementById("avgTime");

// Game state
let playerXName = "Player X";
let playerOName = "Player O";
let vsAI = false;
let difficulty = "medium";
let currentPlayer = "X";
let gameActive = true;
let board = ["","","","","","","","",""];
let gameStartTime = null;
let moveCount = 0;

// Game statistics (stored in localStorage)
let gameStats = {
  totalGames: 0,
  playerXWins: 0,
  playerOWins: 0,
  draws: 0,
  fastestWin: null,
  gameTimes: [],
  ...JSON.parse(localStorage.getItem('ticTacToeStats') || '{}')
};

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Sound effects (using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration = 100, type = 'sine') {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Initialize game
function initGame() {
  loadStats();
  updateScoreboard();
  updateStatsDisplay();
  
  // Add keyboard navigation
  document.addEventListener('keydown', handleKeydown);
}

// Mode selection
pvpCard.onclick = () => {
  vsAI = false;
  pvpCard.classList.add("active");
  aiCard.classList.remove("active");
  playerORow.style.display = "block";
  playerOInput.placeholder = "Player O Name";
  difficultySection.style.display = "none";
  playSound(800, 50);
};

aiCard.onclick = () => {
  vsAI = true;
  aiCard.classList.add("active");
  pvpCard.classList.remove("active");
  playerORow.style.display = "none";
  difficultySection.style.display = "block";
  playSound(800, 50);
};

// Difficulty selection
difficultySelect.onchange = () => {
  difficulty = difficultySelect.value;
  playSound(600, 50);
};

// Start game
startBtn.onclick = () => {
  playerXName = document.getElementById("playerX").value || "Player X";
  
  if (vsAI) {
    playerOName = `AI (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}) 🤖`;
  } else {
    playerOName = document.getElementById("playerO").value || "Player O";
  }
  
  // Update labels in scoreboard
  playerXLabelEl.textContent = playerXName;
  playerOLabelEl.textContent = playerOName;
  
  // Show game elements
  inputsDiv.style.display = "none";
  boardDiv.style.display = "grid";
  statusText.style.display = "block";
  gameControlsDiv.style.display = "flex";
  scoreboardDiv.style.display = "flex";
  statsSection.style.display = "block";
  
  startNewRound();
  playSound(1000, 150);
};

// Start new round
function startNewRound() {
  board = ["","","","","","","","",""];
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("winning-cell", "move-animation");
    cell.disabled = false;
  });
  
  currentPlayer = "X";
  gameActive = true;
  gameStartTime = Date.now();
  moveCount = 0;
  
  updateTurnText();
}

// Cell click handlers
cells.forEach((cell, index) => {
  cell.onclick = () => handleCellClick(index);
  cell.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCellClick(index);
    }
  };
});

function handleCellClick(index) {
  if (board[index] !== "" || !gameActive) return;
  
  makeMove(index);
  
  if (vsAI && gameActive && currentPlayer === "O") {
    // Disable all cells during AI turn
    cells.forEach(cell => cell.disabled = true);
    setTimeout(() => {
      aiMove();
      cells.forEach(cell => cell.disabled = false);
    }, 300 + Math.random() * 500); // Variable delay for realism
  }
}

function makeMove(index) {
  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  cells[index].classList.add("move-animation");
  moveCount++;
  
  // Play move sound
  playSound(currentPlayer === "X" ? 440 : 523, 100);
  
  const winner = checkWinner();
  if (winner) {
    handleWin(winner.player, winner.pattern);
    return;
  }
  
  if (!board.includes("")) {
    handleDraw();
    return;
  }
  
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnText();
}

// Enhanced AI with different difficulty levels
function aiMove() {
  let move;
  
  switch (difficulty) {
    case 'easy':
      move = getRandomMove();
      break;
    case 'medium':
      move = getMediumMove();
      break;
    case 'hard':
      move = getOptimalMove();
      break;
    default:
      move = getRandomMove();
  }
  
  if (move !== -1) {
    makeMove(move);
  }
}

function getRandomMove() {
  const emptyIndexes = board
    .map((v, i) => v === "" ? i : null)
    .filter(v => v !== null);
  
  return emptyIndexes.length > 0 
    ? emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)]
    : -1;
}

function getMediumMove() {
  // 70% optimal, 30% random
  return Math.random() < 0.7 ? getOptimalMove() : getRandomMove();
}

function getOptimalMove() {
  // Check for winning move
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      if (checkWinner() && checkWinner().player === "O") {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  
  // Check for blocking move
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "X";
      if (checkWinner() && checkWinner().player === "X") {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  
  // Strategic positions: center, corners, edges
  const priorities = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (let pos of priorities) {
    if (board[pos] === "") return pos;
  }
  
  return getRandomMove();
}

function handleWin(player, pattern) {
  const winner = player === "X" ? playerXName : playerOName;
  const gameTime = Date.now() - gameStartTime;
  
  // Highlight winning cells
  pattern.forEach(index => {
    cells[index].classList.add("winning-cell");
  });
  
  statusText.textContent = `🎉 ${winner} Wins!`;
  gameActive = false;
  
  // Play win sound
  playSound(659, 200);
  setTimeout(() => playSound(784, 200), 200);
  setTimeout(() => playSound(880, 300), 400);
  
  // Update stats
  gameStats.totalGames++;
  if (player === "X") {
    gameStats.playerXWins++;
  } else {
    gameStats.playerOWins++;
  }
  
  if (!gameStats.fastestWin || moveCount < gameStats.fastestWin) {
    gameStats.fastestWin = moveCount;
  }
  
  gameStats.gameTimes.push(gameTime);
  
  saveStats();
  updateScoreboard();
  updateStatsDisplay();
}

function handleDraw() {
  statusText.textContent = "🤝 Draw!";
  gameActive = false;
  
  // Play draw sound
  playSound(392, 300);
  
  // Update stats
  gameStats.totalGames++;
  gameStats.draws++;
  gameStats.gameTimes.push(Date.now() - gameStartTime);
  
  saveStats();
  updateScoreboard();
  updateStatsDisplay();
}

function updateTurnText() {
  const name = currentPlayer === "X" ? playerXName : playerOName;
  statusText.textContent = `${name}'s Turn`;
}

function checkWinner() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], pattern };
    }
  }
  return null;
}

function updateScoreboard() {
  playerXScoreEl.textContent = gameStats.playerXWins;
  playerOScoreEl.textContent = gameStats.playerOWins;
  drawScoreEl.textContent = gameStats.draws;
}

function updateStatsDisplay() {
  totalGamesEl.textContent = gameStats.totalGames;
  
  if (gameStats.totalGames > 0) {
    const winRate = ((gameStats.playerXWins / gameStats.totalGames) * 100).toFixed(1);
    winRateEl.textContent = `${winRate}%`;
    
    fastestWinEl.textContent = gameStats.fastestWin ? `${gameStats.fastestWin} moves` : '--';
    
    if (gameStats.gameTimes.length > 0) {
      const avgTime = gameStats.gameTimes.reduce((a, b) => a + b, 0) / gameStats.gameTimes.length;
      avgTimeEl.textContent = `${Math.round(avgTime / 1000)}s`;
    }
  } else {
    winRateEl.textContent = '0%';
    fastestWinEl.textContent = '--';
    avgTimeEl.textContent = '--';
  }
}

function saveStats() {
  localStorage.setItem('ticTacToeStats', JSON.stringify(gameStats));
}

function loadStats() {
  const saved = localStorage.getItem('ticTacToeStats');
  if (saved) {
    gameStats = { ...gameStats, ...JSON.parse(saved) };
  }
}

// Keyboard navigation
function handleKeydown(e) {
  if (!gameActive || !boardDiv.style.display || boardDiv.style.display === 'none') return;
  
  const focusedIndex = Array.from(cells).findIndex(cell => cell === document.activeElement);
  let newIndex = focusedIndex;
  
  switch (e.key) {
    case 'ArrowRight':
      newIndex = focusedIndex === -1 ? 0 : Math.min(focusedIndex + 1, 8);
      break;
    case 'ArrowLeft':
      newIndex = focusedIndex === -1 ? 0 : Math.max(focusedIndex - 1, 0);
      break;
    case 'ArrowDown':
      newIndex = focusedIndex === -1 ? 0 : Math.min(focusedIndex + 3, 8);
      break;
    case 'ArrowUp':
      newIndex = focusedIndex === -1 ? 0 : Math.max(focusedIndex - 3, 0);
      break;
    default:
      return;
  }
  
  e.preventDefault();
  cells[newIndex].focus();
}

// Event listeners
restartBtn.onclick = () => {
  startNewRound();
  playSound(800, 100);
};

resetStatsBtn.onclick = () => {
  if (confirm('Are you sure you want to reset all statistics?')) {
    gameStats = {
      totalGames: 0,
      playerXWins: 0,
      playerOWins: 0,
      draws: 0,
      fastestWin: null,
      gameTimes: []
    };
    saveStats();
    updateScoreboard();
    updateStatsDisplay();
    playSound(400, 200);
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initGame);
