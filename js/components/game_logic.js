/**
 * Tower of Hanoi - Game Logic
 * Core game mechanics and win condition checking
 */

/**
 * Process a disk move from one tower to another
 */
function processDiskMove(disk, targetTower) {
    if (!disk || !targetTower) return false;

    // Get source and target stacks
    const sourceTower = disk.closest('.tower-container');
    const sourceStack = sourceTower.querySelector('.disks-stack');
    const targetStack = targetTower.querySelector('.disks-stack');

    // Animation - set up transition for smooth movement
    disk.classList.add('moving');

    // Remove from source tower
    sourceStack.removeChild(disk);

    // Add to target tower
    targetStack.appendChild(disk);

    // Play sound
    playSound(domElements.moveSound);

    // Increment move counter
    gameState.moves++;
    updateMoveCounter();

    // Animation to highlight move counter
    domElements.moveCounter.parentElement.classList.add('move-counter-change');
    setTimeout(() => {
        domElements.moveCounter.parentElement.classList.remove('move-counter-change');
    }, 300);

    // Check for win
    setTimeout(() => checkWinCondition(), 300);

    // Track movement in history
    gameState.moveHistory.push({
        diskValue: parseInt(disk.getAttribute('data-value')),
        sourceTower: parseInt(sourceTower.getAttribute('data-tower')),
        targetTower: parseInt(targetTower.getAttribute('data-tower'))
    });

    // Enable undo button (disabled since we're removing this feature)
    // if (domElements.undoBtn) domElements.undoBtn.disabled = false;

    return true;
}

/**
 * Update the move counter display
 */
function updateMoveCounter() {
    if (domElements.moveCounter) {
        domElements.moveCounter.textContent = gameState.moves;
    }
}

/**
 * Start the game timer
 */
function startTimer() {
    // Reset and stop any existing timer
    stopTimer();

    // Initialize timer
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;

    // Update timer display immediately
    updateTimerDisplay();

    // Start interval to update timer every second
    gameState.timerInterval = setInterval(() => {
        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

/**
 * Stop the game timer
 */
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    if (domElements.timer) {
        domElements.timer.textContent = formatTime(gameState.elapsedTime);
    }
}

/**
 * Check if the current level is won
 */
function checkWinCondition() {
    // Last tower should contain all disks
    const lastTower = domElements.towerContainers[2]; // 3rd tower (index 2)
    if (!lastTower) return false;

    const stack = lastTower.querySelector('.disks-stack');
    const diskCount = gameState.minDisks + gameState.currentLevel - 1;

    // Win if the last tower has all disks
    if (stack && stack.children.length === diskCount) {
        handleLevelWin();
        return true;
    }

    return false;
}

/**
 * Handle a level win
 */
function handleLevelWin() {
    // Stop the timer
    stopTimer();

    // Set game won flag
    gameState.isGameWon = true;

    // Unlock next level button
    if (domElements.nextLevelBtn) {
        domElements.nextLevelBtn.disabled = false;
        domElements.nextLevelBtn.classList.remove('locked');
        domElements.nextLevelBtn.title = "Go to next level";
    }

    // Mark level as completed if not already
    if (!gameState.completedLevels.includes(gameState.currentLevel)) {
        gameState.completedLevels.push(gameState.currentLevel);

        // Save to localStorage
        localStorage.setItem('completedLevels', JSON.stringify(gameState.completedLevels));
    }

    // Play win sound
    playSound(domElements.winSound);

    // Add win effect to disks in the target tower
    const targetTower = domElements.towerContainers[2];
    targetTower.classList.add('win-tower');

    const disks = targetTower.querySelectorAll('.disk');
    disks.forEach(disk => {
        disk.classList.add('win-animation');
    });

    // Update leaderboard
    updateLeaderboard(gameState.currentLevel, gameState.elapsedTime, gameState.moves);

    // Show win modal
    showWinModal();

    // Add completion animation
    addWinAnimation();
}

/**
 * Show the win modal
 */
function showWinModal() {
    // Calculate optimal number of moves
    const diskCount = gameState.minDisks + gameState.currentLevel - 1;
    const optimalMoves = Math.pow(2, diskCount) - 1;

    // Calculate efficiency percentage
    const efficiency = Math.min(100, Math.floor((optimalMoves / gameState.moves) * 100));

    // Update modal content
    if (domElements.winLevel) domElements.winLevel.textContent = gameState.currentLevel;
    if (domElements.winMoves) domElements.winMoves.textContent = gameState.moves;
    if (domElements.winTime) domElements.winTime.textContent = formatTime(gameState.elapsedTime);
    if (domElements.winOptimal) domElements.winOptimal.textContent = optimalMoves;
    if (domElements.winEfficiency) domElements.winEfficiency.textContent = efficiency;

    // Show or hide "Next Level" button based on whether there are more levels
    if (domElements.nextLevelBtn2) {
        if (gameState.currentLevel >= gameState.maxLevel) {
            // Hide next level button on last level
            domElements.nextLevelBtn2.style.display = 'none';

            // Check if all levels are complete
            if (gameState.completedLevels.length >= gameState.maxLevel) {
                // Show game completion modal instead
                showGameCompletionModal();
                return;
            }
        } else {
            domElements.nextLevelBtn2.style.display = 'block';
        }
    }

    // Show modal
    if (domElements.winModal) {
        domElements.winModal.style.display = 'block';
    }
}

/**
 * Add win animation effects (confetti and fireworks)
 */
function addWinAnimation() {
    // Add confetti
    for (let i = 0; i < 100; i++) {
        createConfetti();
    }

    // Add fireworks
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createFirework(), i * 300);
    }
}

/**
 * Create a confetti particle
 */
function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // Random position, color, size, and animation
    const left = Math.random() * 100;
    const width = Math.random() * 10 + 5;
    const height = Math.random() * 10 + 5;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
        '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
        '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const delay = Math.random() * 3;
    const duration = Math.random() * 5 + 5;

    // Set styles
    confetti.style.left = `${left}vw`;
    confetti.style.width = `${width}px`;
    confetti.style.height = `${height}px`;
    confetti.style.backgroundColor = color;
    confetti.style.animationDelay = `${delay}s`;
    confetti.style.animationDuration = `${duration}s`;

    // Randomly choose fall animation
    const animationType = Math.random() > 0.5 ? 'confetti-fall-left' : 'confetti-fall-right';
    confetti.style.animation = `${animationType} ${duration}s forwards`;
    confetti.style.setProperty('--start-left', `${left}vw`);

    // Add to DOM
    document.body.appendChild(confetti);

    // Remove after animation
    setTimeout(() => {
        if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
    }, duration * 1000 + delay * 1000);
}

/**
 * Create a firework effect
 */
function createFirework() {
    const left = 20 + Math.random() * 60; // Keep within middle 60% of screen

    // Create launch element
    const launch = document.createElement('div');
    launch.className = 'firework-launch';
    launch.style.left = `${left}vw`;
    document.body.appendChild(launch);

    // Create explosion after launch
    setTimeout(() => {
        // Remove launch element
        if (launch.parentNode) launch.parentNode.removeChild(launch);

        // Create particles in all directions
        const explosionSize = 30 + Math.random() * 30;
        const explosionHeight = 70 - Math.random() * 20;
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3',
            '#03a9f4', '#00bcd4', '#4caf50', '#cddc39', '#ffc107',
            '#ff9800'
        ];

        for (let i = 0; i < 36; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';

            // Calculate direction vector
            const angle = (i * 10) * Math.PI / 180;
            const speed = 5 + Math.random() * 5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // Random color
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Set styles
            particle.style.left = `${left}vw`;
            particle.style.top = `${explosionHeight}vh`;
            particle.style.backgroundColor = color;

            // Add to DOM
            document.body.appendChild(particle);

            // Animate particle
            let progress = 0;
            const maxDistance = explosionSize;

            const particleAnimation = setInterval(() => {
                progress += 0.02;

                if (progress >= 1) {
                    clearInterval(particleAnimation);
                    if (particle.parentNode) particle.parentNode.removeChild(particle);
                    return;
                }

                // Move outward and fade
                const distance = maxDistance * progress;
                const x = parseFloat(particle.style.left) + vx * 0.2;
                const y = parseFloat(particle.style.top) + vy * 0.2 - 0.1; // Slight upward bias

                particle.style.left = `${x}vw`;
                particle.style.top = `${y}vh`;
                particle.style.opacity = 1 - progress;
            }, 20);
        }
    }, 1000);
}

/**
 * Show the game completion modal
 */
function showGameCompletionModal() {
    if (!domElements.gameCompletionModal) return;

    // Update player name
    if (domElements.completionPlayerName) {
        domElements.completionPlayerName.textContent = gameState.playerName;
    }

    // Generate level stats table
    if (domElements.completionTableBody) {
        let html = '';

        for (let level = 1; level <= gameState.maxLevel; level++) {
            // Get best performance for this level
            const levelEntries = (gameState.leaderboard[level] || [])
                .filter(entry => entry.player === gameState.playerName);

            if (levelEntries.length === 0) {
                // Level not completed by this player
                html += `
          <tr>
            <td>${level}</td>
            <td>-</td>
            <td>${Math.pow(2, gameState.minDisks + level - 1) - 1}</td>
            <td>-</td>
            <td>-</td>
          </tr>
        `;
            } else {
                // Find best entry (by moves, then by time)
                levelEntries.sort((a, b) => {
                    if (a.moves !== b.moves) return a.moves - b.moves;
                    return a.time - b.time;
                });

                const best = levelEntries[0];
                const optimalMoves = Math.pow(2, gameState.minDisks + level - 1) - 1;
                const efficiency = Math.min(100, Math.floor((optimalMoves / best.moves) * 100));

                html += `
          <tr>
            <td>${level}</td>
            <td>${best.moves}</td>
            <td>${optimalMoves}</td>
            <td>${efficiency}%</td>
            <td>${formatTime(best.time)}</td>
          </tr>
        `;
            }
        }

        domElements.completionTableBody.innerHTML = html;
    }

    // Hide win modal if showing
    if (domElements.winModal) {
        domElements.winModal.style.display = 'none';
    }

    // Show completion modal
    domElements.gameCompletionModal.style.display = 'block';

    // Play game complete sound
    playSound(domElements.gameCompleteSound);
}