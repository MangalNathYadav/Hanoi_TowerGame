/**
 * Tower of Hanoi Game
 * Script to combine all modules into a single file
 * 
 * Modules to include in order:
 * 1. game_core.js
 * 2. game_theme.js
 * 3. game_ui.js
 * 4. game_logic.js
 * 5. game_leaderboard.js 
 * 6. game_main.js
 */

// This would typically be a Node.js script to read and concatenate files
// For manual merging, copy files in this order:
// 
// 1. Copy all of game_core.js
// 2. Copy all of game_theme.js (without any conflicting function declarations)
// 3. Copy all of game_ui.js (without any conflicting function declarations)
// 4. Copy all of game_logic.js (without any conflicting function declarations) 
// 5. Copy all of game_leaderboard.js (without any conflicting function declarations)
// 6. Copy all of game_main.js (without any conflicting function declarations)
//
// An alternative option in PowerShell:
//
// Get-Content game_core.js, game_theme.js, game_ui.js, game_logic.js, game_leaderboard.js, game_main.js | Set-Content game.js