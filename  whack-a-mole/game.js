// Game State
let score = 0;
let timeRemaining = 30;
let gameActive = false;
let molePositions = new Set();
let gameTimer = null;
let spawnTimer = null;w
let currentDifficulty = 'medium';

// Difficulty Settings
const DIFFICULTY_SETTINGS = {
    easy: {
        moleDisplayTime: 2000,
        spawnInterval: 1500,
        maxMoles: 1,
        speedMultiplier: 0.7,
        label: '🟢 Easy',
        description: 'Slower moles, more time to react'
    },
    medium: {
        moleDisplayTime: 1500,
        spawnInterval: 1200,
        maxMoles: 2,
        speedMultiplier: 1.0,
        label: '🟡 Medium',
        description: 'Balanced gameplay'
    },
    hard: {
        moleDisplayTime: 1000,
        spawnInterval: 800,
        maxMoles: 3,
        speedMultiplier: 1.5,
        label: '🔴 Hard',
        description: 'Fast moles, quick reflexes needed!'
    }
};

// Game Configuration
const GAME_DURATION = 30; // seconds
const GRID_SIZE = 3;
const POINTS_PER_HIT = 10;

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');

// Initialize Game Board
function initializeBoard() {
    gameBoard.innerHTML = '';
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const hole = document.createElement('div');
            hole.className = 'hole empty';
            hole.dataset.row = row;
            hole.dataset.col = col;
            hole.addEventListener('click', () => whackMole(row, col));
            gameBoard.appendChild(hole);
        }
    }
}

// Start Game
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    score = 0;
    timeRemaining = GAME_DURATION;
    molePositions.clear();
    
    // Update UI
    updateScore();
    updateTimer();
    startButton.disabled = true;
    startButton.textContent = 'GAME IN PROGRESS...';
    
    // Reset all holes
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => {
        hole.className = 'hole empty';
    });
    
    // Start game loops
    spawnMoles();
    startTimer();
}

// Spawn Moles
function spawnMoles() {
    if (!gameActive) return;
    
    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    
    // Find empty holes
    const emptyHoles = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const key = `${row}-${col}`;
            if (!molePositions.has(key)) {
                emptyHoles.push({ row, col });
            }
        }
    }
    
    // Spawn moles based on difficulty
    if (emptyHoles.length > 0) {
        const numMoles = Math.min(
            Math.floor(Math.random() * settings.maxMoles) + 1,
            emptyHoles.length
        );
        
        for (let i = 0; i < numMoles; i++) {
            const randomIndex = Math.floor(Math.random() * emptyHoles.length);
            const { row, col } = emptyHoles.splice(randomIndex, 1)[0];
            showMole(row, col);
        }
    }
    
    // Schedule next spawn based on difficulty
    if (gameActive) {
        spawnTimer = setTimeout(spawnMoles, settings.spawnInterval);
    }
}

// Show Mole
function showMole(row, col) {
    const key = `${row}-${col}`;
    
    // Prevent duplicate moles
    if (molePositions.has(key)) return;
    
    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    
    molePositions.add(key);
    const hole = getHole(row, col);
    hole.className = 'hole mole';
    
    // Hide mole after display time based on difficulty
    setTimeout(() => hideMole(row, col), settings.moleDisplayTime);
}

// Hide Mole
function hideMole(row, col) {
    const key = `${row}-${col}`;
    
    if (molePositions.has(key)) {
        molePositions.delete(key);
        const hole = getHole(row, col);
        if (hole.classList.contains('mole')) {
            hole.className = 'hole empty';
        }
    }
}

// Whack Mole
function whackMole(row, col) {
    if (!gameActive) return;
    
    const key = `${row}-${col}`;
    const hole = getHole(row, col);
    
    if (molePositions.has(key)) {
        // Hit!
        molePositions.delete(key);
        score += POINTS_PER_HIT;
        updateScore();
        
        // Visual feedback
        hole.className = 'hole hit';
        
        // Play hit animation
        setTimeout(() => {
            if (gameActive) {
                hole.className = 'hole empty';
            }
        }, 300);
        
        // Add score popup effect
        showScorePopup(hole, `+${POINTS_PER_HIT}`);
    } else {
        // Miss
        hole.className = 'hole miss';
        setTimeout(() => {
            if (gameActive) {
                hole.className = 'hole empty';
            }
        }, 200);
    }
}

// Show Score Popup
function showScorePopup(hole, text) {
    const popup = document.createElement('div');
    popup.textContent = text;
    popup.style.cssText = `
        position: absolute;
        color: #FFD700;
        font-size: 2em;
        font-weight: bold;
        pointer-events: none;
        animation: scoreFloat 1s ease-out forwards;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    `;
    
    hole.style.position = 'relative';
    hole.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

// Add CSS animation for score popup
const style = document.createElement('style');
style.textContent = `
    @keyframes scoreFloat {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-50px) scale(1.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Timer
function startTimer() {
    gameTimer = setInterval(() => {
        timeRemaining--;
        updateTimer();
        
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

// Update Score Display
function updateScore() {
    scoreDisplay.textContent = score;
}

// Update Timer Display
function updateTimer() {
    timerDisplay.textContent = `${timeRemaining}s`;
    
    // Change color when time is running out
    if (timeRemaining <= 10) {
        timerDisplay.style.color = '#F44336';
    } else {
        timerDisplay.style.color = '#1976D2';
    }
}

// Get Hole Element
function getHole(row, col) {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

// End Game
function endGame() {
    gameActive = false;
    
    // Clear timers
    if (gameTimer) clearInterval(gameTimer);
    if (spawnTimer) clearTimeout(spawnTimer);
    
    // Reset button
    startButton.disabled = false;
    startButton.textContent = 'START GAME';
    
    // Clear all moles
    molePositions.clear();
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => {
        hole.className = 'hole empty';
    });
    
    // Show game over message
    showGameOver();
}

// Show Game Over Modal
function showGameOver() {
    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    const modal = document.createElement('div');
    modal.className = 'game-over-modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🎮 GAME OVER! 🎮</h2>
            <p>Difficulty: ${settings.label}</p>
            <div class="final-score">${score} POINTS</div>
            <p>${getScoreMessage()}</p>
            <button class="start-button" onclick="this.parentElement.parentElement.remove()">
                CLOSE
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close modal on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Get Score Message
function getScoreMessage() {
    if (score >= 200) return '🏆 AMAZING! You\'re a Mole Master!';
    if (score >= 150) return '🌟 Excellent! Great reflexes!';
    if (score >= 100) return '👍 Good job! Keep practicing!';
    if (score >= 50) return '😊 Not bad! Try again!';
    return '💪 Keep trying! You\'ll get better!';
}

// Difficulty Selection
function selectDifficulty(difficulty) {
    if (gameActive) return; // Can't change during game
    
    currentDifficulty = difficulty;
    
    // Update button states
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === difficulty) {
            btn.classList.add('active');
        }
    });
}

// Event Listeners
startButton.addEventListener('click', startGame);

// Difficulty button listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectDifficulty(btn.dataset.difficulty);
        });
    });
});

// Initialize on load
window.addEventListener('load', () => {
    initializeBoard();
});

// Keyboard shortcut to start game
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        if (!gameActive) {
            startGame();
        }
    }
});
