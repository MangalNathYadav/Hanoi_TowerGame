/**
 * Tower of Hanoi - Core Game Logic
 * Contains the essential game mechanics and state management
 */

// Game state object to store all game-related data
const gameState = {
    currentLevel: 1,
    maxLevel: 8,
    minDisks: 3,
    maxDisks: 10,
    moves: 0,
    moveHistory: [],
    timerInterval: null,
    startTime: null,
    elapsedTime: 0,
    soundEnabled: true,
    darkTheme: true,
    selectedDisk: null,
    isDragging: false,
    isGameWon: false,
    playerName: 'Player',
    leaderboard: {},
    completedLevels: []
};

// DOM Elements - populated during initialization
const domElements = {
    // Will be populated during initialization
};

/**
 * Initialize the game
 */
function initGame() {
    console.log("Initializing Tower of Hanoi game...");

    // Get DOM references
    setupDOMReferences();

    // Load saved data
    loadSavedData();

    // Setup theme
    setupTheme();

    // Start loading sequence
    startLoadingSequence();
}

/**
 * Set up references to DOM elements
 */
function setupDOMReferences() {
    // Screens
    domElements.loadingScreen = document.getElementById('loadingScreen');
    domElements.homeScreen = document.getElementById('homeScreen');
    domElements.gameScreen = document.getElementById('gameScreen');

    // Loading screen
    domElements.loadingBar = document.getElementById('loadingBar');
    domElements.loadingProgress = document.getElementById('loadingProgress');

    // Home screen
    domElements.homePlayerName = document.getElementById('homePlayerName');
    domElements.playBtn = document.getElementById('playBtn');
    domElements.levelsBtn = document.getElementById('levelsBtn');
    domElements.homeLeaderboardBtn = document.getElementById('homeLeaderboardBtn');
    domElements.homeSoundToggleBtn = document.getElementById('homeSoundToggleBtn');
    domElements.changePlayerHomeBtn = document.getElementById('changePlayerHomeBtn');

    // Game screen
    domElements.backToHomeBtn = document.getElementById('backToHomeBtn');
    domElements.gameOptionsBtn = document.getElementById('gameOptionsBtn');
    domElements.playerNameDisplay = document.getElementById('playerNameDisplay');
    domElements.levelDisplay = document.getElementById('levelDisplay');
    domElements.moveCounter = document.getElementById('moveCounter');
    domElements.optimalMoves = document.getElementById('optimalMoves');
    domElements.timer = document.getElementById('timer');
    domElements.towerContainers = document.querySelectorAll('.tower-container');
    domElements.resetBtn = document.getElementById('resetBtn');
    domElements.undoBtn = document.getElementById('undoBtn');
    domElements.prevLevelBtn = document.getElementById('prevLevelBtn');
    domElements.nextLevelBtn = document.getElementById('nextLevelBtn');

    // Modals
    domElements.welcomeModal = document.getElementById('welcomeModal');
    domElements.playerNameInput = document.getElementById('playerNameInput');
    domElements.startGameBtn = document.getElementById('startGameBtn');

    domElements.winModal = document.getElementById('winModal');
    domElements.winLevel = document.getElementById('winLevel');
    domElements.winMoves = document.getElementById('winMoves');
    domElements.winTime = document.getElementById('winTime');
    domElements.winOptimal = document.getElementById('winOptimal');
    domElements.winEfficiency = document.getElementById('winEfficiency');
    domElements.nextLevelBtn2 = document.getElementById('nextLevelBtn2');
    domElements.stayBtn = document.getElementById('stayBtn');
    domElements.backToHomeBtn2 = document.getElementById('backToHomeBtn2');

    domElements.leaderboardModal = document.getElementById('leaderboardModal');
    domElements.leaderboardLevelSelect = document.getElementById('leaderboardLevelSelect');
    domElements.leaderboardBody = document.getElementById('leaderboardBody');
    domElements.closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    domElements.currentPlayerName = document.getElementById('currentPlayerName');

    domElements.levelSelectionModal = document.getElementById('levelSelectionModal');
    domElements.levelsGrid = document.getElementById('levelsGrid');
    domElements.closeLevelsBtn = document.getElementById('closeLevelsBtn');

    domElements.gameCompletionModal = document.getElementById('gameCompletionModal');
    domElements.completionPlayerName = document.getElementById('completionPlayerName');
    domElements.completionTableBody = document.getElementById('completionTableBody');
    domElements.playAgainBtn = document.getElementById('playAgainBtn');
    domElements.backToHomeBtn3 = document.getElementById('backToHomeBtn3');

    // Sound effects
    domElements.moveSound = document.getElementById('moveSound');
    domElements.selectSound = document.getElementById('selectSound');
    domElements.winSound = document.getElementById('winSound');
    domElements.gameCompleteSound = document.getElementById('gameCompleteSound');
}

/**
 * Load saved data from localStorage
 */
function loadSavedData() {
    // Load player name
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
        gameState.playerName = savedName;
    }

    // Load sound preference
    const soundEnabled = localStorage.getItem('soundEnabled');
    if (soundEnabled !== null) {
        gameState.soundEnabled = soundEnabled === 'true';
    }

    // Load theme preference
    const darkTheme = localStorage.getItem('darkTheme');
    if (darkTheme !== null) {
        gameState.darkTheme = darkTheme === 'true';
    }

    // Load completed levels
    const completedLevels = localStorage.getItem('completedLevels');
    if (completedLevels) {
        gameState.completedLevels = JSON.parse(completedLevels);
    }

    // Load leaderboard
    const leaderboard = localStorage.getItem('leaderboard');
    if (leaderboard) {
        gameState.leaderboard = JSON.parse(leaderboard);
    }

    console.log('Game data loaded successfully');
}

/**
 * Start the loading sequence animation
 */
function startLoadingSequence() {
    console.log('Starting loading sequence...');

    // Make sure loading screen is visible with flex display
    domElements.loadingScreen.style.display = 'flex';

    // Reset loading bar
    domElements.loadingBar.style.width = '0%';
    domElements.loadingProgress.textContent = '0%';

    // Animate loading progress
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 5;
        domElements.loadingBar.style.width = `${progress}%`;
        domElements.loadingProgress.textContent = `${progress}%`;

        if (progress >= 100) {
            clearInterval(loadingInterval);

            // Short delay before transitioning
            setTimeout(() => finishLoading(), 500);
        }
    }, 100);
}

/**
 * Finish loading and transition to next screen
 */
function finishLoading() {
    console.log('Loading complete, transitioning to next screen...');

    // Set up event listeners
    setupEventListeners();

    // Hide loading screen
    domElements.loadingScreen.style.display = 'none';

    // Show welcome modal or home screen
    if (!gameState.playerName || gameState.playerName === 'Player') {
        // First time player, show welcome modal
        domElements.welcomeModal.style.display = 'block';
    } else {
        // Returning player, show home screen
        updatePlayerNameDisplay();
        domElements.homeScreen.style.display = 'flex';
    }
}

/**
 * Update player name in all displays
 */
function updatePlayerNameDisplay() {
    if (domElements.homePlayerName) {
        domElements.homePlayerName.textContent = gameState.playerName;
    }

    if (domElements.playerNameDisplay) {
        domElements.playerNameDisplay.textContent = gameState.playerName;
    }

    if (domElements.currentPlayerName) {
        domElements.currentPlayerName.textContent = gameState.playerName;
    }

    if (domElements.completionPlayerName) {
        domElements.completionPlayerName.textContent = gameState.playerName;
    }
}

/**
 * Reset game state for a new level
 */
function resetGameState() {
    gameState.moves = 0;
    gameState.moveHistory = [];
    gameState.selectedDisk = null;
    gameState.isGameWon = false;

    // Reset timer
    stopTimer();
    gameState.elapsedTime = 0;
    updateTimerDisplay();
}

/**
 * Format time in seconds to MM:SS format
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
}

/**
 * Play a sound effect
 */
function playSound(sound) {
    if (gameState.soundEnabled && sound) {
        try {
            sound.currentTime = 0;
            sound.play().catch(err => console.log("Sound play error:", err));
        } catch (err) {
            console.log("Error playing sound:", err);
        }
    }
}

// Export functions for use in other modules
// (For actual implementation, these would be properly exported in a module system)