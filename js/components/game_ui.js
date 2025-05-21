/**
 * Tower of Hanoi - UI Functionality
 * Handles the user interface interactions, event listeners and screen transitions
 */

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Welcome modal
    if (domElements.startGameBtn) {
        domElements.startGameBtn.addEventListener('click', handleStartGame);
    }

    if (domElements.playerNameInput) {
        domElements.playerNameInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') handleStartGame();
        });
    }

    // Home screen
    if (domElements.playBtn) {
        domElements.playBtn.addEventListener('click', () => {
            playSound(domElements.selectSound);
            startGame();
        });
    }

    if (domElements.levelsBtn) {
        domElements.levelsBtn.addEventListener('click', () => {
            playSound(domElements.selectSound);
            showLevelSelection();
        });
    }

    if (domElements.homeLeaderboardBtn) {
        domElements.homeLeaderboardBtn.addEventListener('click', () => {
            playSound(domElements.selectSound);
            showLeaderboardModal(gameState.currentLevel);
        });
    }

    if (domElements.homeSoundToggleBtn) {
        domElements.homeSoundToggleBtn.addEventListener('click', toggleSound);
    }

    if (domElements.changePlayerHomeBtn) {
        domElements.changePlayerHomeBtn.addEventListener('click', () => {
            playSound(domElements.selectSound);
            showSwitchUserModal();
        });
    }

    // About button
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            playSound(domElements.selectSound);
            showAboutModal();
        });
    }

    // Close About modal
    const closeAboutBtn = document.getElementById('closeAboutBtn');
    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', () => {
            document.getElementById('aboutModal').style.display = 'none';
        });
    }

    // Game screen
    if (domElements.backToHomeBtn) {
        domElements.backToHomeBtn.addEventListener('click', goToHome);
    }

    if (domElements.gameOptionsBtn) {
        domElements.gameOptionsBtn.addEventListener('click', toggleSettingsPanel);
    }

    if (domElements.resetBtn) {
        domElements.resetBtn.addEventListener('click', resetLevel);
    }

    // Remove undo button functionality - keep it in the DOM but hide it
    if (domElements.undoBtn) {
        domElements.undoBtn.style.display = 'none';
    }

    if (domElements.prevLevelBtn) {
        domElements.prevLevelBtn.addEventListener('click', () => {
            if (gameState.currentLevel > 1) {
                // Can always go back to previous level
                changeLevel(-1);
            }
        });
    }

    if (domElements.nextLevelBtn) {
        domElements.nextLevelBtn.addEventListener('click', () => {
            // Only allow next level if current is completed or user confirms
            if (canAdvanceToNextLevel()) {
                changeLevel(1);
            } else {
                showTooltip(domElements.nextLevelBtn, "Please clear this level first");
            }
        });
    }

    // Win modal
    if (domElements.nextLevelBtn2) {
        domElements.nextLevelBtn2.addEventListener('click', () => {
            domElements.winModal.style.display = 'none';
            changeLevel(1); // Advance to next level
        });
    }

    if (domElements.stayBtn) {
        domElements.stayBtn.addEventListener('click', () => {
            domElements.winModal.style.display = 'none';
        });
    }

    if (domElements.backToHomeBtn2) {
        domElements.backToHomeBtn2.addEventListener('click', () => {
            domElements.winModal.style.display = 'none';
            goToHome();
        });
    }

    // Leaderboard modal
    if (domElements.closeLeaderboardBtn) {
        domElements.closeLeaderboardBtn.addEventListener('click', () => {
            domElements.leaderboardModal.style.display = 'none';
        });
    }

    if (domElements.leaderboardLevelSelect) {
        domElements.leaderboardLevelSelect.addEventListener('change', () => {
            const selectedLevel = parseInt(domElements.leaderboardLevelSelect.value);
            displayLeaderboard(selectedLevel);
        });
    }

    // Level selection modal
    if (domElements.closeLevelsBtn) {
        domElements.closeLevelsBtn.addEventListener('click', () => {
            domElements.levelSelectionModal.style.display = 'none';
        });
    }

    // Game completion modal
    if (domElements.playAgainBtn) {
        domElements.playAgainBtn.addEventListener('click', () => {
            domElements.gameCompletionModal.style.display = 'none';
            gameState.currentLevel = 1;
            startGame();
        });
    }

    if (domElements.backToHomeBtn3) {
        domElements.backToHomeBtn3.addEventListener('click', () => {
            domElements.gameCompletionModal.style.display = 'none';
            goToHome();
        });
    }

    // Setup tower click and drag events
    setupTowerEvents();

    // Global keyboard shortcuts for accessibility
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Setup events for the towers (drag-and-drop and click handling)
 */
function setupTowerEvents() {
    if (!domElements.towerContainers) return;

    domElements.towerContainers.forEach(tower => {
        // Drag over event
        tower.addEventListener('dragover', e => {
            e.preventDefault();

            if (gameState.selectedDisk) {
                if (isValidMove(gameState.selectedDisk, tower)) {
                    tower.classList.add('highlight');
                } else {
                    tower.classList.add('invalid');
                    setTimeout(() => tower.classList.remove('invalid'), 300);
                }
            }
        });

        // Drag leave event
        tower.addEventListener('dragleave', () => {
            tower.classList.remove('highlight');
        });

        // Drop event
        tower.addEventListener('drop', e => {
            e.preventDefault();

            // Remove highlights
            domElements.towerContainers.forEach(t => {
                t.classList.remove('highlight');
                t.classList.remove('invalid');
            });

            if (gameState.selectedDisk) {
                const targetTower = tower;
                const sourceTower = gameState.selectedDisk.closest('.tower-container');

                if (isValidMove(gameState.selectedDisk, targetTower)) {
                    // Process the move if it's valid
                    processDiskMove(gameState.selectedDisk, targetTower);
                }

                // Reset selection
                gameState.selectedDisk.classList.remove('selected');
                gameState.selectedDisk = null;
            }
        });

        // Click event (for mobile/touch support)
        tower.addEventListener('click', () => {
            const disksStack = tower.querySelector('.disks-stack');

            if (!gameState.selectedDisk) {
                // If no disk is selected, try to select the top disk
                const topDisk = disksStack.lastElementChild;

                if (topDisk) {
                    gameState.selectedDisk = topDisk;
                    topDisk.classList.add('selected');
                    playSound(domElements.selectSound);

                    // Highlight valid target towers
                    highlightValidTowers();
                }
            } else {
                // If a disk is already selected, try to move it here
                if (isValidMove(gameState.selectedDisk, tower)) {
                    processDiskMove(gameState.selectedDisk, tower);
                } else {
                    // Invalid move - show feedback
                    tower.classList.add('invalid');
                    setTimeout(() => tower.classList.remove('invalid'), 300);
                }

                // Clean up selection
                domElements.towerContainers.forEach(t => t.classList.remove('highlight'));
                gameState.selectedDisk.classList.remove('selected');
                gameState.selectedDisk = null;
            }
        });
    });

    // Global drag events
    document.addEventListener('dragstart', e => {
        if (e.target.classList.contains('disk')) {
            const tower = e.target.closest('.tower-container');
            const stack = tower.querySelector('.disks-stack');

            // Only allow top disk to be dragged
            if (e.target !== stack.lastElementChild) {
                e.preventDefault();
                return;
            }

            gameState.selectedDisk = e.target;
            gameState.selectedDisk.classList.add('selected');
            playSound(domElements.selectSound);

            // Highlight valid towers
            highlightValidTowers();
        }
    });

    document.addEventListener('dragend', () => {
        if (gameState.selectedDisk) {
            gameState.selectedDisk.classList.remove('selected');
            gameState.selectedDisk = null;
        }

        // Remove highlights
        domElements.towerContainers.forEach(t => {
            t.classList.remove('highlight');
            t.classList.remove('invalid');
        });
    });
}

/**
 * Handle the start game button click
 */
function handleStartGame() {
    if (!domElements.playerNameInput) return;

    const name = domElements.playerNameInput.value.trim();

    if (name.length < 1) {
        // No name provided
        domElements.playerNameInput.classList.add('invalid');
        setTimeout(() => domElements.playerNameInput.classList.remove('invalid'), 500);
        return;
    }

    // Save player name
    gameState.playerName = name;
    localStorage.setItem('playerName', name);

    // Update UI
    updatePlayerNameDisplay();

    // Close modal and go to home screen
    domElements.welcomeModal.style.display = 'none';
    domElements.homeScreen.style.display = 'flex';
}

/**
 * Start the game
 */
function startGame() {
    // Hide home screen and show game screen
    domElements.homeScreen.style.display = 'none';
    domElements.gameScreen.style.display = 'flex';

    // Show keyboard shortcut hint
    showKeyboardShortcutHint();

    // Set up the current level
    setupLevel(gameState.currentLevel);
}

/**
 * Set up a level
 */
function setupLevel(level) {
    if (level < 1) level = 1;
    if (level > gameState.maxLevel) level = gameState.maxLevel;

    gameState.currentLevel = level;
    resetGameState();

    // Calculate disk count based on level
    const diskCount = gameState.minDisks + level - 1;

    // Update UI
    domElements.levelDisplay.textContent = level;
    domElements.moveCounter.textContent = '0';
    domElements.optimalMoves.textContent = Math.pow(2, diskCount) - 1;

    // Clear all towers
    domElements.towerContainers.forEach(tower => {
        const stack = tower.querySelector('.disks-stack');
        if (stack) stack.innerHTML = '';
    });

    // Create disks on the first tower
    const firstTower = domElements.towerContainers[0].querySelector('.disks-stack');
    if (firstTower) {
        for (let i = diskCount; i >= 1; i--) {
            const disk = createDisk(i, diskCount);
            firstTower.appendChild(disk);
        }
    }

    // Set navigation button states
    domElements.prevLevelBtn.disabled = level <= 1;

    // Lock next level button until current level is completed
    // (unless the level is already completed)
    const isLevelCompleted = gameState.completedLevels.includes(level);
    domElements.nextLevelBtn.disabled = !isLevelCompleted;

    if (!isLevelCompleted) {
        domElements.nextLevelBtn.classList.add('locked');
        domElements.nextLevelBtn.title = "Complete this level first";
    } else {
        domElements.nextLevelBtn.classList.remove('locked');
        domElements.nextLevelBtn.title = "";
    }

    // Start the timer
    startTimer();
}

/**
 * Create a disk element
 */
function createDisk(value, totalDisks) {
    const disk = document.createElement('div');
    disk.className = 'disk';
    disk.setAttribute('data-value', value);

    // Calculate disk width based on value
    const minWidth = 45; // percent for smallest disk
    const maxWidth = 90; // percent for largest disk
    const width = minWidth + ((maxWidth - minWidth) * ((value - 1) / (totalDisks - 1)));
    disk.style.width = `${width}%`;

    // Set disk color - use a gradient based on hue
    const hue = Math.floor(240 * (value / totalDisks));
    disk.style.background = `linear-gradient(to right, hsl(${hue}, 70%, 50%), hsl(${hue}, 60%, 60%))`;

    // Set disk number/label
    disk.textContent = value;

    // Make disk draggable
    disk.draggable = true;

    return disk;
}

/**
 * Check if a move is valid according to Tower of Hanoi rules
 */
function isValidMove(disk, targetTower) {
    if (!disk || !targetTower) return false;

    // Can't move to the same tower
    const sourceTower = disk.closest('.tower-container');
    if (sourceTower === targetTower) return false;

    // Get the top disk of the target tower
    const targetStack = targetTower.querySelector('.disks-stack');
    const topDisk = targetStack.lastElementChild;

    // If target tower is empty, move is valid
    if (!topDisk) return true;

    // Compare disk sizes (data-value)
    const movingDiskValue = parseInt(disk.getAttribute('data-value'));
    const topDiskValue = parseInt(topDisk.getAttribute('data-value'));

    // Move is valid if moving disk is smaller than top disk
    return movingDiskValue < topDiskValue;
}

/**
 * Highlight valid towers for the selected disk
 */
function highlightValidTowers() {
    if (!gameState.selectedDisk) return;

    domElements.towerContainers.forEach(tower => {
        // Only highlight valid target towers
        if (isValidMove(gameState.selectedDisk, tower)) {
            tower.classList.add('highlight');
        }
    });
}

/**
 * Show a tooltip near an element
 */
function showTooltip(element, message) {
    // Remove any existing tooltips
    const oldTooltip = document.querySelector('.game-tooltip');
    if (oldTooltip) oldTooltip.remove();

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'game-tooltip';
    tooltip.textContent = message;

    // Position near the element
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2)}px`;

    // Add to DOM
    document.body.appendChild(tooltip);

    // Remove after delay
    setTimeout(() => {
        if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    }, 2000);
}

/**
 * Toggle game sound
 */
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;

    // Update localStorage
    localStorage.setItem('soundEnabled', gameState.soundEnabled.toString());

    // Update button text
    if (domElements.homeSoundToggleBtn) {
        domElements.homeSoundToggleBtn.textContent =
            gameState.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
    }

    // Play a test sound if turning on
    if (gameState.soundEnabled) {
        playSound(domElements.selectSound);
    }
}

/**
 * Show user switch modal
 */
function showSwitchUserModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('switchUserModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'switchUserModal';
        modal.className = 'modal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        content.innerHTML = `
      <h2>Switch User</h2>
      <p>Enter a new username to continue:</p>
      <input type="text" id="newUsernameInput" maxlength="15" placeholder="New Username">
      <div class="bottom-buttons">
        <button id="confirmUsernameBtn" class="primary-btn">Confirm</button>
        <button id="cancelSwitchBtn">Cancel</button>
      </div>
    `;

        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    // Show modal
    modal.style.display = 'block';

    // Set up event listeners
    const input = document.getElementById('newUsernameInput');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);

        input.addEventListener('keyup', e => {
            if (e.key === 'Enter') {
                document.getElementById('confirmUsernameBtn').click();
            }
        });
    }

    document.getElementById('confirmUsernameBtn').addEventListener('click', () => {
        const newName = input.value.trim();

        if (newName.length < 1) {
            input.classList.add('invalid');
            setTimeout(() => input.classList.remove('invalid'), 500);
            return;
        }

        // Update username
        gameState.playerName = newName;
        localStorage.setItem('playerName', newName);

        // Update displays
        updatePlayerNameDisplay();

        // Close modal
        modal.style.display = 'none';
    });

    document.getElementById('cancelSwitchBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

/**
 * Go back to home screen from game
 */
function goToHome() {
    // Stop the timer
    stopTimer();

    // Hide game screen and show home screen
    domElements.gameScreen.style.display = 'none';
    domElements.homeScreen.style.display = 'flex';
}

/**
 * Check if player can advance to next level
 */
function canAdvanceToNextLevel() {
    // Level is already completed - can advance
    if (gameState.completedLevels.includes(gameState.currentLevel)) {
        return true;
    }

    // Current level is won - can advance
    if (gameState.isGameWon) {
        return true;
    }

    // Otherwise, can't advance
    return false;
}

/**
 * Change to a different level
 */
function changeLevel(direction) {
    const newLevel = gameState.currentLevel + direction;

    // Validate level range
    if (newLevel < 1 || newLevel > gameState.maxLevel) {
        return false;
    }

    // Update level and set it up
    gameState.currentLevel = newLevel;
    setupLevel(newLevel);
    return true;
}

/**
 * Reset current level
 */
function resetLevel() {
    setupLevel(gameState.currentLevel);

    // Animate reset button
    domElements.resetBtn.classList.add('button-pulse');
    setTimeout(() => domElements.resetBtn.classList.remove('button-pulse'), 300);
}

/**
 * Toggle settings panel
 */
function toggleSettingsPanel() {
    // Create panel if it doesn't exist
    let panel = document.getElementById('settingsPanel');

    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'settingsPanel';
        panel.className = 'settings-panel';

        panel.innerHTML = `
      <div class="settings-header">
        <h3>Settings</h3>
        <button id="closeSettings" class="close-btn">&times;</button>
      </div>
      <div class="settings-content">
        <div class="setting-item">
          <label>Sound</label>
          <label class="switch">
            <input type="checkbox" id="soundToggle" ${gameState.soundEnabled ? 'checked' : ''}>
            <span class="slider round"></span>
          </label>
        </div>
        <div class="setting-item">
          <label>Dark Theme</label>
          <label class="switch">
            <input type="checkbox" id="themeToggle" ${gameState.darkTheme ? 'checked' : ''}>
            <span class="slider round"></span>
          </label>
        </div>
      </div>
    `;

        document.body.appendChild(panel);

        // Set up event listeners
        document.getElementById('closeSettings').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        document.getElementById('soundToggle').addEventListener('change', (e) => {
            gameState.soundEnabled = e.target.checked;
            localStorage.setItem('soundEnabled', e.target.checked.toString());

            // Update home screen button
            if (domElements.homeSoundToggleBtn) {
                domElements.homeSoundToggleBtn.textContent =
                    gameState.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
            }

            // Play test sound if turning on
            if (gameState.soundEnabled) {
                playSound(domElements.selectSound);
            }
        });

        document.getElementById('themeToggle').addEventListener('change', (e) => {
            toggleTheme(e.target.checked);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (panel.style.display !== 'none' &&
                !panel.contains(e.target) &&
                e.target.id !== 'gameOptionsBtn') {
                panel.style.display = 'none';
            }
        });
    }

    // Toggle visibility
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

/**
 * Show the About modal
 */
function showAboutModal() {
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal) {
        aboutModal.style.display = 'block';
    }
}

/**
 * Handle keyboard shortcuts for accessibility
 */
function handleKeyboardShortcuts(e) {
    // ESC key closes any open modal
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="display: block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
        });

        // Also close settings panel if open
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel && settingsPanel.style.display === 'block') {
            settingsPanel.style.display = 'none';
        }
    }

    // Only handle other shortcuts if in game screen
    if (domElements.gameScreen.style.display !== 'flex') return;

    // R key to reset level
    if (e.key === 'r' || e.key === 'R') {
        resetLevel();
    }

    // Arrow keys for previous/next level
    if (e.key === 'ArrowLeft' && gameState.currentLevel > 1) {
        changeLevel(-1);
    }

    if (e.key === 'ArrowRight' && canAdvanceToNextLevel()) {
        changeLevel(1);
    }

    // H key to go home
    if (e.key === 'h' || e.key === 'H') {
        goToHome();
    }

    // T key to toggle theme
    if (e.key === 't' || e.key === 'T') {
        toggleTheme();
    }
}

/**
 * Show a tooltip with keyboard shortcut hints
 */
function showKeyboardShortcutHint() {
    // Create hint element if it doesn't exist
    let hint = document.getElementById('keyboardHint');

    if (!hint) {
        hint = document.createElement('div');
        hint.id = 'keyboardHint';
        hint.className = 'keyboard-hint';
        hint.innerHTML = 'Keyboard shortcuts: <strong>R</strong> (Reset), <strong>H</strong> (Home), <strong>T</strong> (Theme)';

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'hint-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            hint.style.display = 'none';
            localStorage.setItem('hideKeyboardHint', 'true');
        });

        hint.appendChild(closeBtn);
        document.body.appendChild(hint);
    }

    // Check if user has dismissed it before
    const hideHint = localStorage.getItem('hideKeyboardHint') === 'true';

    if (!hideHint) {
        hint.style.display = 'block';

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (hint.style.display === 'block') {
                hint.style.display = 'none';
            }
        }, 10000);
    }
}