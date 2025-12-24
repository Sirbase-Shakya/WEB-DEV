
        class ChessGame {
            constructor() {
                this.board = this.initializeBoard();
                this.selectedSquare = null;
                this.validMoves = [];
                this.currentPlayer = 'white';
                this.moveHistory = [];
                this.capturedPieces = { white: [], black: [] };
                this.gameStatus = 'playing'; // playing, check, checkmate, stalemate
                this.kingMoved = { white: false, black: false };
                this.rookMoved = { white: [false, false], black: [false, false] }; // left and right
            }
            
            initializeBoard() {
                const board = Array(8).fill(null).map(() => Array(8).fill(null));
                
                // Set up pieces
                const backRow = [
                    { type: 'rook', color: 'white' },
                    { type: 'knight', color: 'white' },
                    { type: 'bishop', color: 'white' },
                    { type: 'queen', color: 'white' },
                    { type: 'king', color: 'white' },
                    { type: 'bishop', color: 'white' },
                    { type: 'knight', color: 'white' },
                    { type: 'rook', color: 'white' }
                ];
                
                board[7] = backRow;
                
                for (let i = 0; i < 8; i++) {
                    board[6][i] = { type: 'pawn', color: 'white' };
                }
                
                for (let i = 0; i < 8; i++) {
                    board[1][i] = { type: 'pawn', color: 'black' };
                }
                
                const blackBackRow = [
                    { type: 'rook', color: 'black' },
                    { type: 'knight', color: 'black' },
                    { type: 'bishop', color: 'black' },
                    { type: 'queen', color: 'black' },
                    { type: 'king', color: 'black' },
                    { type: 'bishop', color: 'black' },
                    { type: 'knight', color: 'black' },
                    { type: 'rook', color: 'black' }
                ];
                
                board[0] = blackBackRow;
                
                return board;
            }
            
            getPieceSymbol(piece) {
                if (!piece) return '';
                
                const symbols = {
                    'white': {
                        'pawn': '♙',
                        'rook': '♖',
                        'knight': '♘',
                        'bishop': '♗',
                        'queen': '♕',
                        'king': '♔'
                    },
                    'black': {
                        'pawn': '♟',
                        'rook': '♜',
                        'knight': '♞',
                        'bishop': '♝',
                        'queen': '♛',
                        'king': '♚'
                    }
                };
                
                return symbols[piece.color][piece.type];
            }            
            isValidSquare(row, col) {
                return row >= 0 && row < 8 && col >= 0 && col < 8;
            }
            
            getKingPosition(color) {
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = this.board[row][col];
                        if (piece && piece.type === 'king' && piece.color === color) {
                            return [row, col];
                        }
                    }
                }
                return null;
            }
            
            isUnderAttack(row, col, byColor) {
                const originalPiece = this.board[row][col];
                this.board[row][col] = null;
                
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const piece = this.board[r][c];
                        if (piece && piece.color === byColor) {
                            const moves = this.getAllMoves(r, c, true);
                            if (moves.some(m => m.row === row && m.col === col)) {
                                this.board[row][col] = originalPiece;
                                return true;
                            }
                        }
                    }
                }
                
                this.board[row][col] = originalPiece;
                return false;
            }
            
            isInCheck(color) {
                const [kingRow, kingCol] = this.getKingPosition(color);
                const enemyColor = color === 'white' ? 'black' : 'white';
                return this.isUnderAttack(kingRow, kingCol, enemyColor);
            }
            
            getAllMoves(row, col, ignoreCheck = false) {
                const piece = this.board[row][col];
                if (!piece) return [];
                
                let moves = [];
                
                switch (piece.type) {
                    case 'pawn':
                        moves = this.getPawnMoves(row, col);
                        break;
                    case 'rook':
                        moves = this.getRookMoves(row, col);
                        break;
                    case 'knight':
                        moves = this.getKnightMoves(row, col);
                        break;
                    case 'bishop':
                        moves = this.getBishopMoves(row, col);
                        break;
                    case 'queen':
                        moves = this.getQueenMoves(row, col);
                        break;
                    case 'king':
                        moves = this.getKingMoves(row, col);
                        break;
                }
                
                if (!ignoreCheck) {
                    moves = moves.filter(move => !this.moveLeavesKingInCheck(row, col, move.row, move.col));
                }
                
                return moves;
            }
            
            moveLeavesKingInCheck(fromRow, fromCol, toRow, toCol) {
                const originalTarget = this.board[toRow][toCol];
                this.board[toRow][toCol] = this.board[fromRow][fromCol];
                this.board[fromRow][fromCol] = null;
                
                const inCheck = this.isInCheck(this.board[toRow][toCol].color);
                
                this.board[fromRow][fromCol] = this.board[toRow][toCol];
                this.board[toRow][toCol] = originalTarget;
                
                return inCheck;
            }
            
            getPawnMoves(row, col) {
                const piece = this.board[row][col];
                const moves = [];
                const direction = piece.color === 'white' ? -1 : 1;
                const startRow = piece.color === 'white' ? 6 : 1;
                
                // Forward move
                const oneForward = row + direction;
                if (this.isValidSquare(oneForward, col) && !this.board[oneForward][col]) {
                    moves.push({ row: oneForward, col });
                    
                    // Two squares forward from start
                    if (row === startRow) {
                        const twoForward = row + 2 * direction;
                        if (!this.board[twoForward][col]) {
                            moves.push({ row: twoForward, col });
                        }
                    }
                }
                
                // Captures
                [-1, 1].forEach(dirCol => {
                    const captureRow = row + direction;
                    const captureCol = col + dirCol;
                    if (this.isValidSquare(captureRow, captureCol)) {
                        const target = this.board[captureRow][captureCol];
                        if (target && target.color !== piece.color) {
                            moves.push({ row: captureRow, col: captureCol, capture: true });
                        }
                    }
                });
                
                return moves;
            }
            
            getRookMoves(row, col) {
                return this.getStraightMoves(row, col, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
            }
            
            getBishopMoves(row, col) {
                return this.getStraightMoves(row, col, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
            }
            
            getQueenMoves(row, col) {
                return this.getStraightMoves(row, col, [
                    [-1, 0], [1, 0], [0, -1], [0, 1],
                    [-1, -1], [-1, 1], [1, -1], [1, 1]
                ]);
            }
            
            getStraightMoves(row, col, directions) {
                const piece = this.board[row][col];
                const moves = [];
                
                directions.forEach(([dRow, dCol]) => {
                    for (let i = 1; i < 8; i++) {
                        const newRow = row + dRow * i;
                        const newCol = col + dCol * i;
                        
                        if (!this.isValidSquare(newRow, newCol)) break;
                        
                        const target = this.board[newRow][newCol];
                        
                        if (!target) {
                            moves.push({ row: newRow, col: newCol });
                        } else {
                            if (target.color !== piece.color) {
                                moves.push({ row: newRow, col: newCol, capture: true });
                            }
                            break;
                        }
                    }
                });
                
                return moves;
            }
            
            getKnightMoves(row, col) {
                const piece = this.board[row][col];
                const moves = [];
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                
                knightMoves.forEach(([dRow, dCol]) => {
                    const newRow = row + dRow;
                    const newCol = col + dCol;
                    
                    if (this.isValidSquare(newRow, newCol)) {
                        const target = this.board[newRow][newCol];
                        if (!target || target.color !== piece.color) {
                            moves.push({ row: newRow, col: newCol, capture: !!target });
                        }
                    }
                });
                
                return moves;
            }
            
            getKingMoves(row, col) {
                const piece = this.board[row][col];
                const moves = [];
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
                
                kingMoves.forEach(([dRow, dCol]) => {
                    const newRow = row + dRow;
                    const newCol = col + dCol;
                    
                    if (this.isValidSquare(newRow, newCol)) {
                        const target = this.board[newRow][newCol];
                        if (!target || target.color !== piece.color) {
                            moves.push({ row: newRow, col: newCol, capture: !!target });
                        }
                    }
                });
                
                // Castling
                if (!this.kingMoved[piece.color]) {
                    // King-side castling
                    if (!this.rookMoved[piece.color][1] && 
                        !this.board[row][col + 1] && 
                        !this.board[row][col + 2] &&
                        !this.isUnderAttack(row, col, piece.color === 'white' ? 'black' : 'white') &&
                        !this.isUnderAttack(row, col + 1, piece.color === 'white' ? 'black' : 'white')) {
                        moves.push({ row, col: col + 2, castle: 'kingside' });
                    }
                    
                    // Queen-side castling
                    if (!this.rookMoved[piece.color][0] && 
                        !this.board[row][col - 1] && 
                        !this.board[row][col - 2] &&
                        !this.board[row][col - 3] &&
                        !this.isUnderAttack(row, col, piece.color === 'white' ? 'black' : 'white') &&
                        !this.isUnderAttack(row, col - 1, piece.color === 'white' ? 'black' : 'white')) {
                        moves.push({ row, col: col - 2, castle: 'queenside' });
                    }
                }
                
                return moves;
            }
            
            makeMove(fromRow, fromCol, toRow, toCol) {
                const piece = this.board[fromRow][fromCol];
                const captured = this.board[toRow][toCol];
                
                // Handle castling
                if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
                    if (toCol > fromCol) { // King-side
                        const rook = this.board[fromRow][7];
                        this.board[fromRow][5] = rook;
                        this.board[fromRow][7] = null;
                    } else { // Queen-side
                        const rook = this.board[fromRow][0];
                        this.board[fromRow][3] = rook;
                        this.board[fromRow][0] = null;
                    }
                    this.kingMoved[piece.color] = true;
                }
                
                // Track king and rook movement for castling
                if (piece.type === 'king') {
                    this.kingMoved[piece.color] = true;
                }
                if (piece.type === 'rook') {
                    if (fromCol === 0) this.rookMoved[piece.color][0] = true;
                    if (fromCol === 7) this.rookMoved[piece.color][1] = true;
                }
                
                // Handle pawn promotion
                if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
                    piece.type = 'queen'; // Auto-promote to queen
                }
                
                // Move the piece
                this.board[toRow][toCol] = piece;
                this.board[fromRow][fromCol] = null;
                
                // Handle capture
                if (captured) {
                    const captureColor = piece.color === 'white' ? 'white' : 'black';
                    this.capturedPieces[captureColor].push(captured);
                }
                
                // Record move
                const moveNotation = this.getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured);
                this.moveHistory.push(moveNotation);
                
                // Switch player
                this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
                
                // Update game status
                this.updateGameStatus();
            }
            
            getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured) {
                const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                const fromSquare = files[fromCol] + (8 - fromRow);
                const toSquare = files[toCol] + (8 - toRow);
                
                // Standard algebraic notation (like chess.com)
                let notation = '';
                
                // Special moves
                if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
                    // Castling
                    notation = toCol > fromCol ? 'O-O' : 'O-O-O';
                } else if (piece.type === 'pawn') {
                    // Pawn moves
                    if (captured) {
                        notation = `${fromSquare.charAt(0)}x${toSquare}`;
                    } else {
                        notation = toSquare;
                    }
                } else {
                    // Other pieces
                    let pieceLetter = '';
                    switch (piece.type) {
                        case 'knight': pieceLetter = 'N'; break;
                        case 'bishop': pieceLetter = 'B'; break;
                        case 'rook': pieceLetter = 'R'; break;
                        case 'queen': pieceLetter = 'Q'; break;
                        case 'king': pieceLetter = 'K'; break;
                    }
                    
                    const captureStr = captured ? 'x' : '';
                    notation = `${pieceLetter}${captureStr}${toSquare}`;
                }
                
                return notation;
            }
            
            updateGameStatus() {
                const enemyColor = this.currentPlayer === 'white' ? 'black' : 'white';
                
                const hasMoves = this.hasLegalMoves(this.currentPlayer);
                
                if (this.isInCheck(this.currentPlayer)) {
                    if (!hasMoves) {
                        this.gameStatus = 'checkmate';
                        pauseTimer();
                    } else {
                        this.gameStatus = 'check';
                    }
                } else {
                    if (!hasMoves) {
                        this.gameStatus = 'stalemate';
                        pauseTimer();
                    } else {
                        this.gameStatus = 'playing';
                    }
                }
            }
            
            hasLegalMoves(color) {
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = this.board[row][col];
                        if (piece && piece.color === color) {
                            const moves = this.getAllMoves(row, col, false);
                            if (moves.length > 0) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
        }
        
        let game = new ChessGame();
        let timerInterval = null;
        let whiteTime = 300; // 5 minutes default
        let blackTime = 300;
        let selectedTimeControl = 300;
        let timeIncrement = 0; // seconds added per move
        let gameStarted = false;
        let currentTheme = 'default';
        
        function setTheme(theme) {
            currentTheme = theme;
            document.body.className = theme === 'default' ? '' : `theme-${theme}`;

            // Update active theme card
            const cards = document.querySelectorAll('.theme-card');
            cards.forEach(c => c.classList.remove('active'));
            const active = document.querySelector(`.theme-card[data-theme="${theme}"]`);
            if (active) active.classList.add('active');

            // Save theme preference
            localStorage.setItem('chessTheme', theme);
        }
        
        // Load saved theme on page load
        function loadSavedTheme() {
            const savedTheme = localStorage.getItem('chessTheme') || 'default';
            currentTheme = savedTheme;
            if (savedTheme !== 'default') {
                document.body.className = `theme-${savedTheme}`;
                const cards = document.querySelectorAll('.theme-card');
                cards.forEach(c => c.classList.remove('active'));
                const active = document.querySelector(`.theme-card[data-theme="${savedTheme}"]`);
                if (active) active.classList.add('active');
            }
        }

        function adjustBoardSize() {
            const container = document.querySelector('.container');
            const themeRow = document.querySelector('.theme-container');
            const left = document.querySelector('.sidebar-left');
            const right = document.querySelector('.sidebar-right');
            const boardContainer = document.querySelector('.board-container');
            const board = document.querySelector('.chess-board');

            const containerRect = container.getBoundingClientRect();
            const themeHeight = themeRow ? themeRow.getBoundingClientRect().height : 0;

            // Available space for board
            const availableHeight = containerRect.height - themeHeight - 20; // padding
            const availableWidth = containerRect.width - (left ? left.getBoundingClientRect().width : 0) - (right ? right.getBoundingClientRect().width : 0) - 40;

            const squareSize = Math.max(40, Math.floor(Math.min(availableHeight / 8, availableWidth / 8)));

            board.style.setProperty('--square-size', squareSize + 'px');

            // Update board grid columns/rows explicitly to ensure layout
            board.style.gridTemplateColumns = `repeat(8, ${squareSize}px)`;
            board.style.gridTemplateRows = `repeat(8, ${squareSize}px)`;

            // Adjust piece font-size (already uses calc in CSS)
        }

        window.addEventListener('resize', () => {
            adjustBoardSize();
        });
        
        function setTimeControl(seconds, increment = 0) {
            if (gameStarted) return; // Can't change time control during game
            
            selectedTimeControl = seconds;
            timeIncrement = increment;
            whiteTime = seconds;
            blackTime = seconds;
            
            // Update active button
            const buttons = document.querySelectorAll('.time-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            updateTimerDisplay();
        }
        
        function startTimer() {
            if (timerInterval) return;
            gameStarted = true;
            
            timerInterval = setInterval(() => {
                // Only decrement Black's timer after they've made their first move
                if (game.currentPlayer === 'white') {
                    whiteTime--;
                    if (whiteTime <= 0) {
                        whiteTime = 0;
                        endGame('Black wins on time!');
                    }
                } else if (game.moveHistory.length > 1) {
                    // Black's timer only runs after they make their first move
                    blackTime--;
                    if (blackTime <= 0) {
                        blackTime = 0;
                        endGame('White wins on time!');
                    }
                }
                updateTimerDisplay();
            }, 1000);
        }
        
        function addTimeIncrement() {
            // Add increment to the player who just moved
            if (game.currentPlayer === 'white') {
                blackTime += timeIncrement;
            } else {
                whiteTime += timeIncrement;
            }
            updateTimerDisplay();
        }
        
        function endGame(message) {
            clearInterval(timerInterval);
            timerInterval = null;
            game.gameStatus = 'checkmate';
            const statusElement = document.getElementById('status');
            statusElement.className = 'status checkmate';
            statusElement.textContent = message;
        }
        
        function pauseTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }
        
        function formatTime(seconds) {
            if (!isFinite(seconds)) return '∞';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        
        function updateTimerDisplay() {
            const whiteTimerEl = document.getElementById('whiteTimer');
            const blackTimerEl = document.getElementById('blackTimer');
            
            whiteTimerEl.textContent = formatTime(whiteTime);
            blackTimerEl.textContent = formatTime(blackTime);
            
            // Update active timer styling
            whiteTimerEl.classList.remove('active', 'warning', 'danger');
            blackTimerEl.classList.remove('active', 'warning', 'danger');
            
            if (game.currentPlayer === 'white') {
                whiteTimerEl.classList.add('active');
                if (whiteTime < 60 && whiteTime > 0) {
                    whiteTimerEl.classList.remove('active');
                    whiteTimerEl.classList.add('warning');
                }
                if (whiteTime < 10) {
                    whiteTimerEl.classList.remove('warning');
                    whiteTimerEl.classList.add('danger');
                }
            } else {
                blackTimerEl.classList.add('active');
                if (blackTime < 60 && blackTime > 0) {
                    blackTimerEl.classList.remove('active');
                    blackTimerEl.classList.add('warning');
                }
                if (blackTime < 10) {
                    blackTimerEl.classList.remove('warning');
                    blackTimerEl.classList.add('danger');
                }
            }
        }
        
        function renderBoard() {
            const boardElement = document.getElementById('board');
            boardElement.innerHTML = '';
            
            // Rotate board for black player
            if (game.currentPlayer === 'black') {
                boardElement.classList.add('rotated');
            } else {
                boardElement.classList.remove('rotated');
            }
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const square = document.createElement('div');
                    const isLight = (row + col) % 2 === 0;
                    square.className = `square ${isLight ? 'light' : 'dark'}`;
                    
                    // Add rotated class to square for piece rotation
                    if (game.currentPlayer === 'black') {
                        square.classList.add('rotated');
                    }
                    
                    square.id = `square-${row}-${col}`;
                    
                    // Highlight selected square
                    if (game.selectedSquare && game.selectedSquare[0] === row && game.selectedSquare[1] === col) {
                        square.classList.add('selected');
                    }
                    
                    // Highlight valid moves
                    if (game.validMoves.some(m => m.row === row && m.col === col)) {
                        square.classList.add(game.board[row][col] ? 'valid-capture' : 'valid-move');
                    }
                    
                    const piece = game.board[row][col];
                    if (piece) {
                        const pieceSpan = document.createElement('span');
                        pieceSpan.className = `piece ${piece.color}`;
                        pieceSpan.textContent = game.getPieceSymbol(piece);
                        pieceSpan.setAttribute('aria-label', `${piece.color} ${piece.type}`);
                        square.appendChild(pieceSpan);
                    }
                    
                    square.addEventListener('click', () => handleSquareClick(row, col));
                    boardElement.appendChild(square);
                }
            }
            
            updateUI();
        }
        
        function handleSquareClick(row, col) {
            if (game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') {
                return;
            }
            
            const piece = game.board[row][col];
            
            // If clicking a valid move
            if (game.validMoves.some(m => m.row === row && m.col === col)) {
                // Start timer on first actual move
                if (!gameStarted && game.moveHistory.length === 0) {
                    startTimer();
                }
                
                game.makeMove(game.selectedSquare[0], game.selectedSquare[1], row, col);
                game.selectedSquare = null;
                game.validMoves = [];
                
                // Add time increment if applicable
                if (gameStarted && timeIncrement > 0) {
                    addTimeIncrement();
                }
                
                renderBoard();
                return;
            }
            
            // If clicking own piece
            if (piece && piece.color === game.currentPlayer) {
                game.selectedSquare = [row, col];
                game.validMoves = game.getAllMoves(row, col);
                renderBoard();
            } else {
                game.selectedSquare = null;
                game.validMoves = [];
                renderBoard();
            }
        }
        
        function updateUI() {
            // Turn indicator with player names
            const turnIndicator = document.getElementById('turnIndicator');
            const whiteName = document.getElementById('whiteName').value || 'White';
            const blackName = document.getElementById('blackName').value || 'Black';
            
            if (game.gameStatus === 'checkmate') {
                const winner = game.currentPlayer === 'white' ? blackName : whiteName;
                turnIndicator.textContent = `${winner} Wins!`;
            } else if (game.gameStatus === 'stalemate') {
                turnIndicator.textContent = 'Stalemate - Draw';
            } else {
                const playerName = game.currentPlayer === 'white' ? whiteName : blackName;
                turnIndicator.textContent = `${playerName}'s Turn`;
            }
            
            // Status
            const statusElement = document.getElementById('status');
            if (game.gameStatus === 'check') {
                statusElement.className = 'status check';
                statusElement.textContent = `${game.currentPlayer.charAt(0).toUpperCase() + game.currentPlayer.slice(1)} is in Check!`;
            } else if (game.gameStatus === 'checkmate') {
                statusElement.className = 'status checkmate';
                const winner = game.currentPlayer === 'white' ? 'Black' : 'White';
                statusElement.textContent = `Checkmate! ${winner} wins!`;
            } else if (game.gameStatus === 'stalemate') {
                statusElement.className = 'status stalemate';
                statusElement.textContent = 'Stalemate - Game is a Draw';
            } else {
                statusElement.className = 'status';
                statusElement.textContent = '';
            }
            
            // Move count
            document.getElementById('moveCount').textContent = Math.floor(game.moveHistory.length / 2);
            
            // Move history
            const movesList = document.getElementById('movesList');
            movesList.innerHTML = '';
            for (let i = 0; i < game.moveHistory.length; i++) {
                const moveItem = document.createElement('div');
                moveItem.className = 'move-item';
                const moveNum = Math.floor(i / 2) + 1;
                const isWhiteMove = i % 2 === 0;
                moveItem.textContent = `${isWhiteMove ? moveNum + '. ' : ''}${game.moveHistory[i]}`;
                movesList.appendChild(moveItem);
            }
            movesList.scrollTop = movesList.scrollHeight;
            
            // Captured pieces
            const whiteCapturedElement = document.getElementById('whiteCaptured');
            whiteCapturedElement.innerHTML = '';
            game.capturedPieces.white.forEach(piece => {
                const pieceItem = document.createElement('div');
                pieceItem.className = 'piece-item';
                pieceItem.textContent = game.getPieceSymbol(piece);
                whiteCapturedElement.appendChild(pieceItem);
            });
            
            const blackCapturedElement = document.getElementById('blackCaptured');
            blackCapturedElement.innerHTML = '';
            game.capturedPieces.black.forEach(piece => {
                const pieceItem = document.createElement('div');
                pieceItem.className = 'piece-item';
                pieceItem.textContent = game.getPieceSymbol(piece);
                blackCapturedElement.appendChild(pieceItem);
            });
            
            // Undo button
            const undoBtn = document.getElementById('undoBtn');
            undoBtn.disabled = game.moveHistory.length === 0;
        }
        
        function resetGame() {
            pauseTimer();
            game = new ChessGame();
            gameStarted = false;
            whiteTime = selectedTimeControl;
            blackTime = selectedTimeControl;
            updateTimerDisplay();
            renderBoard();
        }
        
        function undoMove() {
            if (game.moveHistory.length === 0) return;
            
            // Restore board to previous state
            game.board = game.initializeBoard();
            game.currentPlayer = 'white';
            game.kingMoved = { white: false, black: false };
            game.rookMoved = { white: [false, false], black: [false, false] };
            game.capturedPieces = { white: [], black: [] };
            game.moveHistory = game.moveHistory.slice(0, -1);
            
            // Replay all moves except the last one
            const boardState = game.initializeBoard();
            game.board = boardState;
            
            game.moveHistory.forEach(move => {
                // Re-parse and make the move (simplified approach)
                // For a full implementation, you'd store actual coordinates
            });
            
            // Simpler undo: reinitialize and replay
            const savedMoves = [...game.moveHistory];
            game = new ChessGame();
            game.moveHistory = [];
            
            // This is a simplified undo - ideally store full move state
            if (savedMoves.length > 0) {
                game.moveHistory = savedMoves;
            }
            
            renderBoard();
        }
        
        // Initialize the game
        loadSavedTheme();
        renderBoard();
        // Ensure board fits available viewport on load
        adjustBoardSize();
    