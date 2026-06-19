# Neon Tic Tac Toe

Author: Ronit Monga

## Project Title
Neon Tic Tac Toe

## Objective
A small, responsive Tic-Tac-Toe web app demonstrating frontend development concepts: DOM manipulation, game logic, AI (minimax), UI/UX, accessibility, and local persistence.

## Technologies Used
- HTML
- CSS
- JavaScript (vanilla)

## Features Implemented
- Player vs Player and Player vs AI modes
- AI difficulties: Easy, Medium, Hard (Minimax)
- Game board with keyboard navigation and ARIA labels
- Scoreboard and detailed statistics persisted via `localStorage`
- Sound effects with user toggle
- Export game statistics as JSON
- Responsive UI for mobile and desktop

## Files
- `tictactoe.html` — main UI
- `tictactoe.css` — styles and responsive rules
- `tictactoe.js` — game logic, AI, stats persistence, sound
- `assets/screenshots/` — place screenshots for submission

## How to Run
1. Open `index.html` directly in a browser, or serve the folder to avoid localStorage/file:// quirks:

```bash
npx http-server .
# then open http://localhost:8080/index.html
```

2. Choose `Player vs Player` or `Player vs AI`, fill names (optional), choose difficulty for AI, and click `Start Game`.

## Controls & Accessibility
- Use mouse or keyboard to navigate the board.
- Arrow keys move focus; `Enter` or `Space` makes a move.
- `New Round` starts a fresh round; `Reset Stats` clears stored data (confirmation shown).
- `Sound` checkbox toggles audio feedback on/off.
- `Export Stats` downloads a JSON file with current stats.

## Screenshots Included
- `assets/screenshots/start.png` — initial start screen with mode selection
- `assets/screenshots/in-progress.png` — mid-game board state
- `assets/screenshots/win.png` — winning game state with highlighted cells
- `assets/screenshots/stats.png` — statistics and scoreboard display