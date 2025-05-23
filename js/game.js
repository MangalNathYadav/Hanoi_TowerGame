/**
 * Tower of Hanoi Game
 * 
 * A modular implementation of the classic Tower of Hanoi puzzle game
 * with multiple difficulty levels, drag-and-drop functionality, and
 * local storage for player progress.
 */

// =======================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =======================================================================

// Game state variables
let currentLevel = 1;
let moveCount = 0;
let gameTimer = null;
let seconds = 0;
let selectedDisk = null;
let moveHistory = [];
let gameStarted = false;
let soundEnabled = true;
let disksPerLevel = [3, 4, 5, 6, 7, 8]; // Number of disks for each level
let playerName = "Player";
let darkTheme = true; // Default theme is dark
let playerLevelsCompleted = [];
let towers = [
    [],
    [],
    []
]; // Tower data structure: arrays of disk sizes

// Constants
const MIN_DISK_WIDTH = 50; // Minimum width for the smallest disk
const DISK_HEIGHT = 22; // Height of each disk
const OPTIMAL_MOVES = disksPerLevel.map(disks => Math.pow(2, disks) - 1); // Calculate optimal moves for each level
const SAVE_KEY_PREFIX = 'tower_of_hanoi_save_'; // localStorage key prefix for player-specific game data
const THEME_KEY = 'tower_of_hanoi_theme'; // localStorage key for theme preference
const PLAYERS_KEY = 'tower_of_hanoi_players'; // localStorage key to store list of players

// DOM element references
const loadingScreen = document.getElementById('loadingScreen');
const loadingBar = document.getElementById('loadingBar');
const loadingProgress = document.getElementById('loadingProgress');
const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const playerNameDisplay = document.getElementById('playerNameDisplay');
const homePlayerName = document.getElementById('homePlayerName');
const levelDisplay = document.getElementById('levelDisplay');
const moveCounter = document.getElementById('moveCounter');
const optimalMoves = document.getElementById('optimalMoves');
const timer = document.getElementById('timer');
const towerContainers = document.querySelectorAll('.tower-container');
const disksStacks = document.querySelectorAll('.disks-stack');
const welcomeModal = document.getElementById('welcomeModal');
const playerNameInput = document.getElementById('playerNameInput');
const leaderboardModal = document.getElementById('leaderboardModal');
const leaderboardBody = document.getElementById('leaderboardBody');
const currentPlayerName = document.getElementById('currentPlayerName');
const leaderboardLevelSelect = document.getElementById('leaderboardLevelSelect');
const winModal = document.getElementById('winModal');
const winLevel = document.getElementById('winLevel');
const winMoves = document.getElementById('winMoves');
const winTime = document.getElementById('winTime');
const winOptimal = document.getElementById('winOptimal');
const winEfficiency = document.getElementById('winEfficiency');
const levelSelectionModal = document.getElementById('levelSelectionModal');
const levelsGrid = document.getElementById('levelsGrid');
const gameCompletionModal = document.getElementById('gameCompletionModal');
const completionPlayerName = document.getElementById('completionPlayerName');
const completionTableBody = document.getElementById('completionTableBody');
const aboutModal = document.getElementById('aboutModal');

// Audio elements
const moveSound = document.getElementById('moveSound');
const selectSound = document.getElementById('selectSound');
const winSound = document.getElementById('winSound');
const gameCompleteSound = document.getElementById('gameCompleteSound');

// =======================================================================
// INITIALIZATION AND SETUP
// =======================================================================

/**
 * Initialize the game when the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Simulate loading (progress from 0 to 100%)
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);

            // Done loading, check saved data and show appropriate screen
            checkSavedData();
            setTimeout(() => {
                loadingScreen.style.display = 'none';

                // Show welcome modal for new players, or home screen for returning players
                if (!localStorage.getItem(SAVE_KEY_PREFIX + playerName.toLowerCase().replace(/\s+/g, '_'))) {
                    welcomeModal.style.display = 'block';
                } else {
                    homeScreen.style.display = 'flex';
                }

                // Add "Coming Soon" labels
                addComingSoonLabels();
            }, 500);
        }

        // Update loading bar visual
        loadingBar.style.width = `${progress}%`;
        loadingProgress.textContent = `${Math.floor(progress)}%`;
    }, 200);

    // Set up event listeners
    setupEventListeners();

    // Apply saved theme if available
    loadThemePreference();
});

/**
 * Check localStorage for saved game data and load it
 */
function checkSavedData() {
    // Check for legacy data format (pre-username specific)
    const legacyData = localStorage.getItem('tower_of_hanoi_save');
    if (legacyData) {
        try {
            // Migrate legacy data to new format
            console.log("Found legacy data, migrating to player-specific format");
            const data = JSON.parse(legacyData);
            playerName = data.playerName || "Player";
            currentLevel = data.currentLevel || 1;
            playerLevelsCompleted = data.levelsCompleted || [];
            soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;

            // Save to new format
            saveGameState();

            // Remove legacy data
            localStorage.removeItem('tower_of_hanoi_save');
            console.log("Legacy data migration complete");

            // Update displays
            playerNameDisplay.textContent = playerName;
            homePlayerName.textContent = playerName;
            currentPlayerName.textContent = playerName;
            return;
        } catch (e) {
            console.error('Error migrating legacy data:', e);
        }
    }

    // Get player-specific save key
    const playerSaveKey = SAVE_KEY_PREFIX + playerName.toLowerCase().replace(/\s+/g, '_');
    const savedData = localStorage.getItem(playerSaveKey);

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            // Load player data
            playerName = data.playerName || "Player";
            currentLevel = data.currentLevel || 1;
            playerLevelsCompleted = data.levelsCompleted || [];
            soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;

            // Update player name displays
            playerNameDisplay.textContent = playerName;
            homePlayerName.textContent = playerName;
            currentPlayerName.textContent = playerName;

            // Update sound button text based on current setting
            document.getElementById('homeSoundToggleBtn').textContent =
                soundEnabled ? '🔊 Sound' : '🔇 Sound';

            console.log(`Loaded progress for player: ${playerName}`);
        } catch (e) {
            console.error('Error loading saved data:', e);
            // Reset to defaults if data is corrupted
            playerName = "Player";
            currentLevel = 1;
            playerLevelsCompleted = [];
            soundEnabled = true;
        }
    } else {
        // Initialize new player
        playerName = "Player";
        currentLevel = 1;
        playerLevelsCompleted = [];
        soundEnabled = true;
        console.log("No saved data found, using defaults");
    }
}

/**
 * Load the user's theme preference from localStorage
 */
function loadThemePreference() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        darkTheme = savedTheme === 'dark';
    } else {
        // Default to dark theme or check user's system preference
        darkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Apply the theme
    document.body.classList.toggle('light-theme', !darkTheme);
}

/**
 * Save the current game state to localStorage
 */
function saveGameState() {
    const gameData = {
        playerName: playerName,
        currentLevel: currentLevel,
        levelsCompleted: playerLevelsCompleted,
        soundEnabled: soundEnabled
    };

    // Save to player-specific key
    const playerSaveKey = SAVE_KEY_PREFIX + playerName.toLowerCase().replace(/\s+/g, '_');
    localStorage.setItem(playerSaveKey, JSON.stringify(gameData));

    // Update player list
    updatePlayersList(playerName);
    console.log(`Saved progress for player: ${playerName}`);
}

/**
 * Update the list of players in localStorage
 */
function updatePlayersList(playerName) {
    // Get existing players list or initialize
    let players = JSON.parse(localStorage.getItem(PLAYERS_KEY) || '[]');

    // Add player if not already in list
    if (!players.includes(playerName)) {
        players.push(playerName);
        localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
        console.log(`Added ${playerName} to players list`);
    }
}

// =======================================================================
// EVENT LISTENERS
// =======================================================================

/**
 * Set up all event listeners for the game
 */
function setupEventListeners() {
    // Start game button in welcome modal
    document.getElementById('startGameBtn').addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (name) {
            playerName = name;
            // Try to load existing progress for this player
            loadPlayerProgress(playerName);

            // Update displays
            playerNameDisplay.textContent = playerName;
            homePlayerName.textContent = playerName;
            currentPlayerName.textContent = playerName;

            welcomeModal.style.display = 'none';
            homeScreen.style.display = 'flex';
            saveGameState();
        } else {
            playerNameInput.classList.add('invalid');
            setTimeout(() => playerNameInput.classList.remove('invalid'), 500);
        }
    });

    // Home screen buttons
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('levelsBtn').addEventListener('click', showLevelSelection);
    document.getElementById('homeLeaderboardBtn').addEventListener('click', showLeaderboard);
    document.getElementById('homeSoundToggleBtn').addEventListener('click', toggleSound);
    document.getElementById('changePlayerHomeBtn').addEventListener('click', changePlayer);
    document.getElementById('aboutBtn').addEventListener('click', () => {
        aboutModal.style.display = 'block';
    });

    // Game screen buttons
    document.getElementById('backToHomeBtn').addEventListener('click', backToHome);
    document.getElementById('gameOptionsBtn').addEventListener('click', () => {
        // Create settings panel if it doesn't exist
        let settingsPanel = document.getElementById('settingsPanel');

        if (!settingsPanel) {
            settingsPanel = document.createElement('div');
            settingsPanel.id = 'settingsPanel';
            settingsPanel.className = 'settings-panel';
            settingsPanel.style.position = 'absolute';
            settingsPanel.style.right = '10px';
            settingsPanel.style.top = '50px';
            settingsPanel.style.backgroundColor = 'var(--bg-elevated)';
            settingsPanel.style.border = '1px solid var(--surface-variant)';
            settingsPanel.style.borderRadius = '8px';
            settingsPanel.style.padding = '15px';
            settingsPanel.style.zIndex = '50';
            settingsPanel.style.boxShadow = 'var(--shadow-lg)';

            // Add settings options
            settingsPanel.innerHTML = `
                <h3 style="margin-top: 0; color: var(--highlight);">Settings</h3>
                <div style="margin-bottom: 10px;">
                    <label>
                        <input type="checkbox" id="themeToggle" ${!darkTheme ? 'checked' : ''}>
                        Light Theme
                    </label>
                </div>
                <div style="margin-bottom: 10px;">
                    <label>
                        <input type="checkbox" id="soundToggle" ${soundEnabled ? 'checked' : ''}>
                        Sound Effects
                    </label>
                </div>
                <button id="closeSettingsBtn" style="width: 100%; margin-top: 10px;">Close</button>
            `;

            document.body.appendChild(settingsPanel);

            // Add event listeners for settings controls
            document.getElementById('themeToggle').addEventListener('change', (e) => {
                darkTheme = !e.target.checked;
                document.body.classList.toggle('light-theme', !darkTheme);
                localStorage.setItem(THEME_KEY, darkTheme ? 'dark' : 'light');
            });

            document.getElementById('soundToggle').addEventListener('change', (e) => {
                soundEnabled = e.target.checked;
                saveGameState();
            });

            document.getElementById('closeSettingsBtn').addEventListener('click', () => {
                settingsPanel.style.display = 'none';
            });
        } else {
            // Update existing panel state
            document.getElementById('themeToggle').checked = !darkTheme;
            document.getElementById('soundToggle').checked = soundEnabled;
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        }
    });
    document.getElementById('resetBtn').addEventListener('click', resetLevel);
    document.getElementById('undoBtn').addEventListener('click', undoMove);
    document.getElementById('prevLevelBtn').addEventListener('click', () => changeLevel(currentLevel - 1));
    document.getElementById('nextLevelBtn').addEventListener('click', () => changeLevel(currentLevel + 1));

    // Win modal buttons
    document.getElementById('nextLevelBtn2').addEventListener('click', () => {
        winModal.style.display = 'none';
        changeLevel(currentLevel + 1);
    });
    document.getElementById('stayBtn').addEventListener('click', () => {
        winModal.style.display = 'none';
    });
    document.getElementById('backToHomeBtn2').addEventListener('click', () => {
        winModal.style.display = 'none';
        backToHome();
    });

    // Level selection
    document.getElementById('closeLevelsBtn').addEventListener('click', () => {
        levelSelectionModal.style.display = 'none';
    });

    // Leaderboard
    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
        leaderboardModal.style.display = 'none';
    });
    leaderboardLevelSelect.addEventListener('change', updateLeaderboard);

    // Game completion
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        gameCompletionModal.style.display = 'none';
        currentLevel = 1;
        saveGameState();
        initLevel();
    });
    document.getElementById('backToHomeBtn3').addEventListener('click', () => {
        gameCompletionModal.style.display = 'none';
        backToHome();
    });

    // About modal
    document.getElementById('closeAboutBtn').addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });

    // Tower containers - for disk movement
    towerContainers.forEach(container => {
        // Drag & drop events
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);

        // Click events for mobile/alternative interaction
        container.addEventListener('click', handleTowerClick);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);

    // Mobile touch support
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Add drag events to all disks
    document.querySelectorAll('.disk').forEach(disk => {
        disk.addEventListener('dragstart', handleDragStart);
        disk.addEventListener('dragend', handleDragEnd);
        disk.addEventListener('click', handleDiskClick);
    });
}

// Global variables for touch handling
let touchStartX = 0;
let touchStartY = 0;
let touchedDisk = null;
let touchedTower = null;
let sourceTowerIndex = null;

/**
 * Handle touch start on disks
 */
function handleTouchStart(e) {
    // Find what element was touched
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    // Only process if we touched a disk
    if (element && element.classList.contains('disk')) {
        // Store this disk and prevent default scrolling
        e.preventDefault();

        const disk = element;
        const tower = disk.closest('.tower-container');
        const towerIndex = parseInt(tower.dataset.tower) - 1;
        const stack = disksStacks[towerIndex];

        // Only select if it's the top disk
        if (disk === stack.lastChild) {
            // Store touch information
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchedDisk = disk;
            touchedTower = tower;
            sourceTowerIndex = towerIndex;

            // Add visual selection
            disk.classList.add('selected');

            // Highlight valid towers
            highlightValidTargets(parseInt(disk.dataset.size));

            // Play selection sound
            playSound(selectSound);
        }
    }
}

/**
 * Handle touch movement for dragging disks
 */
function handleTouchMove(e) {
    if (!touchedDisk) return;

    // Always prevent default to avoid scrolling while dragging
    e.preventDefault();

    const touch = e.touches[0];

    // Calculate distance moved from touch start
    const moveX = touch.clientX - touchStartX;
    const moveY = touch.clientY - touchStartY;

    // Add visual indicator of dragging if moved enough
    const threshold = 10; // pixels
    if (Math.abs(moveX) > threshold || Math.abs(moveY) > threshold) {
        touchedDisk.classList.add('dragging');

        // Apply visual transform to make disk follow finger
        touchedDisk.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    }
}

/**
 * Handle touch end to place disks
 */
function handleTouchEnd(e) {
    if (!touchedDisk) return;

    // Reset transforms immediately
    touchedDisk.style.transform = '';

    // Find where the touch ended
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetTower = element ? element.closest('.tower-container') : null;

    if (targetTower) {
        // Get target tower index
        const targetTowerIndex = parseInt(targetTower.dataset.tower) - 1;

        // Try to move disk
        if (targetTowerIndex !== sourceTowerIndex &&
            isValidMove(parseInt(touchedDisk.dataset.size), targetTowerIndex)) {
            moveDisk(sourceTowerIndex, targetTowerIndex);
        }
    }

    // Clean up selection
    touchedDisk.classList.remove('selected', 'dragging');
    touchedDisk = null;
    touchedTower = null;

    // Remove highlights
    towerContainers.forEach(tower => {
        tower.classList.remove('highlight', 'invalid');
    });
}

/**
 * Highlight valid target towers
 */
function highlightValidTargets(diskSize) {
    for (let i = 0; i < towerContainers.length; i++) {
        if (i !== sourceTowerIndex && isValidMove(diskSize, i)) {
            towerContainers[i].classList.add('highlight');
        }
    }
}

// =======================================================================
// GAME LOGIC
// =======================================================================

/**
 * Start the game - initialize level and show game screen
 */
function startGame() {
    homeScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    initLevel();
}

/**
 * Initialize the current level
 */
function initLevel() {
    // Reset game state
    moveCount = 0;
    sourceTowerIndex = null;
    selectedDisk = null;
    touchedDisk = null;
    touchedTower = null;
    moveHistory = [];
    gameStarted = false;
    clearInterval(gameTimer);

    // Reset timer display
    timer.textContent = '00:00';
    seconds = 0;

    // Clear all towers
    disksStacks.forEach((stack, index) => {
        stack.innerHTML = '';
        towers[index] = [];
    });

    // Update level display
    levelDisplay.textContent = currentLevel;
    optimalMoves.textContent = OPTIMAL_MOVES[currentLevel - 1];

    // Disable undo button at the start
    const undoBtn = document.getElementById('undoBtn');
    undoBtn.disabled = true;

    // Create disks for the current level
    const numDisks = disksPerLevel[currentLevel - 1];

    for (let i = numDisks; i >= 1; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.dataset.size = i;

        // Set disk width based on size (relative to container)
        const minWidth = 45; // Percentage
        const maxWidth = 85; // Percentage
        const widthRange = maxWidth - minWidth;
        const widthStep = widthRange / (numDisks - 1 || 1);
        const width = minWidth + (i - 1) * widthStep;
        disk.style.width = `${width}%`;

        // Set disk color - more distinct colors for better visibility
        const hue = (i * 30) % 360;
        disk.style.background = `linear-gradient(90deg, hsl(${hue}, 80%, 45%), hsl(${hue}, 80%, 65%))`;

        // Make larger numbers more readable with outlined text
        if (i > 9) {
            disk.style.textShadow = '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000';
        }

        // Add disk number
        disk.textContent = i;

        // Set draggable attribute
        disk.draggable = true;

        // Explicitly make it accessible for touch events
        disk.style.touchAction = 'none';

        // Add to the first tower
        disksStacks[0].appendChild(disk);
        towers[0].push(parseInt(i));

        // Add drag event listeners
        disk.addEventListener('dragstart', handleDragStart);
        disk.addEventListener('dragend', handleDragEnd);
        disk.addEventListener('click', handleDiskClick);
    }

    // Set next level button state based on completion status
    document.getElementById('nextLevelBtn').disabled = !playerLevelsCompleted.includes(currentLevel) && currentLevel < disksPerLevel.length;

    // Set previous level button state
    document.getElementById('prevLevelBtn').disabled = currentLevel <= 1;

    // Reset any win animations from previous games
    towerContainers.forEach(tower => {
        tower.classList.remove('win-tower', 'highlight', 'invalid');
    });
}

/**
 * Start the game timer
 */
function startTimer() {
    if (!gameStarted) {
        gameStarted = true;
        gameTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timer.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
}

/**
 * Handle disk click for selection
 */
function handleDiskClick(e) {
    e.stopPropagation();

    // Only allow selecting top disks
    const diskStack = e.target.parentElement;
    if (diskStack.lastChild !== e.target) return;

    // Toggle selection
    if (selectedDisk === e.target) {
        selectedDisk.classList.remove('selected');
        selectedDisk = null;
    } else {
        if (selectedDisk) {
            selectedDisk.classList.remove('selected');
        }
        selectedDisk = e.target;
        selectedDisk.classList.add('selected');
        playSound(selectSound);
    }
}

/**
 * Handle tower click for selecting/placing disks
 */
function handleTowerClick(e) {
    const towerIndex = parseInt(e.currentTarget.dataset.tower) - 1;

    // If no disk is selected, try to select the top disk from this tower
    if (!selectedDisk) {
        if (towers[towerIndex].length === 0) return; // Empty tower

        // Find the top disk in this tower
        const topDiskElement = disksStacks[towerIndex].lastChild;
        if (topDiskElement) {
            // Select the disk
            selectedDisk = topDiskElement;
            selectedDisk.classList.add('selected');
            playSound(selectSound);
        }
    } else {
        // A disk is already selected, try to place it on this tower
        const selectedSize = parseInt(selectedDisk.dataset.size);
        const currentTowerIndex = Array.from(towerContainers).findIndex(tower =>
            tower.querySelector('.disks-stack').contains(selectedDisk));

        // Check if move is valid
        if (towerIndex !== currentTowerIndex && isValidMove(selectedSize, towerIndex)) {
            // Move is valid, perform it
            moveDisk(currentTowerIndex, towerIndex);
        } else {
            // Invalid move, shake the tower
            towerContainers[towerIndex].classList.add('invalid');
            setTimeout(() => {
                towerContainers[towerIndex].classList.remove('invalid');
            }, 400);
            selectedDisk.classList.remove('selected');
            selectedDisk = null;
        }
    }
}

/**
 * Handle the drag start event
 */
function handleDragStart(e) {
    const disk = e.target;
    // Only allow dragging the top disk of a tower
    const diskStack = disk.parentElement;
    if (!disk.classList.contains('disk') || diskStack.lastChild !== disk) {
        e.preventDefault();
        return false;
    }

    // Start the timer when the first move is attempted
    startTimer();

    // Set drag data and effects
    e.dataTransfer.setData('text/plain', disk.dataset.size);
    e.dataTransfer.effectAllowed = 'move';

    // Add dragging class for visual feedback
    disk.classList.add('dragging');
    selectedDisk = disk;

    playSound(selectSound);
}

/**
 * Handle the drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    return false;
}

/**
 * Handle the drop event
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedDisk) return false;

    const targetTower = e.currentTarget;
    const sourceTower = selectedDisk.closest('.tower-container');

    if (!targetTower.classList.contains('tower-container')) return false;

    const sourceTowerIndex = parseInt(sourceTower.dataset.tower) - 1;
    const targetTowerIndex = parseInt(targetTower.dataset.tower) - 1;

    // Check if move is valid
    if (sourceTowerIndex !== targetTowerIndex && isValidMove(parseInt(selectedDisk.dataset.size), targetTowerIndex)) {
        // Move the disk
        moveDisk(sourceTowerIndex, targetTowerIndex);
    } else {
        // Invalid move
        targetTower.classList.add('invalid');
        setTimeout(() => targetTower.classList.remove('invalid'), 500);
    }

    // Clean up
    selectedDisk.classList.remove('dragging');
    selectedDisk = null;

    return false;
}

/**
 * Handle the drag end event
 */
function handleDragEnd(e) {
    if (selectedDisk) {
        selectedDisk.classList.remove('dragging');
        selectedDisk = null;
    }
}

/**
 * Check if a move is valid
 */
function isValidMove(diskSize, targetTowerIndex) {
    // If target tower is empty, move is valid
    if (towers[targetTowerIndex].length === 0) {
        return true;
    }

    // Move is valid if the disk is smaller than the top disk on the target tower
    const topDiskSize = towers[targetTowerIndex][towers[targetTowerIndex].length - 1];
    return diskSize < topDiskSize;
}

/**
 * Move a disk from source tower to target tower
 */
function moveDisk(sourceTowerIndex, targetTowerIndex) {
    // Ensure the move is valid
    if (!isValidMove(towers[sourceTowerIndex][towers[sourceTowerIndex].length - 1], targetTowerIndex)) {
        return false;
    }

    // Move the disk in towers array
    const diskSize = towers[sourceTowerIndex].pop();
    towers[targetTowerIndex].push(diskSize);

    // Move the disk in DOM
    const disk = disksStacks[sourceTowerIndex].lastChild;
    disksStacks[targetTowerIndex].appendChild(disk);

    // Record move in history
    moveHistory.push({
        source: sourceTowerIndex,
        target: targetTowerIndex,
        diskSize: diskSize
    });

    // Update undo button
    document.getElementById('undoBtn').disabled = false;

    // Play sound effect
    playSound(moveSound);

    // Update move counter
    moveCount++;
    moveCounter.textContent = moveCount;
    moveCounter.classList.add('move-counter-change');
    setTimeout(() => moveCounter.classList.remove('move-counter-change'), 300);

    // Start game timer on first move
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    // Check for win
    return checkWinCondition();
}

/**
 * Undo the last move
 */
function undoMove() {
    if (moveHistory.length === 0) return;

    // Get the last move
    const lastMove = moveHistory.pop();
    const { source, target, diskSize } = lastMove;

    // Move the disk back in towers array
    towers[target].pop();
    towers[source].push(diskSize);

    // Move the disk in DOM
    const disk = disksStacks[target].lastChild;
    disksStacks[source].appendChild(disk);

    // Update move counter
    moveCount--;
    moveCounter.textContent = moveCount;

    // Update undo button state
    document.getElementById('undoBtn').disabled = moveHistory.length === 0;

    // Play move sound
    playSound(moveSound);
}

/**
 * Check if the current level is completed
 */
function checkWinCondition() {
    // Win if all disks are on the third tower
    const numDisks = disksPerLevel[currentLevel - 1];
    const isWin = towers[2].length === numDisks;

    if (isWin) {
        // Stop the timer
        clearInterval(gameTimer);

        // Show win celebration
        celebrateWin();

        // Track level completion
        if (!playerLevelsCompleted.includes(currentLevel)) {
            playerLevelsCompleted.push(currentLevel);
            saveGameState();
        }

        // Save score to leaderboard
        saveScore();

        // Update win modal values
        winLevel.textContent = currentLevel;
        winMoves.textContent = moveCount;
        winTime.textContent = timer.textContent;
        winOptimal.textContent = OPTIMAL_MOVES[currentLevel - 1];

        // Calculate efficiency
        const efficiency = Math.floor((OPTIMAL_MOVES[currentLevel - 1] / moveCount) * 100);
        winEfficiency.textContent = efficiency;

        // Show win modal
        setTimeout(() => {
            winModal.style.display = 'block';
            document.getElementById('nextLevelBtn').disabled = false;

            // Show game completion modal if all levels are completed
            if (currentLevel === disksPerLevel.length) {
                setTimeout(() => {
                    showGameCompletion();
                }, 3000);
            }
        }, 1200);
    }

    return isWin;
}

/**
 * Handle win condition
 */
function handleWin() {
    // Stop the timer
    clearInterval(gameTimer);

    // Show win celebration
    celebrateWin();

    // Track level completion
    if (!playerLevelsCompleted.includes(currentLevel)) {
        playerLevelsCompleted.push(currentLevel);
        saveGameState();
    }

    // Save score to leaderboard
    saveScore();

    // Update win modal values
    winLevel.textContent = currentLevel;
    winMoves.textContent = moveCount;
    winTime.textContent = timer.textContent;
    winOptimal.textContent = OPTIMAL_MOVES[currentLevel - 1];

    // Calculate efficiency
    const efficiency = Math.floor((OPTIMAL_MOVES[currentLevel - 1] / moveCount) * 100);
    winEfficiency.textContent = efficiency;

    // Show win modal
    setTimeout(() => {
        winModal.style.display = 'block';
        document.getElementById('nextLevelBtn').disabled = false;

        // Show game completion modal if all levels are completed
        if (currentLevel === disksPerLevel.length) {
            setTimeout(() => {
                showGameCompletion();
            }, 3000);
        }
    }, 1200);
}

/**
 * Create visual celebration on win
 */
function celebrateWin() {
    // Play win sound
    playSound(winSound);

    // Add win animations to disks
    const disks = disksStacks[2].querySelectorAll('.disk');
    disks.forEach((disk, index) => {
        setTimeout(() => {
            disk.classList.add('win-animation');
        }, index * 100);
    });

    // Add win animation to the target tower
    towerContainers[2].classList.add('win-tower');

    // Create confetti effect
    createConfetti();
}

/**
 * Create confetti particles for win celebration
 */
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = `${1 + Math.random() * 3}s`;
        document.body.appendChild(confetti);

        // Remove confetti element after animation
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

/**
 * Change to a specific level
 */
function changeLevel(level) {
    // Validate level range
    if (level < 1 || level > disksPerLevel.length) return;

    // Check if the level is unlocked
    const maxUnlockedLevel = playerLevelsCompleted.length > 0 ?
        Math.max(...playerLevelsCompleted) + 1 : 1;

    if (level > 1 && level > maxUnlockedLevel) {
        // Provide more helpful feedback
        const errorMessage = document.createElement('div');
        errorMessage.className = 'level-error';
        errorMessage.textContent = `Complete level ${level-1} first to unlock this level!`;
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '50%';
        errorMessage.style.left = '50%';
        errorMessage.style.transform = 'translate(-50%, -50%)';
        errorMessage.style.padding = '15px 20px';
        errorMessage.style.backgroundColor = 'var(--error)';
        errorMessage.style.color = 'white';
        errorMessage.style.borderRadius = '8px';
        errorMessage.style.zIndex = '1000';
        errorMessage.style.boxShadow = 'var(--shadow-lg)';

        document.body.appendChild(errorMessage);

        setTimeout(() => {
            document.body.removeChild(errorMessage);
        }, 3000);

        return;
    }

    // Load the new level
    currentLevel = level;
    saveGameState();
    initLevel();
}

/**
 * Reset the current level
 */
function resetLevel() {
    // Confirm with user
    if (gameStarted && !confirm('Reset the current level? All progress will be lost.')) {
        return;
    }

    initLevel();
}

/**
 * Show the level selection screen
 */
function showLevelSelection() {
    // Clear existing level cards
    levelsGrid.innerHTML = '';

    // Calculate the highest level the player can access
    const maxUnlockedLevel = playerLevelsCompleted.length > 0 ?
        Math.max(...playerLevelsCompleted) + 1 : 1;

    // Create level cards
    for (let i = 1; i <= disksPerLevel.length; i++) {
        const levelCard = document.createElement('div');
        levelCard.className = 'level-card';

        // Add appropriate classes
        if (i === currentLevel) levelCard.classList.add('current');
        if (playerLevelsCompleted.includes(i)) levelCard.classList.add('completed');

        const isLocked = i > maxUnlockedLevel;
        if (isLocked) {
            levelCard.classList.add('locked');
            levelCard.innerHTML = `
                <span class="level-number">${i}</span>
                <div class="level-status">Locked</div>
                <span class="lock-icon">🔒</span>
            `;

            // Add tooltip for locked levels
            levelCard.title = "Complete previous levels to unlock";
        } else {
            levelCard.innerHTML = `
                <span class="level-number">${i}</span>
                <div class="level-status">${playerLevelsCompleted.includes(i) ? 'Completed' : 'Available'}</div>
                <div class="level-disks">${disksPerLevel[i-1]} disks</div>
            `;

            // Add click handler for unlocked levels
            levelCard.addEventListener('click', () => {
                levelSelectionModal.style.display = 'none';
                homeScreen.style.display = 'none';
                gameScreen.style.display = 'flex';
                currentLevel = i;
                saveGameState();
                initLevel();
            });
        }

        levelsGrid.appendChild(levelCard);
    }

    // Show the modal
    levelSelectionModal.style.display = 'block';
}

/**
 * Save score to leaderboard
 */
function saveScore() {
    // Get existing leaderboard data or initialize
    let leaderboard = JSON.parse(localStorage.getItem('tower_of_hanoi_leaderboard') || '{}');

    // Create entry for this level if it doesn't exist
    const levelKey = `level_${currentLevel}`;
    if (!leaderboard[levelKey]) {
        leaderboard[levelKey] = [];
    }

    // Check if player already has a score for this level
    const existingScoreIndex = leaderboard[levelKey].findIndex(score => score.name === playerName);

    // Create new score entry
    const scoreEntry = {
        name: playerName,
        moves: moveCount,
        time: seconds,
        timeFormatted: timer.textContent,
        date: new Date().toISOString()
    };

    if (existingScoreIndex !== -1) {
        // Check if new score is better
        const existingScore = leaderboard[levelKey][existingScoreIndex];
        const isBetterMoves = scoreEntry.moves < existingScore.moves;
        const isSameMovesBetterTime = scoreEntry.moves === existingScore.moves && scoreEntry.time < existingScore.time;

        if (isBetterMoves || isSameMovesBetterTime) {
            // Replace with better score
            leaderboard[levelKey][existingScoreIndex] = scoreEntry;
            console.log(`Updated better score for ${playerName} on level ${currentLevel}`);
        }
    } else {
        // Add new score
        leaderboard[levelKey].push(scoreEntry);
        console.log(`Added new score for ${playerName} on level ${currentLevel}`);
    }

    // Sort all entries (better scores first)
    leaderboard[levelKey].sort((a, b) => {
        // First sort by moves (fewer is better)
        if (a.moves !== b.moves) return a.moves - b.moves;
        // Then by time (shorter is better)
        return a.time - b.time;
    });

    // Limit to top 10 scores
    leaderboard[levelKey] = leaderboard[levelKey].slice(0, 10);

    // Save updated leaderboard
    localStorage.setItem('tower_of_hanoi_leaderboard', JSON.stringify(leaderboard));

    // Also update player progress
    if (!playerLevelsCompleted.includes(currentLevel)) {
        playerLevelsCompleted.push(currentLevel);
        saveGameState();
    }
}

/**
 * Show the leaderboard modal
 */
function showLeaderboard() {
    // Clear level select dropdown
    leaderboardLevelSelect.innerHTML = '';

    // Add options for each level
    for (let i = 1; i <= disksPerLevel.length; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Level ${i} (${disksPerLevel[i-1]} disks)`;
        leaderboardLevelSelect.appendChild(option);
    }

    // Set current level as selected
    leaderboardLevelSelect.value = currentLevel;

    // Update the leaderboard data
    updateLeaderboard();

    // Show modal
    leaderboardModal.style.display = 'block';
}

/**
 * Update the leaderboard table with scores for the selected level
 */
function updateLeaderboard() {
    // Clear current rows
    leaderboardBody.innerHTML = '';

    // Get leaderboard data
    const leaderboard = JSON.parse(localStorage.getItem('tower_of_hanoi_leaderboard') || '{}');
    const levelKey = `level_${leaderboardLevelSelect.value}`;
    const scores = leaderboard[levelKey] || [];

    // Display scores or empty message
    if (scores.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5">No scores recorded for this level yet</td>';
        leaderboardBody.appendChild(row);
    } else {
        scores.forEach((score, index) => {
            const row = document.createElement('tr');

            // Format date
            const scoreDate = new Date(score.date);
            const dateFormatted = scoreDate.toLocaleDateString();

            row.innerHTML = `
        <td>${index + 1}</td>
                <td>${score.name}</td>
        <td>${score.moves}</td>
                <td>${score.timeFormatted}</td>
                <td>${dateFormatted}</td>
            `;

            // Highlight current player's scores
            if (score.name === playerName) {
                row.style.backgroundColor = 'rgba(var(--highlight-rgb), 0.2)';
            }

            leaderboardBody.appendChild(row);
        });
    }
}

/**
 * Show game completion screen
 */
function showGameCompletion() {
    winModal.style.display = 'none';

    // Set player name
    completionPlayerName.textContent = playerName;

    // Clear previous completion stats
    completionTableBody.innerHTML = '';

    // Get leaderboard data
    const leaderboard = JSON.parse(localStorage.getItem('tower_of_hanoi_leaderboard') || '{}');

    // Create a row for each level
    for (let i = 1; i <= disksPerLevel.length; i++) {
        const row = document.createElement('tr');

        // Get the player's best score for this level
        const levelKey = `level_${i}`;
        const levelScores = leaderboard[levelKey] || [];
        const playerScores = levelScores.filter(score => score.name === playerName);

        if (playerScores.length > 0) {
            // Get the best score (already sorted when saving)
            const bestScore = playerScores[0];
            const efficiency = Math.floor((OPTIMAL_MOVES[i - 1] / bestScore.moves) * 100);

            row.innerHTML = `
                <td>${i}</td>
                <td>${bestScore.moves}</td>
                <td>${OPTIMAL_MOVES[i-1]}</td>
                <td>${efficiency}%</td>
                <td>${bestScore.timeFormatted}</td>
            `;
        } else {
            row.innerHTML = `
                <td>${i}</td>
                <td colspan="4">Level not completed</td>
            `;
        }

        completionTableBody.appendChild(row);
    }

    // Play completion sound
    playSound(gameCompleteSound);

    // Show completion modal
    gameCompletionModal.style.display = 'block';
}

/**
 * Change player name
 */
function changePlayer() {
    // Create or show the switch user modal
    const switchUserModal = document.getElementById('switchUserModal');
    if (!switchUserModal) return;

    // Get existing players list for dropdown
    let players = JSON.parse(localStorage.getItem(PLAYERS_KEY) || '[]');

    // Show the modal
    switchUserModal.style.display = 'block';

    // Set current player name as default value
    const newPlayerNameInput = document.getElementById('newPlayerNameInput');
    if (newPlayerNameInput) {
        newPlayerNameInput.value = playerName;
        newPlayerNameInput.focus();
        newPlayerNameInput.select();

        // Add datalist for player suggestions if not already added
        let datalist = document.getElementById('playerNameSuggestions');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'playerNameSuggestions';
            document.body.appendChild(datalist);
            newPlayerNameInput.setAttribute('list', 'playerNameSuggestions');
        }

        // Clear and repopulate datalist
        datalist.innerHTML = '';
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            datalist.appendChild(option);
        });
    }

    // Set up event listeners if not already set
    if (!switchUserModal.hasListeners) {
        // Confirm button
        document.getElementById('confirmSwitchUserBtn').addEventListener('click', () => {
            const newName = newPlayerNameInput.value.trim();
            if (newName) {
                // Save current player progress before switching
                saveGameState();

                // Switch to new player
                playerName = newName;

                // Load progress for this player
                loadPlayerProgress(playerName);

                // Update all player name displays
                if (playerNameDisplay) playerNameDisplay.textContent = playerName;
                if (homePlayerName) homePlayerName.textContent = playerName;
                if (currentPlayerName) currentPlayerName.textContent = playerName;

                // Save changes for the new player
                saveGameState();

                // Close modal
                switchUserModal.style.display = 'none';

                // Notify user about progress reset or continuation
                const notification = document.createElement('div');
                notification.style.position = 'fixed';
                notification.style.top = '10%';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.padding = '10px 20px';
                notification.style.backgroundColor = 'var(--highlight)';
                notification.style.color = 'white';
                notification.style.borderRadius = '5px';
                notification.style.boxShadow = 'var(--shadow-lg)';
                notification.style.zIndex = '9999';
                notification.style.textAlign = 'center';

                if (playerLevelsCompleted.length > 0) {
                    notification.textContent = `Welcome back, ${playerName}! Loaded your previous progress.`;
                } else {
                    notification.textContent = `Welcome, ${playerName}! Starting a new game.`;
                }

                document.body.appendChild(notification);
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 3000);
            } else {
                newPlayerNameInput.classList.add('invalid');
                setTimeout(() => newPlayerNameInput.classList.remove('invalid'), 500);
            }
        });

        // Cancel button
        document.getElementById('cancelSwitchUserBtn').addEventListener('click', () => {
            switchUserModal.style.display = 'none';
        });

        // Close button
        document.getElementById('closeSwitchUserBtn').addEventListener('click', () => {
            switchUserModal.style.display = 'none';
        });

        // Enter key in input
        newPlayerNameInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('confirmSwitchUserBtn').click();
            }
        });

        // Close on outside click
        switchUserModal.addEventListener('click', (e) => {
            if (e.target === switchUserModal) {
                switchUserModal.style.display = 'none';
            }
        });

        // Mark as initialized
        switchUserModal.hasListeners = true;
    }
}

/**
 * Toggle sound on/off
 */
function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('homeSoundToggleBtn').textContent =
        soundEnabled ? '🔊 Sound' : '🔇 Sound';
    saveGameState();
}

/**
 * Play a sound if sounds are enabled
 */
function playSound(sound) {
    if (soundEnabled && sound) {
        sound.currentTime = 0;
        sound.play().catch(e => {
            // Ignore autoplay errors
            console.log('Sound play prevented by browser policy');
        });
    }
}

/**
 * Return to home screen
 */
function backToHome() {
    clearInterval(gameTimer);
    gameScreen.style.display = 'none';
    homeScreen.style.display = 'flex';
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyPress(e) {
    // Only process if no input is focused
    if (document.activeElement.tagName === 'INPUT') return;

    switch (e.key) {
        case 'Escape':
            // Close any open modal
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
            break;

        case 'r':
        case 'R':
            // Reset level
            if (gameScreen.style.display === 'flex') {
                resetLevel();
            }
            break;

        case 'ArrowLeft':
            // Previous level
            if (gameScreen.style.display === 'flex' && !document.getElementById('prevLevelBtn').disabled) {
                changeLevel(currentLevel - 1);
            }
            break;

        case 'ArrowRight':
            // Next level
            if (gameScreen.style.display === 'flex' && !document.getElementById('nextLevelBtn').disabled) {
                changeLevel(currentLevel + 1);
            }
            break;

        case 'h':
        case 'H':
            // Back to home
            if (gameScreen.style.display === 'flex') {
                backToHome();
            }
            break;

        case 't':
        case 'T':
            // Toggle theme
            darkTheme = !darkTheme;
            document.body.classList.toggle('light-theme', !darkTheme);
            localStorage.setItem(THEME_KEY, darkTheme ? 'dark' : 'light');
            break;
    }
}

/**
 * Add "Coming Soon" labels to sound-related elements
 */
function addComingSoonLabels() {
    // Add to sound toggle button in home screen
    const soundBtn = document.getElementById('homeSoundToggleBtn');
    if (soundBtn) {
        addLabelToElement(soundBtn, '-40px', '2px');
    }

    // Add event listener to handle settings panel creation
    document.getElementById('gameOptionsBtn').addEventListener('click', function() {
        // Wait a bit for the panel to be created
        setTimeout(() => {
            // Find the sound toggle checkbox
            const soundToggle = document.getElementById('soundToggle');
            if (soundToggle) {
                // Get the parent label element
                const label = soundToggle.closest('label');
                if (label) {
                    // Make the parent relative for positioning
                    label.style.position = 'relative';
                    // Add label to the parent element
                    addLabelToElement(label, '20px', '-8px');
                }
            }
        }, 100);
    });

    // Helper function to add a coming soon label
    function addLabelToElement(element, right, top) {
        // Skip if element already has a label
        if (element.querySelector('.coming-soon-label')) return;

        // Create the label element
        const label = document.createElement('div');
        label.className = 'coming-soon-label';
        label.textContent = 'Coming Soon';

        // Apply inline styles
        Object.assign(label.style, {
            position: 'absolute',
            background: 'linear-gradient(135deg, var(--error), var(--warning))',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            padding: '3px 8px',
            borderRadius: '4px',
            zIndex: '100',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transform: 'rotate(-15deg)',
            pointerEvents: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            right: right,
            top: top
        });

        // Make sure parent has position relative
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }

        // Add label to element
        element.appendChild(label);
    }
}

/**
 * Load progress for a specific player
 */
function loadPlayerProgress(name) {
    // Get player-specific save key
    const playerSaveKey = SAVE_KEY_PREFIX + name.toLowerCase().replace(/\s+/g, '_');
    const savedData = localStorage.getItem(playerSaveKey);

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            // Load player-specific data
            currentLevel = data.currentLevel || 1;
            playerLevelsCompleted = data.levelsCompleted || [];
            console.log(`Loaded existing progress for player: ${name}`);
        } catch (e) {
            console.error('Error loading player progress:', e);
            // Reset progress if data is corrupted
            currentLevel = 1;
            playerLevelsCompleted = [];
        }
    } else {
        // New player, reset progress
        currentLevel = 1;
        playerLevelsCompleted = [];
        console.log(`No existing progress for player: ${name}, starting fresh`);
    }
}