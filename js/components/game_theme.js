/**
 * Tower of Hanoi - Theme Management
 * Handles dark/light theme switching
 */

// Add CSS for the theme styles and settings panel
function addThemeStyles() {
    const styleElement = document.createElement('style');
    styleElement.id = 'themeStyles';
    styleElement.textContent = `
    /* Theme Variables - Unified naming scheme */
    :root {
      /* Dark theme is default - using softer colors now */
      --bg: #1E1E1E;
      --bg-elevated: #2D2D2D;
      --fg: #E0E0E0;
      --fg-muted: #B0B0B0;
      --surface: #333333;
      --surface-variant: #444444;
      --accent: #4ECDC4;
      --accent-variant: #2BB5AD;
      --highlight: #4A89DC;
      --link: #61DAFB;
      --link-hover: #29B6F6;
      --error: #FF5252;
      --success: #4CAF50;
      --warning: #FFC107;
      
      /* RGB values for transparency */
      --bg-rgb: 30, 30, 30;
      --bg-elevated-rgb: 45, 45, 45;
      --fg-rgb: 224, 224, 224;
      --surface-rgb: 51, 51, 51;
      --accent-rgb: 78, 205, 196;
      --highlight-rgb: 74, 137, 220;
    }
    
    /* Light theme variables - refined for eye comfort */
    body.light-theme {
      --bg: #F5F5F5;
      --bg-elevated: #FFFFFF;
      --fg: #333333;
      --fg-muted: #666666;
      --surface: #EEEEEE;
      --surface-variant: #DDDDDD;
      --accent: #26A69A;
      --accent-variant: #00897B;
      --highlight: #1976D2;
      --link: #0288D1;
      --link-hover: #01579B;
      --error: #D32F2F;
      --success: #388E3C;
      --warning: #F57C00;
      
      /* Light theme RGB values */
      --bg-rgb: 245, 245, 245;
      --bg-elevated-rgb: 255, 255, 255;
      --fg-rgb: 51, 51, 51;
      --surface-rgb: 238, 238, 238;
      --accent-rgb: 38, 166, 154;
      --highlight-rgb: 25, 118, 210;
    }
    
    /* Apply theme to elements */
    body {
      background-color: var(--bg);
      color: var(--fg);
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    /* Game screen theming */
    #gameScreen {
      background: linear-gradient(to bottom, var(--bg), rgba(var(--bg-rgb), 0.9));
    }
    
    .game-header {
      background: rgba(var(--bg-rgb), 0.6);
    }
    
    .instructions-panel {
      background: rgba(var(--surface-rgb), 0.6);
    }
    
    .instructions {
      color: var(--fg);
    }
    
    .game-info {
      background: rgba(var(--surface-rgb), 0.6);
    }
    
    .info-item {
      background: rgba(var(--bg-elevated-rgb), 0.7);
    }
    
    .info-label {
      color: var(--fg-muted);
    }
    
    .info-value {
      color: var(--fg);
    }
    
    .moves .info-value {
      color: var(--warning);
    }
    
    .timer .info-value {
      color: var(--highlight);
    }
    
    .level .info-value {
      color: var(--success);
    }
    
    .tower-wrapper {
      background: rgba(var(--surface-rgb), 0.6);
      box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .tower-wrapper::after {
      background: var(--surface-variant);
    }
    
    .tower-container {
      background-color: rgba(var(--surface-rgb), 0.7);
      transition: background-color 0.3s ease;
      border-bottom-color: var(--surface-variant);
    }
    
    .tower-rod {
      background: linear-gradient(to bottom, var(--surface-variant), var(--surface));
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    /* Disc styles */
    .disk {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .light-theme .disk {
      box-shadow: 0 2px 6px rgba(var(--fg-rgb), 0.2);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .disk:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    }
    
    .light-theme .disk:hover {
      box-shadow: 0 4px 8px rgba(var(--fg-rgb), 0.3);
    }
    
    .disk.selected {
      transform: translateY(-12px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
      border: 2px solid rgba(var(--accent-rgb), 0.8);
    }
    
    .light-theme .disk.selected {
      box-shadow: 0 8px 16px rgba(var(--fg-rgb), 0.2);
    }
    
    /* Tower highlight and invalid states */
    .tower-container.highlight {
      background: rgba(var(--success-rgb), 0.15);
      border-bottom-color: var(--success);
    }
    
    .tower-container.highlight::after {
      border: 3px dashed rgba(var(--success-rgb), 0.5);
    }
    
    .tower-container.invalid {
      background: rgba(var(--error-rgb), 0.15);
      border-bottom-color: var(--error);
    }
    
    /* Button styles */
    .home-btn, .controls button {
      background-color: var(--surface);
      color: var(--fg);
      border: 1px solid var(--surface-variant);
      transition: all 0.3s ease;
    }
    
    .home-btn:hover, .controls button:hover {
      background-color: var(--surface-variant);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .light-theme .home-btn:hover, .light-theme .controls button:hover {
      box-shadow: 0 4px 8px rgba(var(--fg-rgb), 0.1);
    }
    
    .home-btn:active, .controls button:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .home-btn:disabled, .controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .primary-btn {
      background-color: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    
    .primary-btn:hover {
      background-color: var(--accent-variant);
      border-color: var(--accent-variant);
    }
    
    /* Game completion effects */
    .tower-container.win-tower {
      animation: glow 1s infinite;
    }
    
    .disk.win-animation {
      animation: pulse 0.5s infinite, glow 1s infinite;
    }
    
    /* Modal styles */
    .modal-content {
      background-color: var(--bg-elevated);
      border: 1px solid var(--surface-variant);
      color: var(--fg);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    .light-theme .modal-content {
      box-shadow: 0 5px 20px rgba(var(--fg-rgb), 0.1);
    }
    
    .win-modal {
      background-color: var(--bg-elevated);
      border: 2px solid var(--success);
    }
    
    .win-modal h2 {
      color: var(--success);
    }
    
    /* Link styles */
    a, .link {
      color: var(--link);
      transition: color 0.3s ease;
    }
    
    a:hover, .link:hover {
      color: var(--link-hover);
    }
    
    /* Focus states for accessibility */
    button:focus, a:focus, .home-btn:focus, .controls button:focus {
      outline: 2px solid var(--highlight);
      outline-offset: 2px;
    }
    
    /* Keyboard hint tooltip */
    .keyboard-hint {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--bg-elevated);
      color: var(--fg);
      padding: 10px 15px;
      border-radius: 6px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      font-size: 14px;
      z-index: 100;
      display: none;
      border: 1px solid var(--surface-variant);
      max-width: 90%;
      text-align: center;
    }
    
    .light-theme .keyboard-hint {
      box-shadow: 0 4px 8px rgba(var(--fg-rgb), 0.1);
    }
    
    .keyboard-hint strong {
      display: inline-block;
      min-width: 18px;
      padding: 2px 4px;
      background-color: var(--surface);
      border: 1px solid var(--surface-variant);
      border-radius: 4px;
      text-align: center;
      margin: 0 2px;
      font-family: monospace;
    }
    
    .hint-close {
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      color: var(--fg-muted);
      cursor: pointer;
      padding: 0 4px;
      font-size: 16px;
      line-height: 1;
    }
    
    .hint-close:hover {
      color: var(--fg);
    }
    
    /* Leaderboard player name centered */
    .player-name-centered {
      text-align: center;
      margin: 0 auto 15px;
      display: block;
      width: 100%;
    }
    
    /* Hide the Change button */
    #changePlayerBtn {
      display: none;
    }
    
    /* About modal styles */
    .about-modal {
      max-width: 600px;
      max-height: 80vh;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid var(--surface-variant);
      position: relative;
      background-color: rgba(var(--surface-rgb), 0.5);
    }
    
    .modal-body {
      padding: 15px;
      overflow-y: auto;
      max-height: calc(80vh - 60px);
    }
    
    .modal-body h3 {
      margin-top: 20px;
      margin-bottom: 10px;
      color: var(--accent);
    }
    
    .close-btn {
      font-size: 24px;
      background: none;
      border: none;
      color: var(--fg);
      cursor: pointer;
      padding: 0 8px;
      line-height: 1;
    }
    
    .close-btn:hover {
      color: var(--link-hover);
    }
    
    .about-modal ul {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    
    .about-modal p {
      margin-bottom: 15px;
      line-height: 1.5;
    }
    
    /* Keyboard shortcuts styling */
    ul.shortcuts {
      list-style-type: none;
      margin-left: 0;
      padding-left: 0;
    }
    
    ul.shortcuts li {
      padding: 5px 0;
      display: flex;
      align-items: center;
    }
    
    ul.shortcuts strong {
      display: inline-block;
      min-width: 50px;
      padding: 3px 6px;
      background-color: var(--surface);
      border: 1px solid var(--surface-variant);
      border-radius: 4px;
      text-align: center;
      margin-right: 10px;
      font-family: monospace;
      font-size: 14px;
    }
    
    /* Settings panel styles */
    .settings-panel {
      position: fixed;
      top: 50px;
      right: 10px;
      width: 250px;
      background-color: var(--bg-elevated);
      border: 1px solid var(--surface-variant);
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      z-index: 50;
      display: none;
      overflow: hidden;
    }
    
    .light-theme .settings-panel {
      box-shadow: 0 5px 15px rgba(var(--fg-rgb), 0.1);
    }
    
    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: rgba(var(--surface-rgb), 0.5);
      border-bottom: 1px solid var(--surface-variant);
    }
    
    .settings-header h3 {
      margin: 0;
      color: var(--fg);
    }
    
    .settings-content {
      padding: 15px;
    }
    
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .setting-item label {
      color: var(--fg);
    }
    
    /* Toggle switch styles */
    .switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 24px;
    }
    
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--surface-variant);
      transition: .3s;
    }
    
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: var(--bg-elevated);
      transition: .3s;
    }
    
    input:checked + .slider {
      background-color: var(--accent);
    }
    
    input:checked + .slider:before {
      transform: translateX(22px);
    }
    
    .slider.round {
      border-radius: 24px;
    }
    
    .slider.round:before {
      border-radius: 50%;
    }
    
    /* Tooltip styles */
    .game-tooltip {
      position: fixed;
      background-color: var(--bg-elevated);
      color: var(--fg);
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 100;
      pointer-events: none;
      transform: translateX(-50%);
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--surface-variant);
    }
    
    .light-theme .game-tooltip {
      box-shadow: 0 2px 8px rgba(var(--fg-rgb), 0.1);
    }
    
    .game-tooltip::after {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 6px 6px;
      border-style: solid;
      border-color: transparent transparent var(--bg-elevated);
    }
    
    /* Row highlight */
    .highlight-row {
      background-color: rgba(var(--highlight-rgb), 0.15);
    }
    
    /* Animation effects */
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }
      50% {
        transform: scale(1.05);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0.7;
      }
    }
    
    @keyframes glow {
      0% {
        box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.6);
      }
      50% {
        box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.9);
      }
      100% {
        box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.6);
      }
    }
  `;

    document.head.appendChild(styleElement);
}

/**
 * Set up theme
 */
function setupTheme() {
    // Add theme styles
    addThemeStyles();

    // Apply current theme
    toggleTheme(gameState.darkTheme);
}

/**
 * Toggle between dark and light theme
 */
function toggleTheme(isDark = null) {
    // If no argument provided, toggle current state
    if (isDark === null) {
        isDark = !gameState.darkTheme;
    }

    // Update theme state
    gameState.darkTheme = isDark === true;

    // Save to localStorage
    localStorage.setItem('darkTheme', gameState.darkTheme.toString());

    // Apply theme to body
    if (gameState.darkTheme) {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }

    // Update toggle if it exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = gameState.darkTheme;
    }
}