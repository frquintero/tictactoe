class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.difficulty = 'normal'; // 'normal' or 'minimax'
        
        // Statistics
        this.stats = {
            wins: 0,
            losses: 0,
            draws: 0
        };
        
        this.statusElement = document.getElementById('status');
        this.restartButton = document.getElementById('restart');
        this.difficultySelect = document.getElementById('difficulty');
        this.cells = document.querySelectorAll('.cell');
        this.winsElement = document.getElementById('wins');
        this.lossesElement = document.getElementById('losses');
        this.drawsElement = document.getElementById('draws');
        this.resetStatsButton = document.getElementById('reset-stats');
        
        this.loadStats();
        this.initializeGame();
    }
    
    initializeGame() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });
        
        this.restartButton.addEventListener('click', this.restartGame.bind(this));
        this.difficultySelect.addEventListener('change', this.changeDifficulty.bind(this));
        this.resetStatsButton.addEventListener('click', this.resetStats.bind(this));
        
        this.updateStatus();
        this.updateStatsDisplay();
    }
    
    handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        // Check if cell is empty and game is active
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        // Make player move
        this.makeMove(index, this.currentPlayer);
        
        // Check if game continues
        if (this.gameActive) {
            // Switch to computer player
            this.currentPlayer = 'O';
            this.updateStatus();
            
            // Computer makes move after a short delay
            setTimeout(() => {
                this.makeComputerMove();
            }, 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add(player.toLowerCase());
        
        // Check for win or draw
        if (this.checkWin()) {
            this.gameActive = false;
            if (player === 'X') {
                this.statusElement.textContent = 'You win!';
                this.stats.wins++;
            } else {
                this.statusElement.textContent = 'Computer wins!';
                this.stats.losses++;
            }
            this.saveStats();
            this.updateStatsDisplay();
        } else if (this.checkDraw()) {
            this.gameActive = false;
            this.statusElement.textContent = "It's a draw!";
            this.stats.draws++;
            this.saveStats();
            this.updateStatsDisplay();
        }
    }
    
    makeComputerMove() {
        if (!this.gameActive) return;
        
        let moveIndex;
        
        if (this.difficulty === 'normal') {
            moveIndex = this.getNormalMove();
        } else {
            moveIndex = this.getBestMove();
        }
        
        this.makeMove(moveIndex, 'O');
        
        // Switch back to human player
        if (this.gameActive) {
            this.currentPlayer = 'X';
            this.updateStatus();
        }
    }
    
    getNormalMove() {
        // Balanced strategy for normal difficulty:
        // 1. 70% chance to make a strategic move (win/block)
        // 2. 30% chance to make a random move
        
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin()) {
                    this.board[i] = '';
                    // 70% chance to take the winning move
                    if (Math.random() < 0.7) {
                        return i;
                    }
                }
                this.board[i] = '';
            }
        }
        
        // Check for blocking move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWin()) {
                    this.board[i] = '';
                    // 70% chance to block the player
                    if (Math.random() < 0.7) {
                        return i;
                    }
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available (50% chance)
        if (this.board[4] === '' && Math.random() < 0.5) {
            return 4;
        }
        
        // Take a corner if available (40% chance)
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0 && Math.random() < 0.4) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available spot
        const availableSpots = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }
    
    getBestMove() {
        // Minimax algorithm implementation
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(depth, isMaximizing) {
        // Check terminal states
        if (this.checkWinForPlayer('O')) {
            return 10 - depth;
        } else if (this.checkWinForPlayer('X')) {
            return depth - 10;
        } else if (this.checkDraw()) {
            return 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (this.board[i] === '') {
                    this.board[i] = 'O';
                    let score = this.minimax(depth + 1, false);
                    this.board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (this.board[i] === '') {
                    this.board[i] = 'X';
                    let score = this.minimax(depth + 1, true);
                    this.board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return (
                this.board[a] !== '' &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]
            );
        });
    }
    
    checkWinForPlayer(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return (
                this.board[a] === player &&
                this.board[b] === player &&
                this.board[c] === player
            );
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    updateStatus() {
        if (this.gameActive) {
            this.statusElement.textContent = this.currentPlayer === 'X' ? 
                "Player X's turn" : "Computer's turn";
        }
    }
    
    changeDifficulty() {
        this.difficulty = this.difficultySelect.value;
    }
    
    restartGame() {
        // Reset board state
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear board UI
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        
        this.updateStatus();
    }
    
    // Statistics methods
    loadStats() {
        const savedStats = localStorage.getItem('tictactoeStats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    }
    
    saveStats() {
        localStorage.setItem('tictactoeStats', JSON.stringify(this.stats));
    }
    
    updateStatsDisplay() {
        this.winsElement.textContent = this.stats.wins;
        this.lossesElement.textContent = this.stats.losses;
        this.drawsElement.textContent = this.stats.draws;
    }
    
    resetStats() {
        this.stats = {
            wins: 0,
            losses: 0,
            draws: 0
        };
        this.saveStats();
        this.updateStatsDisplay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});