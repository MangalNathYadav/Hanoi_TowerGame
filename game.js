/**
 * Tower of Hanoi Game
 * A complete implementation with proper error handling and transitions
 */
class HanoiGame {
  constructor() {
    // Game configuration
    this.config = {
      minDisks: 3,
      maxDisks: 8,
      transitionDelay: 300,
      loadingDuration: 1500
    };

    // Game state
    this.state = {
      initialized: false,
      loading: true,
      selectedDisk: null,
      selectedTower: null,
      moveCount: 0,
      level: 1,
      totalDisks: 3,
      timeElapsed: 0,
      timerRunning: false,
      timerInterval: null,
      playerName: '',
      highScores: {},
      progress: { highestLevel: 1, completedLevels: [] },
      currentScreen: 'loading',
      soundEnabled: true,
      loadingInterval: null,
      moveHistory: []
    };

    // DOM references
    this.dom = {};
    
    // Initialize the game when DOM is ready
    this.initWhenReady();
  }

  /**
   * Initialize the game when DOM is ready
   */
  initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  /**
   * Initialize the game
   */
  initialize() {
    console.log('Initializing Tower of Hanoi Game...');
    this.setupDOMReferences();
    
    if (this.validateDOMElements()) {
      this.loadSavedData();
      this.startLoadingSequence();
    } else {
      console.error('Critical DOM elements are missing. Game cannot initialize.');
    }
  }

  /**
   * Set up references to DOM elements
   */
  setupDOMReferences() {
    // Screens
    this.dom.loadingScreen = document.getElementById('loadingScreen');
    this.dom.homeScreen = document.getElementById('homeScreen');
    this.dom.gameScreen = document.getElementById('gameScreen');
    
    // Sound effects
    this.dom.selectSound = document.getElementById('selectSound');
    this.dom.moveSound = document.getElementById('moveSound');
    this.dom.winSound = document.getElementById('winSound');
    this.dom.gameCompleteSound = document.getElementById('gameCompleteSound');
    
    // Loading screen elements
    this.dom.loadingBar = document.getElementById('loadingBar');
    this.dom.loadingProgress = document.getElementById('loadingProgress');
    
    // Home screen elements
    this.dom.homePlayerName = document.getElementById('homePlayerName');
    this.dom.playBtn = document.getElementById('playBtn');
    this.dom.levelsBtn = document.getElementById('levelsBtn');
    this.dom.homeLeaderboardBtn = document.getElementById('homeLeaderboardBtn');
    this.dom.changePlayerHomeBtn = document.getElementById('changePlayerHomeBtn');
    
    // Game screen elements
    this.dom.backToHomeBtn = document.getElementById('backToHomeBtn');
    this.dom.gameOptionsBtn = document.getElementById('gameOptionsBtn');
    this.dom.towers = document.querySelectorAll('.tower-container');
    this.dom.moveCounter = document.getElementById('moveCounter');
    this.dom.levelDisplay = document.getElementById('levelDisplay');
    this.dom.optimalMoves = document.getElementById('optimalMoves');
    this.dom.timer = document.getElementById('timer');
    this.dom.resetBtn = document.getElementById('resetBtn');
    this.dom.undoBtn = document.getElementById('undoBtn');
    this.dom.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.dom.prevLevelBtn = document.getElementById('prevLevelBtn');
    this.dom.nextLevelBtn = document.getElementById('nextLevelBtn');
    this.dom.leaderboardBtn = document.getElementById('leaderboardBtn');
    
    // Modals
    this.dom.welcomeModal = document.getElementById('welcomeModal');
    this.dom.playerNameInput = document.getElementById('playerNameInput');
    this.dom.startGameBtn = document.getElementById('startGameBtn');
    
    this.dom.winModal = document.getElementById('winModal');
    this.dom.winLevel = document.getElementById('winLevel');
    this.dom.winMoves = document.getElementById('winMoves');
    this.dom.winTime = document.getElementById('winTime');
    this.dom.winOptimal = document.getElementById('winOptimal');
    this.dom.winEfficiency = document.getElementById('winEfficiency');
    this.dom.nextLevelBtn2 = document.getElementById('nextLevelBtn2');
    this.dom.stayBtn = document.getElementById('stayBtn');
    this.dom.backToHomeBtn2 = document.getElementById('backToHomeBtn2');
    
    this.dom.leaderboardModal = document.getElementById('leaderboardModal');
    this.dom.leaderboardLevelSelect = document.getElementById('leaderboardLevelSelect');
    this.dom.leaderboardBody = document.getElementById('leaderboardBody');
    this.dom.closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    this.dom.currentPlayerName = document.getElementById('currentPlayerName');
    
    this.dom.levelSelectionModal = document.getElementById('levelSelectionModal');
    this.dom.levelsGrid = document.getElementById('levelsGrid');
    this.dom.closeLevelsBtn = document.getElementById('closeLevelsBtn');
    
    this.dom.gameCompletionModal = document.getElementById('gameCompletionModal');
    this.dom.completionPlayerName = document.getElementById('completionPlayerName');
    this.dom.completionTableBody = document.getElementById('completionTableBody');
    this.dom.playAgainBtn = document.getElementById('playAgainBtn');
    this.dom.backToHomeBtn3 = document.getElementById('backToHomeBtn3');
  }

  /**
   * Validate critical DOM elements exist
   */
  validateDOMElements() {
    const criticalElements = [
      'loadingScreen', 'homeScreen', 'gameScreen', 
      'loadingBar', 'loadingProgress'
    ];
    
    let valid = true;
    criticalElements.forEach(id => {
      if (!this.dom[id]) {
        console.error(`Critical DOM element missing: ${id}`);
        valid = false;
      }
    });
    
    return valid;
  }

  /**
   * Load saved data from localStorage
   */
  loadSavedData() {
    try {
      // Load player name
      const storedName = localStorage.getItem('hanoiPlayerName');
      if (storedName) {
        this.state.playerName = storedName;
      }
      
      // Load progress
      const progress = localStorage.getItem('hanoiProgress');
      if (progress) {
        this.state.progress = JSON.parse(progress);
      }
      
      // Load high scores
      const highScores = localStorage.getItem('hanoiHighScores');
      if (highScores) {
        this.state.highScores = JSON.parse(highScores);
      }
      
      console.log('Game data loaded successfully');
    } catch (error) {
      console.error('Error loading saved data:', error);
      // Use default values if loading fails
    }
  }

  /**
   * Start the loading sequence animation
   */
  startLoadingSequence() {
    console.log('Starting loading sequence...');
    
    // Hide all screens and show loading screen
    this.hideAllScreens();
    this.showScreen('loadingScreen');
    
    // Reset loading bar
    this.updateLoadingBar(0);
    
    // Clear any existing interval
    if (this.state.loadingInterval) {
      clearInterval(this.state.loadingInterval);
    }
    
    // Animate loading progress
    let progress = 0;
    const totalSteps = 100;
    const intervalTime = this.config.loadingDuration / totalSteps;
    
    this.state.loadingInterval = setInterval(() => {
      progress += 1;
      this.updateLoadingBar(progress);
      
      if (progress >= 100) {
        clearInterval(this.state.loadingInterval);
        this.state.loadingInterval = null;
        this.state.initialized = true;
        this.state.loading = false;
        
        // Short delay before transitioning
        setTimeout(() => this.finishLoading(), 300);
      }
    }, intervalTime);
  }

  /**
   * Update the loading bar UI
   */
  updateLoadingBar(percentage) {
    if (this.dom.loadingBar) {
      this.dom.loadingBar.style.width = `${percentage}%`;
    }
    
    if (this.dom.loadingProgress) {
      this.dom.loadingProgress.textContent = `${Math.round(percentage)}%`;
    }
  }

  /**
   * Finish loading and transition to next screen
   */
  finishLoading() {
    console.log('Loading complete, transitioning to next screen...');
    
    // Clean up any loading interval
    if (this.state.loadingInterval) {
      clearInterval(this.state.loadingInterval);
      this.state.loadingInterval = null;
    }
    
    // First set up event listeners for the next screen
    if (!this.state.playerName) {
      this.setupWelcomeModalListeners();
      this.showWelcomeModal();
    } else {
      this.setupHomeScreenListeners();
      this.showHomeScreen();
    }
  }

  /**
   * Set up event listeners for the welcome modal
   */
  setupWelcomeModalListeners() {
    if (!this.dom.welcomeModal || !this.dom.playerNameInput || !this.dom.startGameBtn) {
      console.error('Welcome modal elements not found');
      return;
    }
    
    // Reset and focus input field
    this.dom.playerNameInput.value = '';
    
    // Set up event listeners (after removing any existing ones)
    this.safeAddEventListener(this.dom.playerNameInput, 'keyup', (e) => {
      if (e.key === 'Enter') this.handleStartGame();
    });
    
    this.safeAddEventListener(this.dom.startGameBtn, 'click', () => {
      this.handleStartGame();
    });
  }

  /**
   * Set up home screen event listeners
   */
  setupHomeScreenListeners() {
    // Play button
    this.safeAddEventListener(this.dom.playBtn, 'click', () => {
      this.playSound(this.dom.selectSound);
      this.showGameScreen();
      this.setupLevel(this.state.totalDisks);
    });
    
    // Levels button
    this.safeAddEventListener(this.dom.levelsBtn, 'click', () => {
      this.playSound(this.dom.selectSound);
      this.showLevelSelectionModal();
    });
    
    // Leaderboard button
    this.safeAddEventListener(this.dom.homeLeaderboardBtn, 'click', () => {
      this.playSound(this.dom.selectSound);
      this.showLeaderboardModal();
    });
    
    // Change player button
    this.safeAddEventListener(this.dom.changePlayerHomeBtn, 'click', () => {
      localStorage.removeItem('hanoiPlayerName');
      this.state.playerName = '';
      this.showWelcomeModal();
    });
    
    // Back to home button (game screen)
    if (this.dom.backToHomeBtn) {
      this.safeAddEventListener(this.dom.backToHomeBtn, 'click', () => {
        this.stopTimer();
        this.showHomeScreen();
      });
    }
  }

  /**
   * Set up game screen event listeners
   */
  setupGameEventListeners() {
    // Tower events for disk movement
    this.dom.towers.forEach(tower => {
      // Allow dropping on towers
      this.safeAddEventListener(tower, 'dragover', (e) => {
        e.preventDefault();
      });
      
      // Handle drop events
      this.safeAddEventListener(tower, 'drop', (e) => {
        this.handleDrop(e);
      });
      
      // Handle tower clicks
      this.safeAddEventListener(tower, 'click', (e) => {
        this.handleTowerClick(e.currentTarget);
      });
    });
    
    // Global drag events
    document.addEventListener('dragstart', (e) => this.handleDragStart(e));
    document.addEventListener('dragend', () => this.handleDragEnd());
    
    // Game control buttons
    this.safeAddEventListener(this.dom.resetBtn, 'click', () => this.resetLevel());
    this.safeAddEventListener(this.dom.undoBtn, 'click', () => this.undoMove());
    this.safeAddEventListener(this.dom.prevLevelBtn, 'click', () => this.prevLevel());
    this.safeAddEventListener(this.dom.nextLevelBtn, 'click', () => this.nextLevel());
    this.safeAddEventListener(this.dom.soundToggleBtn, 'click', () => this.toggleSound());
    this.safeAddEventListener(this.dom.leaderboardBtn, 'click', () => this.showLeaderboardModal());
    
    // Add touch support
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    document.addEventListener('touchmove', (e) => {
      if (this.state.selectedDisk) e.preventDefault();
    }, { passive: false });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.cleanupSelection();
    });
  }

  /**
   * Set up win modal event listeners
   */
  setupWinModalListeners() {
    this.safeAddEventListener(this.dom.nextLevelBtn2, 'click', () => {
      this.dom.winModal.style.display = 'none';
      
      // Remove win animations
      if (this.dom.towers && this.dom.towers[2]) {
        this.dom.towers[2].classList.remove('win-tower');
        const diskStack = this.dom.towers[2].querySelector('.disks-stack');
        if (diskStack) {
          Array.from(diskStack.children).forEach(disk => {
            disk.classList.remove('win-animation');
          });
        }
      }
      
      // Go to next level if possible
      if (this.state.level < (this.config.maxDisks - this.config.minDisks + 1)) {
        this.nextLevel();
      } else {
        // Show game completion if all levels are completed
        this.showGameCompletionModal();
      }
    });
    
    this.safeAddEventListener(this.dom.stayBtn, 'click', () => {
      this.dom.winModal.style.display = 'none';
      
      // Remove win animations
      if (this.dom.towers && this.dom.towers[2]) {
        this.dom.towers[2].classList.remove('win-tower');
        const diskStack = this.dom.towers[2].querySelector('.disks-stack');
        if (diskStack) {
          Array.from(diskStack.children).forEach(disk => {
            disk.classList.remove('win-animation');
          });
        }
      }
    });
    
    this.safeAddEventListener(this.dom.backToHomeBtn2, 'click', () => {
      this.dom.winModal.style.display = 'none';
      this.showHomeScreen();
    });
  }

  /**
   * Set up level selection modal event listeners
   */
  setupLevelSelectionModalListeners() {
    this.safeAddEventListener(this.dom.closeLevelsBtn, 'click', () => {
      this.dom.levelSelectionModal.style.display = 'none';
    });
  }

  /**
   * Set up game completion modal event listeners
   */
  setupGameCompletionModalListeners() {
    this.safeAddEventListener(this.dom.playAgainBtn, 'click', () => {
      this.dom.gameCompletionModal.style.display = 'none';
      this.state.level = 1;
      this.state.totalDisks = this.config.minDisks;
      this.showGameScreen();
      this.setupLevel(this.state.totalDisks);
    });
    
    this.safeAddEventListener(this.dom.backToHomeBtn3, 'click', () => {
      this.dom.gameCompletionModal.style.display = 'none';
      this.showHomeScreen();
    });
  }

  /**
   * Set up leaderboard modal event listeners
   */
  setupLeaderboardModalListeners() {
    this.safeAddEventListener(this.dom.closeLeaderboardBtn, 'click', () => {
      this.dom.leaderboardModal.style.display = 'none';
    });
    
    if (this.dom.leaderboardLevelSelect) {
      this.safeAddEventListener(this.dom.leaderboardLevelSelect, 'change', () => {
        this.displayLeaderboardScores(this.dom.leaderboardLevelSelect.value);
      });
    }
  }

  /**
   * Handle start game button click
   */
  handleStartGame() {
    // Try to play the sound
    this.playSound(this.dom.selectSound);
    
    // Check if player name is provided
    if (this.dom.playerNameInput) {
      const name = this.dom.playerNameInput.value.trim();
      if (!name) {
        // Add shake animation for empty name
        this.dom.playerNameInput.classList.add('invalid');
        this.dom.playerNameInput.style.animation = 'shake 0.3s';
        setTimeout(() => {
          this.dom.playerNameInput.classList.remove('invalid');
          this.dom.playerNameInput.style.animation = '';
        }, 300);
        return;
      }
      
      // Save player name and update displays
      this.state.playerName = name;
      localStorage.setItem('hanoiPlayerName', name);
      this.updatePlayerNameDisplay();
    }
    
    // Hide welcome modal and show home screen
    this.dom.welcomeModal.style.display = 'none';
    this.setupHomeScreenListeners();
    this.showHomeScreen();
  }

  /**
   * Update player name in all displays
   */
  updatePlayerNameDisplay() {
    const playerName = this.state.playerName || 'Player';
    
    if (this.dom.homePlayerName) {
      this.dom.homePlayerName.textContent = playerName;
    }
    
    if (this.dom.playerNameDisplay) {
      this.dom.playerNameDisplay.textContent = playerName;
    }
    
    if (this.dom.currentPlayerName) {
      this.dom.currentPlayerName.textContent = playerName;
    }
    
    if (this.dom.completionPlayerName) {
      this.dom.completionPlayerName.textContent = playerName;
    }
  }

  /**
   * Set up a new level
   */
  setupLevel(disks) {
    disks = Math.max(this.config.minDisks, Math.min(this.config.maxDisks, disks));
    this.state.totalDisks = disks;
    
    // Reset game state for new level
    this.state.moveCount = 0;
    this.state.selectedDisk = null;
    this.state.selectedTower = null;
    this.state.moveHistory = [];
    this.resetTimer();
    
    // Update UI displays
    if (this.dom.levelDisplay) {
      this.dom.levelDisplay.textContent = this.state.level;
    }
    
    if (this.dom.moveCounter) {
      this.dom.moveCounter.textContent = '0';
    }
    
    if (this.dom.optimalMoves) {
      this.dom.optimalMoves.textContent = Math.pow(2, disks) - 1;
    }
    
    if (this.dom.undoBtn) {
      this.dom.undoBtn.disabled = true;
    }
    
    // Clear all towers
    if (this.dom.towers) {
      this.dom.towers.forEach(tower => {
        const stack = tower.querySelector('.disks-stack');
        if (stack) {
          stack.innerHTML = '';
        }
      });
    }
    
    // Create disks on the first tower
    const firstTower = this.dom.towers[0].querySelector('.disks-stack');
    if (!firstTower) return;
    
    // Color palette for the disks
    const colors = [
      { start: '#ff5252', end: '#ff8a80' }, // Red
      { start: '#ff9800', end: '#ffcc80' }, // Orange
      { start: '#ffeb3b', end: '#fff59d' }, // Yellow
      { start: '#4caf50', end: '#a5d6a7' }, // Green
      { start: '#2196f3', end: '#90caf9' }, // Blue
      { start: '#9c27b0', end: '#ce93d8' }, // Purple
      { start: '#3f51b5', end: '#9fa8da' }, // Indigo
      { start: '#009688', end: '#80cbc4' }  // Teal
    ];
    
    // Create disks from largest to smallest
    for (let i = disks; i >= 1; i--) {
      const disk = document.createElement('div');
      disk.className = 'disk';
      disk.dataset.size = i;
      
      // Disk width based on size
      const widthPercent = 40 + (i * 12);
      disk.style.width = `${widthPercent}px`;
      
      // Disk color from palette
      const colorIndex = (i - 1) % colors.length;
      disk.style.background = `linear-gradient(to right, ${colors[colorIndex].start}, ${colors[colorIndex].end})`;
      
      // Add disk number
      disk.textContent = i;
      
      // Enable drag and drop
      disk.draggable = true;
      
      // Add to first tower
      firstTower.appendChild(disk);
    }
    
    // Update UI button states
    this.updateUI();
    
    // Set up event listeners
    this.setupGameEventListeners();
  }

  /**
   * Update game UI elements
   */
  updateUI() {
    // Update move counter
    if (this.dom.moveCounter) {
      this.dom.moveCounter.textContent = this.state.moveCount;
      
      // Animate move counter if moves > 0
      if (this.state.moveCount > 0) {
        this.dom.moveCounter.classList.add('move-counter-change');
        setTimeout(() => {
          this.dom.moveCounter.classList.remove('move-counter-change');
        }, 300);
      }
    }
    
    // Update button states
    if (this.dom.prevLevelBtn) {
      this.dom.prevLevelBtn.disabled = this.state.level <= 1;
    }
    
    if (this.dom.nextLevelBtn) {
      this.dom.nextLevelBtn.disabled = 
        this.state.level >= (this.config.maxDisks - this.config.minDisks + 1);
    }
    
    if (this.dom.undoBtn) {
      this.dom.undoBtn.disabled = this.state.moveHistory.length === 0;
    }
  }

  /**
   * Handle drag start event
   */
  handleDragStart(e) {
    const disk = e.target;
    if (!disk.classList.contains('disk')) return;
    
    const stack = disk.parentElement;
    // Only allow top disk to be dragged
    if (disk !== stack.lastElementChild) {
      e.preventDefault();
      return;
    }
    
    this.state.selectedDisk = disk;
    this.state.selectedTower = stack.parentElement;
    disk.classList.add('dragging', 'selected');
    
    this.highlightValidTowers();
    e.dataTransfer.setData('text/plain', disk.dataset.size);
    e.dataTransfer.effectAllowed = 'move';
  }

  /**
   * Handle drag end event
   */
  handleDragEnd() {
    this.cleanupSelection();
  }

  /**
   * Handle drop event
   */
  handleDrop(e) {
    e.preventDefault();
    if (!this.state.selectedDisk) return;
    
    const targetTower = e.currentTarget;
    this.processMove(targetTower);
  }

  /**
   * Handle tower click
   */
  handleTowerClick(tower) {
    // If no disk is selected, try to select the top disk from this tower
    if (!this.state.selectedDisk) {
      const stack = tower.querySelector('.disks-stack');
      const topDisk = stack.lastElementChild;
      
      if (topDisk) {
        this.state.selectedDisk = topDisk;
        this.state.selectedTower = tower;
        topDisk.classList.add('selected');
        this.highlightValidTowers();
      }
      return;
    }
    
    // If a disk is already selected, try to move it to this tower
    this.processMove(tower);
  }

  /**
   * Handle touch start event
   */
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (!element || !element.classList.contains('disk')) return;
    
    const disk = element;
    const stack = disk.parentElement;
    
    // Only allow top disk to be selected
    if (disk !== stack.lastElementChild) return;
    
    this.state.selectedDisk = disk;
    this.state.selectedTower = stack.parentElement;
    disk.classList.add('selected');
    
    this.highlightValidTowers();
  }

  /**
   * Handle touch end event
   */
  handleTouchEnd(e) {
    if (!this.state.selectedDisk) return;
    
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetTower = element ? element.closest('.tower-container') : null;
    
    if (!targetTower || targetTower === this.state.selectedTower) {
      this.cleanupSelection();
      return;
    }
    
    this.processMove(targetTower);
  }

  /**
   * Highlight valid towers for move
   */
  highlightValidTowers() {
    if (!this.dom.towers) return;
    
    this.dom.towers.forEach(tower => {
      const isValid = tower !== this.state.selectedTower && 
                     this.isValidMove(this.state.selectedDisk, tower);
      
      tower.classList.toggle('highlight', isValid);
    });
  }

  /**
   * Check if a move is valid
   */
  isValidMove(disk, targetTower) {
    if (!disk || !targetTower || this.state.selectedTower === targetTower) return false;
    
    const stack = targetTower.querySelector('.disks-stack');
    if (!stack) return false;
    
    const topDisk = stack.lastElementChild;
    
    // Can move if tower is empty or selected disk is smaller than top disk
    return !topDisk || parseInt(disk.dataset.size) < parseInt(topDisk.dataset.size);
  }

  /**
   * Process a disk move
   */
  processMove(targetTower) {
    if (!this.state.selectedDisk || !targetTower) return;
    
    if (!this.isValidMove(this.state.selectedDisk, targetTower)) {
      // Show invalid move animation
      targetTower.classList.add('invalid');
      setTimeout(() => {
        targetTower.classList.remove('invalid');
      }, 300);
      this.cleanupSelection();
      return;
    }
    
    // Start timer on first move
    if (this.state.moveCount === 0) {
      this.startTimer();
    }
    
    // Record the move for undo functionality
    const fromTower = this.state.selectedTower;
    const disk = this.state.selectedDisk;
    
    // Save move in history
    this.state.moveHistory.push({
      disk: disk.dataset.size,
      from: fromTower.dataset.tower,
      to: targetTower.dataset.tower
    });
    
    // Enable undo button
    if (this.dom.undoBtn) {
      this.dom.undoBtn.disabled = false;
    }
    
    // Play sound effect
    this.playSound(this.dom.moveSound);
    
    // Move the disk
    const stack = targetTower.querySelector('.disks-stack');
    stack.appendChild(this.state.selectedDisk);
    
    // Update move counter and UI
    this.state.moveCount++;
    this.updateUI();
    this.cleanupSelection();
    
    // Check if the player has won
    this.checkWin();
  }

  /**
   * Clean up after a disk selection or move
   */
  cleanupSelection() {
    if (this.state.selectedDisk) {
      this.state.selectedDisk.classList.remove('dragging', 'selected');
      this.state.selectedDisk = null;
    }
    
    this.state.selectedTower = null;
    
    // Remove highlights from towers
    if (this.dom.towers) {
      this.dom.towers.forEach(tower => {
        tower.classList.remove('highlight', 'invalid');
      });
    }
  }

  /**
   * Check if the player has won the level
   */
  checkWin() {
    // Third tower (index 2) should have all disks
    const lastTower = this.dom.towers[2];
    if (!lastTower) return;
    
    const stack = lastTower.querySelector('.disks-stack');
    if (!stack) return;
    
    // Win condition: last tower has all disks
    if (stack.children.length === this.state.totalDisks) {
      this.stopTimer();
      this.playSound(this.dom.winSound);
      
      // Add win animations
      lastTower.classList.add('win-tower');
      Array.from(stack.children).forEach(disk => {
        disk.classList.add('win-animation');
      });
      
      // Create victory effects
      this.createVictoryEffects();
      
      // Calculate statistics
      const optimal = Math.pow(2, this.state.totalDisks) - 1;
      const efficiency = Math.round((optimal / this.state.moveCount) * 100);
      
      // Save high score
      this.saveHighScore();
      
      // Update player progress
      if (!this.state.progress.completedLevels.includes(this.state.level)) {
        this.state.progress.completedLevels.push(this.state.level);
        
        // Update highest level if needed
        if (this.state.level === this.state.progress.highestLevel && 
            this.state.level < (this.config.maxDisks - this.config.minDisks + 1)) {
          this.state.progress.highestLevel++;
        }
        
        // Save progress to local storage
        localStorage.setItem('hanoiProgress', JSON.stringify(this.state.progress));
      }
      
      // Show win modal after a brief delay
      setTimeout(() => {
        // Set values in win modal
        if (this.dom.winLevel) {
          this.dom.winLevel.textContent = this.state.level;
        }
        if (this.dom.winMoves) {
          this.dom.winMoves.textContent = this.state.moveCount;
        }
        if (this.dom.winTime) {
          this.dom.winTime.textContent = this.formatTime(this.state.timeElapsed);
        }
        if (this.dom.winOptimal) {
          this.dom.winOptimal.textContent = optimal;
        }
        if (this.dom.winEfficiency) {
          this.dom.winEfficiency.textContent = efficiency;
        }
        
        // Show win modal and set up its event listeners
        this.dom.winModal.style.display = 'block';
        this.setupWinModalListeners();
      }, 1000);
    }
  }

  /**
   * Create victory visual effects
   */
  createVictoryEffects() {
    const colors = ['#ff5252', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.opacity = Math.random() * 0.7 + 0.3;
      confetti.style.setProperty('--start-left', confetti.style.left);
      
      // Use different fall animations
      const fallType = Math.floor(Math.random() * 3);
      if (fallType === 0) {
        confetti.style.animation = `confetti-fall ${Math.random() * 2 + 1}s forwards`;
      } else if (fallType === 1) {
        confetti.style.animation = `confetti-fall-left ${Math.random() * 2 + 1}s forwards`;
      } else {
        confetti.style.animation = `confetti-fall-right ${Math.random() * 2 + 1}s forwards`;
      }
      
      document.body.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode === document.body) {
          document.body.removeChild(confetti);
        }
      }, 3000);
    }
  }

  /**
   * Save high score for current level
   */
  saveHighScore() {
    if (!this.state.playerName) return;
    
    const levelKey = `level${this.state.level}`;
    const score = {
      playerName: this.state.playerName,
      moves: this.state.moveCount,
      time: this.state.timeElapsed,
      date: new Date().toISOString()
    };
    
    // Load current high scores
    let highScores = this.state.highScores || {};
    
    // Initialize level scores if needed
    if (!highScores[levelKey]) {
      highScores[levelKey] = [];
    }
    
    // Add new score
    highScores[levelKey].push(score);
    
    // Sort by moves then time
    highScores[levelKey].sort((a, b) => {
      if (a.moves !== b.moves) {
        return a.moves - b.moves;
      }
      return a.time - b.time;
    });
    
    // Keep top 10 scores
    highScores[levelKey] = highScores[levelKey].slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('hanoiHighScores', JSON.stringify(highScores));
    this.state.highScores = highScores;
  }

  /**
   * Undo the last move
   */
  undoMove() {
    if (this.state.moveHistory.length === 0) return;
    
    // Get the last move from history
    const lastMove = this.state.moveHistory.pop();
    
    // Find source and target towers
    const toTower = this.dom.towers[parseInt(lastMove.from) - 1];
    const fromTower = this.dom.towers[parseInt(lastMove.to) - 1];
    
    if (!fromTower || !toTower) return;
    
    // Find the disk (should be the top disk of the from tower)
    const fromStack = fromTower.querySelector('.disks-stack');
    const disk = fromStack.lastElementChild;
    
    if (!disk || parseInt(disk.dataset.size) !== parseInt(lastMove.disk)) {
      console.error('Undo error: Disk mismatch');
      return;
    }
    
    // Move disk back to original tower
    const toStack = toTower.querySelector('.disks-stack');
    toStack.appendChild(disk);
    
    // Play sound
    this.playSound(this.dom.moveSound);
    
    // Update UI
    this.updateUI();
    
    // Disable undo button if no more moves to undo
    if (this.state.moveHistory.length === 0 && this.dom.undoBtn) {
      this.dom.undoBtn.disabled = true;
    }
  }

  /**
   * Go to previous level
   */
  prevLevel() {
    if (this.state.level > 1) {
      this.state.level--;
      this.state.totalDisks--;
      this.setupLevel(this.state.totalDisks);
    }
  }

  /**
   * Go to next level
   */
  nextLevel() {
    const maxLevel = this.config.maxDisks - this.config.minDisks + 1;
    if (this.state.level < maxLevel) {
      this.state.level++;
      this.state.totalDisks++;
      this.setupLevel(this.state.totalDisks);
    }
  }

  /**
   * Reset current level
   */
  resetLevel() {
    this.setupLevel(this.state.totalDisks);
  }

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    if (this.dom.soundToggleBtn) {
      this.dom.soundToggleBtn.textContent = this.state.soundEnabled ? '🔊' : '🔇';
    }
  }

  /**
   * Start the game timer
   */
  startTimer() {
    if (this.state.timerRunning) return;
    
    this.state.timerRunning = true;
    const startTime = Date.now() - this.state.timeElapsed;
    
    this.state.timerInterval = setInterval(() => {
      this.state.timeElapsed = Date.now() - startTime;
      this.updateTimerDisplay();
    }, 100);
  }

  /**
   * Stop the game timer
   */
  stopTimer() {
    if (!this.state.timerRunning) return;
    
    this.state.timerRunning = false;
    clearInterval(this.state.timerInterval);
    this.state.timerInterval = null;
  }

  /**
   * Reset the game timer
   */
  resetTimer() {
    this.stopTimer();
    this.state.timeElapsed = 0;
    this.updateTimerDisplay();
  }

  /**
   * Update the timer display
   */
  updateTimerDisplay() {
    if (!this.dom.timer) return;
    
    const seconds = Math.floor(this.state.timeElapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    
    this.dom.timer.textContent = 
      `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format milliseconds as MM:SS
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Show the leaderboard modal
   */
  showLeaderboardModal() {
    if (!this.dom.leaderboardModal) return;
    
    // Hide all other modals and screens except game screen
    this.dom.welcomeModal.style.display = 'none';
    this.dom.winModal.style.display = 'none';
    this.dom.levelSelectionModal.style.display = 'none';
    this.dom.gameCompletionModal.style.display = 'none';
    
    // Update player name in leaderboard
    if (this.dom.currentPlayerName) {
      this.dom.currentPlayerName.textContent = this.state.playerName || 'Player';
    }
    
    // Populate level selection dropdown
    if (this.dom.leaderboardLevelSelect) {
      this.dom.leaderboardLevelSelect.innerHTML = '';
      
      const totalLevels = this.config.maxDisks - this.config.minDisks + 1;
      for (let i = 1; i <= totalLevels; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Level ${i} (${this.config.minDisks + i - 1} disks)`;
        
        this.dom.leaderboardLevelSelect.appendChild(option);
      }
      
      // Set current level as selected
      this.dom.leaderboardLevelSelect.value = this.state.level;
    }
    
    // Display scores for current level
    this.displayLeaderboardScores(this.state.level);
    
    // Show the leaderboard modal
    this.dom.leaderboardModal.style.display = 'block';
    
    // Set up event listeners
    this.setupLeaderboardModalListeners();
  }

  /**
   * Display leaderboard scores for a specific level
   */
  displayLeaderboardScores(level) {
    if (!this.dom.leaderboardBody) return;
    
    // Clear previous scores
    this.dom.leaderboardBody.innerHTML = '';
    
    const levelKey = `level${level}`;
    const scores = this.state.highScores[levelKey] || [];
    
    if (scores.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5" style="text-align: center;">No scores yet for this level</td>';
      this.dom.leaderboardBody.appendChild(row);
      return;
    }
    
    // Display scores
    scores.forEach((score, index) => {
      const row = document.createElement('tr');
      
      // Highlight current player's scores
      if (score.playerName === this.state.playerName) {
        row.className = 'highlight-row';
      }
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${score.playerName}</td>
        <td>${score.moves}</td>
        <td>${this.formatTime(score.time)}</td>
        <td>${new Date(score.date).toLocaleDateString()}</td>
      `;
      
      this.dom.leaderboardBody.appendChild(row);
    });
  }

  /**
   * Show the level selection modal
   */
  showLevelSelectionModal() {
    if (!this.dom.levelSelectionModal || !this.dom.levelsGrid) return;
    
    // Hide all other modals and screens except game screen
    this.dom.welcomeModal.style.display = 'none';
    this.dom.winModal.style.display = 'none';
    this.dom.leaderboardModal.style.display = 'none';
    this.dom.gameCompletionModal.style.display = 'none';
    
    // Clear previous grid
    this.dom.levelsGrid.innerHTML = '';
    
    // Generate level cards
    const totalLevels = this.config.maxDisks - this.config.minDisks + 1;
    
    for (let i = 1; i <= totalLevels; i++) {
      const disks = this.config.minDisks + i - 1;
      const isCompleted = this.state.progress.completedLevels.includes(i);
      const isCurrent = i === this.state.progress.highestLevel;
      const isLocked = i > this.state.progress.highestLevel;
      
      const card = document.createElement('div');
      card.className = `level-card${isCompleted ? ' completed' : ''}${isCurrent ? ' current' : ''}${isLocked ? ' locked' : ''}`;
      
      const content = `
        <div class="level-number">${i}</div>
        <div class="level-status">${disks} disks</div>
        ${isCompleted ? '<div class="level-status">✓ Completed</div>' : ''}
        ${isCurrent && !isCompleted ? '<div class="level-status">Current</div>' : ''}
        ${isLocked ? '<div class="lock-icon">🔒</div>' : ''}
      `;
      
      card.innerHTML = content;
      
      if (!isLocked) {
        // Use closure to capture correct values
        ((levelNum, diskCount) => {
          card.addEventListener('click', () => {
            this.playSound(this.dom.selectSound);
            this.state.level = levelNum;
            this.state.totalDisks = diskCount;
            this.dom.levelSelectionModal.style.display = 'none';
            this.showGameScreen();
            this.setupLevel(this.state.totalDisks);
          });
        })(i, disks);
      }
      
      this.dom.levelsGrid.appendChild(card);
    }
    
    // Show the modal
    this.dom.levelSelectionModal.style.display = 'block';
    
    // Set up event listeners
    this.setupLevelSelectionModalListeners();
  }

  /**
   * Show the game completion modal
   */
  showGameCompletionModal() {
    if (!this.dom.gameCompletionModal) return;
    
    // Update player name
    if (this.dom.completionPlayerName) {
      this.dom.completionPlayerName.textContent = this.state.playerName || 'Player';
    }
    
    // Clear previous stats
    if (this.dom.completionTableBody) {
      this.dom.completionTableBody.innerHTML = '';
    
      // Populate stats for all levels
      const totalLevels = this.config.maxDisks - this.config.minDisks + 1;
      let totalEfficiency = 0;
      let completedLevels = 0;
      
      for (let i = 1; i <= totalLevels; i++) {
        const levelKey = `level${i}`;
        // Find best score for this player
        const scores = this.state.highScores[levelKey] || [];
        const playerScores = scores.filter(score => score.playerName === this.state.playerName);
        
        if (playerScores.length > 0) {
          // Show best score (already sorted)
          const bestScore = playerScores[0];
          const disks = this.config.minDisks + i - 1;
          const optimal = Math.pow(2, disks) - 1;
          const efficiency = Math.round((optimal / bestScore.moves) * 100);
          
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${i}</td>
            <td>${bestScore.moves}</td>
            <td>${optimal}</td>
            <td>${efficiency}%</td>
            <td>${this.formatTime(bestScore.time)}</td>
          `;
          
          this.dom.completionTableBody.appendChild(row);
          
          totalEfficiency += efficiency;
          completedLevels++;
        } else {
          // No score for this level
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${i}</td>
            <td colspan="4">Not completed</td>
          `;
          
          this.dom.completionTableBody.appendChild(row);
        }
      }
    }
    
    // Play completion sound
    this.playSound(this.dom.gameCompleteSound);
    
    // Show the modal
    this.dom.gameCompletionModal.style.display = 'block';
    
    // Set up event listeners
    this.setupGameCompletionModalListeners();
  }

  /**
   * Show welcome modal
   */
  showWelcomeModal() {
    this.hideAllScreens();
    
    if (this.dom.welcomeModal) {
      this.dom.welcomeModal.style.display = 'block';
      
      // Focus on input field
      if (this.dom.playerNameInput) {
        this.dom.playerNameInput.value = '';
        this.dom.playerNameInput.focus();
      }
      
      // Set up event listeners
      this.setupWelcomeModalListeners();
    }
    
    this.state.currentScreen = 'welcome';
  }

  /**
   * Show home screen
   */
  showHomeScreen() {
    this.hideAllScreens();
    
    if (this.dom.homeScreen) {
      this.dom.homeScreen.style.display = 'flex';
      
      // Update player name
      this.updatePlayerNameDisplay();
      
      // Set up event listeners
      this.setupHomeScreenListeners();
    }
    
    this.state.currentScreen = 'home';
  }

  /**
   * Show game screen
   */
  showGameScreen() {
    this.hideAllScreens();
    
    if (this.dom.gameScreen) {
      this.dom.gameScreen.style.display = 'flex';
      
      // Update player name
      this.updatePlayerNameDisplay();
    }
    
    this.state.currentScreen = 'game';
  }

  /**
   * Hide all screens and modals
   */
  hideAllScreens() {
    // Hide all screens
    if (this.dom.loadingScreen) this.dom.loadingScreen.style.display = 'none';
    if (this.dom.homeScreen) this.dom.homeScreen.style.display = 'none';
    if (this.dom.gameScreen) this.dom.gameScreen.style.display = 'none';
    
    // Hide all modals
    if (this.dom.welcomeModal) this.dom.welcomeModal.style.display = 'none';
    if (this.dom.leaderboardModal) this.dom.leaderboardModal.style.display = 'none';
    if (this.dom.winModal) this.dom.winModal.style.display = 'none';
    if (this.dom.levelSelectionModal) this.dom.levelSelectionModal.style.display = 'none';
    if (this.dom.gameCompletionModal) this.dom.gameCompletionModal.style.display = 'none';
  }

  /**
   * Show a specific screen by ID
   */
  showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.style.display = screenId === 'homeScreen' ? 'flex' : 'block';
    }
  }

  /**
   * Play a sound effect
   */
  playSound(audioElement) {
    try {
      if (audioElement && this.state.soundEnabled) {
        audioElement.currentTime = 0;
        const playPromise = audioElement.play();
        
        // Handle autoplay restrictions gracefully
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // No need to handle error, just catch to avoid unhandled promise rejection
          });
        }
      }
    } catch (error) {
      // Silently handle sound play error
    }
  }

  /**
   * Safely add event listener to an element
   * First clones the element to remove any existing listeners
   */
  safeAddEventListener(element, eventType, callback) {
    if (!element) return;
    
    // Clone the element to remove existing listeners
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    
    // Add the event listener to the new element
    newElement.addEventListener(eventType, callback);
    
    // Update the reference in the DOM object
    const elementId = newElement.id;
    if (elementId) {
      // Find which property in this.dom references this element
      Object.keys(this.dom).forEach(key => {
        if (this.dom[key] === element) {
          this.dom[key] = newElement;
        }
      });
    }
    
    return newElement;
  }
}

// Initialize the game when the script loads
document.addEventListener('DOMContentLoaded', () => {
  window.hanoiGame = new HanoiGame();
});
