/**
 * Tower of Hanoi - Leaderboard and Level Selection
 * Handles leaderboard entries and level selection UI
 */

/**
 * Show level selection modal
 */
function showLevelSelection() {
    if (!domElements.levelSelectionModal || !domElements.levelsGrid) return;

    // Clear the grid
    domElements.levelsGrid.innerHTML = '';

    // Generate level cards
    for (let level = 1; level <= gameState.maxLevel; level++) {
        const isCompleted = gameState.completedLevels.includes(level);
        const isCurrent = level === gameState.currentLevel;

        // A level is unlocked if it's level 1, or if the previous level is completed
        const isUnlocked = level === 1 || gameState.completedLevels.includes(level - 1);

        // Create level card
        const card = document.createElement('div');
        card.className = `level-card${isCompleted ? ' completed' : ''}${isCurrent ? ' current' : ''}${!isUnlocked ? ' locked' : ''}`;

        // Card content
        card.innerHTML = `
      <div class="level-number">${level}</div>
      <div class="level-status">${isCompleted ? 'Completed' : (isUnlocked ? 'Unlocked' : 'Locked')}</div>
      ${!isUnlocked ? '<div class="lock-icon">🔒</div>' : ''}
    `;

        // Add click handler if level is unlocked
        if (isUnlocked) {
            card.addEventListener('click', () => {
                // Close modal
                domElements.levelSelectionModal.style.display = 'none';

                // Go to this level
                gameState.currentLevel = level;

                // If already in game, update level
                if (domElements.gameScreen.style.display === 'flex') {
                    setupLevel(level);
                } else {
                    // Otherwise start game at this level
                    startGame();
                }
            });
        }

        // Add to grid
        domElements.levelsGrid.appendChild(card);
    }

    // Show modal
    domElements.levelSelectionModal.style.display = 'block';
}

/**
 * Update leaderboard with a new entry
 */
function updateLeaderboard(level, time, moves) {
    // Initialize level array if needed
    if (!gameState.leaderboard[level]) {
        gameState.leaderboard[level] = [];
    }

    // Create new entry
    const entry = {
        player: gameState.playerName,
        time: time,
        moves: moves,
        date: new Date().toISOString()
    };

    // Add to leaderboard
    gameState.leaderboard[level].push(entry);

    // Sort by moves then by time
    gameState.leaderboard[level].sort((a, b) => {
        if (a.moves !== b.moves) return a.moves - b.moves;
        return a.time - b.time;
    });

    // Limit to top 10 entries
    if (gameState.leaderboard[level].length > 10) {
        gameState.leaderboard[level] = gameState.leaderboard[level].slice(0, 10);
    }

    // Save to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(gameState.leaderboard));

    // Update leaderboard display if visible
    if (domElements.leaderboardModal &&
        domElements.leaderboardModal.style.display === 'block') {
        displayLeaderboard(level);
    }
}

/**
 * Show leaderboard modal
 */
function showLeaderboardModal(level = 1) {
    if (!domElements.leaderboardModal) return;

    // Setup level selector
    if (domElements.leaderboardLevelSelect) {
        domElements.leaderboardLevelSelect.innerHTML = '';

        for (let i = 1; i <= gameState.maxLevel; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Level ${i}`;

            // Pre-select the current level or the provided level
            if (i === (level || gameState.currentLevel)) {
                option.selected = true;
            }

            domElements.leaderboardLevelSelect.appendChild(option);
        }
    }

    // Display leaderboard for this level
    displayLeaderboard(level || gameState.currentLevel);

    // Update player name - centered now without the Change button
    if (domElements.currentPlayerName) {
        // Add a class to center the player name
        domElements.currentPlayerName.parentElement.classList.add('player-name-centered');
        domElements.currentPlayerName.textContent = gameState.playerName;
    }

    // Show modal
    domElements.leaderboardModal.style.display = 'block';
}

/**
 * Display leaderboard for a specific level
 */
function displayLeaderboard(level) {
    if (!domElements.leaderboardBody) return;

    const entries = gameState.leaderboard[level] || [];

    if (entries.length === 0) {
        // No entries yet
        domElements.leaderboardBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center;">No entries yet</td>
      </tr>
    `;
        return;
    }

    // Generate table rows
    let html = '';

    entries.forEach((entry, index) => {
        const date = new Date(entry.date);
        const dateString = `${date.toLocaleDateString()}`;

        // Highlight the current player
        const isCurrentPlayer = entry.player === gameState.playerName;

        html += `
      <tr${isCurrentPlayer ? ' class="highlight-row"' : ''}>
        <td>${index + 1}</td>
        <td>${entry.player}${isCurrentPlayer ? ' (You)' : ''}</td>
        <td>${entry.moves}</td>
        <td>${formatTime(entry.time)}</td>
        <td>${dateString}</td>
      </tr>
    `;
    });

    domElements.leaderboardBody.innerHTML = html;
}