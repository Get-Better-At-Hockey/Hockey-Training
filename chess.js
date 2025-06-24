// Constants
const ROWS = 8;
const COLS = 8;

const EMPTY = null;
const PAWN = 'P';
const KNIGHT = 'N';
const BISHOP = 'B';
const ROOK = 'R';
const QUEEN = 'Q';
const KING = 'K';

const WHITE = 'white';
const BLACK = 'black';

const PIECE_VALUES = {
    [PAWN]: 100,
    [KNIGHT]: 320,
    [BISHOP]: 330,
    [ROOK]: 500,
    [QUEEN]: 900,
    [KING]: 20000
};

const UNICODE_PIECES = {
    [WHITE]: { [PAWN]: '♙', [ROOK]: '♖', [KNIGHT]: '♘', [BISHOP]: '♗', [QUEEN]: '♕', [KING]: '♔' },
    [BLACK]: { [PAWN]: '♟︎', [ROOK]: '♜', [KNIGHT]: '♞', [BISHOP]: '♝', [QUEEN]: '♛', [KING]: '♚' }
};

const pieceSquareTables = {
    [PAWN]: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    [KNIGHT]: [
        [-50,-40,-30,-30,-30,-30,-40,-50], [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30], [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30], [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40], [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    [BISHOP]: [
        [-20,-10,-10,-10,-10,-10,-10,-20], [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10], [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10], [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10], [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    [ROOK]: [
        [0,  0,  0,  0,  0,  0,  0,  0], [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5], [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5], [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5], [0,  0,  0,  5,  5,  0,  0,  0]
    ],
    [QUEEN]: [
        [-20,-10,-10, -5, -5,-10,-10,-20], [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10], [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5], [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10], [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    [KING]: [ // Middlegame
        [-30,-40,-40,-50,-50,-40,-40,-30], [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30], [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20], [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20], [20, 30, 10,  0,  0, 10, 30, 20]
    ],
    'KING_ENDGAME': [ // Endgame
        [-50,-40,-30,-20,-20,-30,-40,-50], [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30], [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30], [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30], [-50,-30,-30,-30,-30,-30,-30,-50]
    ]
};

let board = [];
let currentPlayer;
let playerColor = WHITE;
let aiColor = BLACK;
let selectedPiece = null;
let gameRunning = true;
let difficulty = 'medium';
let castlingRights = [true, true, true, true]; // WK, WQ, BK, BQ
let enPassantTarget = null;
let moveHistory = []; // For future use (e.g. threefold repetition)

const boardElement = document.getElementById('chessBoard');
const gameStatusElement = document.getElementById('gameStatus');
const newGameBtn = document.getElementById('newGameBtn');
const difficultySelect = document.getElementById('difficulty');
const playerColorSelect = document.getElementById('playerColor');
const promotionModal = document.getElementById('promotionModal');

function setupInitialBoard() {
    const initialBoard = [
        [{ type: ROOK, color: BLACK }, { type: KNIGHT, color: BLACK }, { type: BISHOP, color: BLACK }, { type: QUEEN, color: BLACK }, { type: KING, color: BLACK }, { type: BISHOP, color: BLACK }, { type: KNIGHT, color: BLACK }, { type: ROOK, color: BLACK }],
        [{ type: PAWN, color: BLACK }, { type: PAWN, color: BLACK }, { type: PAWN, color: BLACK }, { type: PAWN, color: BLACK }, { type: PAWN, color: BLACK }, { type: PAWN, color: BLACK }, { type: PAWN, color: BLACK }, { type: PAWN, color: BLACK }],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [{ type: PAWN, color: WHITE }, { type: PAWN, color: WHITE }, { type: PAWN, color: WHITE }, { type: PAWN, color: WHITE }, { type: PAWN, color: WHITE }, { type: PAWN, color: WHITE }, { type: PAWN, color: WHITE }, { type: PAWN, color: WHITE }],
        [{ type: ROOK, color: WHITE }, { type: KNIGHT, color: WHITE }, { type: BISHOP, color: WHITE }, { type: QUEEN, color: WHITE }, { type: KING, color: WHITE }, { type: BISHOP, color: WHITE }, { type: KNIGHT, color: WHITE }, { type: ROOK, color: WHITE }]
    ];
    board = initialBoard.map(row => row.map(piece => piece ? {...piece} : null));
}

function initGame() {
    setupInitialBoard();
    playerColor = playerColorSelect.value;
    aiColor = (playerColor === WHITE) ? BLACK : WHITE;
    currentPlayer = WHITE;
    selectedPiece = null;
    gameRunning = true;
    castlingRights = [true, true, true, true];
    enPassantTarget = null;
    moveHistory = [];
    difficulty = difficultySelect.value;

    renderBoard();
    updateGameStatus();

    if (currentPlayer === aiColor) {
        gameStatusElement.textContent = `${aiColor.charAt(0).toUpperCase() + aiColor.slice(1)} (AI) is thinking...`;
        setTimeout(makeAIMove, 250);
    }
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const square = document.createElement('div');
            square.classList.add('square', (r + c) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = r;
            square.dataset.col = c;

            const piece = board[r][c];
            if (piece) {
                square.textContent = UNICODE_PIECES[piece.color][piece.type];
                square.classList.add('piece', piece.color === WHITE ? 'white-piece' : 'black-piece');
            }
            square.addEventListener('click', () => handleSquareClick(r, c));
            boardElement.appendChild(square);
        }
    }
    if (selectedPiece) {
        const selectedSq = boardElement.querySelector(`.square[data-row='${selectedPiece.row}'][data-col='${selectedPiece.col}']`);
        if (selectedSq) selectedSq.classList.add('selected');
        const legalMoves = getLegalMovesForPiece(selectedPiece.piece, selectedPiece.row, selectedPiece.col, board, castlingRights, enPassantTarget, true);
        legalMoves.forEach(move => {
            const moveSq = boardElement.querySelector(`.square[data-row='${move.to.row}'][data-col='${move.to.col}']`);
            if (moveSq) {
                moveSq.classList.add('valid-move');
                if (board[move.to.row][move.to.col] !== EMPTY) moveSq.classList.add('valid-capture');
            }
        });
    }
}

function getPieceAt(r, c, b = board) { return (isSquareOnBoard(r,c) && b[r] && b[r][c]) ? b[r][c] : null; }
function isSquareOnBoard(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }
function getOpponentColor(color) { return color === WHITE ? BLACK : WHITE; }

function handleSquareClick(row, col) {
    if (!gameRunning || currentPlayer !== playerColor) return;
    const clickedPiece = getPieceAt(row, col);

    if (selectedPiece) {
        const legalMoves = getLegalMovesForPiece(selectedPiece.piece, selectedPiece.row, selectedPiece.col, board, castlingRights, enPassantTarget, true);
        const move = legalMoves.find(m => m.to.row === row && m.to.col === col);
        if (move) {
            performMove(move);
            selectedPiece = null;
        } else if (clickedPiece && clickedPiece.color === currentPlayer) {
            selectedPiece = { piece: clickedPiece, row, col };
        } else {
            selectedPiece = null;
        }
    } else if (clickedPiece && clickedPiece.color === currentPlayer) {
        selectedPiece = { piece: clickedPiece, row, col };
    }
    renderBoard();
}

function performMove(move, isAI = false) {
    const { from, to, promotion, isCastling, isEnPassant } = move;
    const pieceToMove = board[from.row][from.col]; // Ensure we get the piece from the current board state

    // Store for history/unmake (simplified)
    const capturedPiece = board[to.row][to.col];
    moveHistory.push({ ...move, capturedPiece, oldCastlingRights: [...castlingRights], oldEnPassantTarget: enPassantTarget });

    // Actual move
    board[to.row][to.col] = pieceToMove;
    board[from.row][from.col] = EMPTY;

    if (isEnPassant) board[from.row][to.col] = EMPTY; // Remove captured en passant pawn
    if (isCastling) {
        if (to.col === 6) { board[from.row][5] = board[from.row][7]; board[from.row][7] = EMPTY; } // Kingside
        else { board[from.row][3] = board[from.row][0]; board[from.row][0] = EMPTY; } // Queenside
    }

    // Update castling rights
    if (pieceToMove.type === KING) {
        if (pieceToMove.color === WHITE) { castlingRights[0] = castlingRights[1] = false; }
        else { castlingRights[2] = castlingRights[3] = false; }
    } else if (pieceToMove.type === ROOK) {
        if (pieceToMove.color === WHITE) {
            if (from.row === 7 && from.col === 0) castlingRights[1] = false; // WQ
            if (from.row === 7 && from.col === 7) castlingRights[0] = false; // WK
        } else {
            if (from.row === 0 && from.col === 0) castlingRights[3] = false; // BQ
            if (from.row === 0 && from.col === 7) castlingRights[2] = false; // BK
        }
    }
    // If a rook is captured, update its side's castling rights
    if (capturedPiece && capturedPiece.type === ROOK) {
        if (to.row === 7 && to.col === 0 && capturedPiece.color === WHITE) castlingRights[1] = false;
        if (to.row === 7 && to.col === 7 && capturedPiece.color === WHITE) castlingRights[0] = false;
        if (to.row === 0 && to.col === 0 && capturedPiece.color === BLACK) castlingRights[3] = false;
        if (to.row === 0 && to.col === 7 && capturedPiece.color === BLACK) castlingRights[2] = false;
    }


    enPassantTarget = (pieceToMove.type === PAWN && Math.abs(from.row - to.row) === 2) ? { row: (from.row + to.row) / 2, col: from.col } : null;

    if (promotion) {
        board[to.row][to.col] = { type: promotion, color: pieceToMove.color };
        switchPlayerAndContinueGame();
    } else if (pieceToMove.type === PAWN && (to.row === 0 || to.row === ROWS - 1)) {
        if (isAI) {
            board[to.row][to.col] = { type: QUEEN, color: pieceToMove.color }; // AI auto-promotes to Queen
            switchPlayerAndContinueGame();
        } else {
            showPromotionModal(to.row, to.col, pieceToMove.color);
            // Game continuation will be handled by promotion modal callback
        }
    } else {
        switchPlayerAndContinueGame();
    }
}

function switchPlayerAndContinueGame() {
    currentPlayer = getOpponentColor(currentPlayer);
    renderBoard(); // Render before status update for AI thinking message
    updateGameStatus();
    const gameStateMessage = checkGameEndState();
    if (gameStateMessage) {
        gameRunning = false;
        gameStatusElement.textContent = gameStateMessage;
    } else if (gameRunning && currentPlayer === aiColor) {
        gameStatusElement.textContent = `${aiColor.charAt(0).toUpperCase() + aiColor.slice(1)} (AI) is thinking...`;
        setTimeout(makeAIMove, 100);
    }
}

function updateGameStatus() {
    if (!gameRunning) return;
    let statusText = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    if (isKingInCheck(currentPlayer, board, castlingRights, enPassantTarget)) statusText += " (Check!)";
    gameStatusElement.textContent = statusText;
}

function getLegalMovesForPiece(piece, r, c, currentBoard, currentCR, currentEPT, checkSafety = true) {
    if (!piece) return [];
    const moves = [];
    const color = piece.color;
    const oppColor = getOpponentColor(color);

    function addValidMove(toR, toC, isCap = false, promo = null, isCastle = false, isEP = false) {
        const move = { from: { row: r, col: c }, to: { row: toR, col: toC }, piece, captured: currentBoard[toR][toC], promotion: promo, isCastling: isCastle, isEnPassant: isEP };
        if (checkSafety) {
            // Apply the move temporarily and get the board state *after* this move
            const { nextBoard: simBoard, nextCastlingRights: simCR, nextEnPassantTarget: simEPT } = applyTemporaryMove(move, currentBoard, currentCR, currentEPT);
            // Check if the current player's king is safe on this new board state
            if (!isKingInCheck(color, simBoard, simCR, simEPT)) {
                moves.push(move);
            }
        } else {
            moves.push(move);
        }
    }

    if (piece.type === PAWN) {
        const dir = color === WHITE ? -1 : 1;
        const startRow = color === WHITE ? 6 : 1;
        const promoRow = color === WHITE ? 0 : 7;
        // Forward 1
        if (isSquareOnBoard(r + dir, c) && !getPieceAt(r + dir, c, currentBoard)) {
            if (r + dir === promoRow) [QUEEN, ROOK, BISHOP, KNIGHT].forEach(p => addValidMove(r + dir, c, false, p));
            else addValidMove(r + dir, c);
            // Forward 2
            if (r === startRow && !getPieceAt(r + 2 * dir, c, currentBoard)) addValidMove(r + 2 * dir, c);
        }
        // Captures
        [c - 1, c + 1].forEach(capCol => {
            if (isSquareOnBoard(r + dir, capCol)) {
                const target = getPieceAt(r + dir, capCol, currentBoard);
                if (target && target.color === oppColor) {
                    if (r + dir === promoRow) [QUEEN, ROOK, BISHOP, KNIGHT].forEach(p => addValidMove(r + dir, capCol, true, p));
                    else addValidMove(r + dir, capCol, true);
                }
                if (currentEPT && currentEPT.row === r + dir && currentEPT.col === capCol) addValidMove(r + dir, capCol, true, null, false, true);
            }
        });
    } else if (piece.type === KNIGHT) {
        [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
            const toR = r + dr, toC = c + dc;
            if (isSquareOnBoard(toR, toC)) {
                const target = getPieceAt(toR, toC, currentBoard);
                if (!target || target.color === oppColor) addValidMove(toR, toC, !!target);
            }
        });
    } else if (piece.type === ROOK || piece.type === BISHOP || piece.type === QUEEN) {
        let dirs = [];
        if (piece.type !== BISHOP) dirs.push([-1,0],[1,0],[0,-1],[0,1]); // Rook & Queen
        if (piece.type !== ROOK) dirs.push([-1,-1],[-1,1],[1,-1],[1,1]); // Bishop & Queen
        dirs.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const toR = r + i * dr, toC = c + i * dc;
                if (!isSquareOnBoard(toR, toC)) break;
                const target = getPieceAt(toR, toC, currentBoard);
                if (!target) addValidMove(toR, toC);
                else { if (target.color === oppColor) addValidMove(toR, toC, true); break; }
            }
        });
    } else if (piece.type === KING) {
        [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
            const toR = r + dr, toC = c + dc;
            if (isSquareOnBoard(toR, toC)) {
                const target = getPieceAt(toR, toC, currentBoard);
                if (!target || target.color === oppColor) addValidMove(toR, toC, !!target);
            }
        });
        // Castling
        if (checkSafety && !isKingInCheck(color, currentBoard, currentCR, currentEPT)) {
            // Kingside
            const ksIdx = color === WHITE ? 0 : 2;
            if (currentCR[ksIdx] && !getPieceAt(r,c+1,currentBoard) && !getPieceAt(r,c+2,currentBoard) && getPieceAt(r,c+3,currentBoard)?.type === ROOK) {
                if (!isSquareAttackedBy(r,c+1,oppColor,currentBoard,currentCR,currentEPT) && !isSquareAttackedBy(r,c+2,oppColor,currentBoard,currentCR,currentEPT)) {
                    addValidMove(r, c + 2, false, null, true);
                }
            }
            // Queenside
            const qsIdx = color === WHITE ? 1 : 3;
            if (currentCR[qsIdx] && !getPieceAt(r,c-1,currentBoard) && !getPieceAt(r,c-2,currentBoard) && !getPieceAt(r,c-3,currentBoard) && getPieceAt(r,c-4,currentBoard)?.type === ROOK) {
                 if (!isSquareAttackedBy(r,c-1,oppColor,currentBoard,currentCR,currentEPT) && !isSquareAttackedBy(r,c-2,oppColor,currentBoard,currentCR,currentEPT)) {
                    addValidMove(r, c - 2, false, null, true);
                }
            }
        }
    }
    return moves;
}

function getAllLegalMoves(color, currentBoard, currentCR, currentEPT, checkSafety = true) {
    const allMoves = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const piece = getPieceAt(r,c,currentBoard);
            if (piece && piece.color === color) {
                allMoves.push(...getLegalMovesForPiece(piece, r, c, currentBoard, currentCR, currentEPT, checkSafety));
            }
        }
    }
    return allMoves;
}

function isSquareAttackedBy(r, c, attackerColor, currentBoard, currentCR, currentEPT) {
    const opponentMoves = getAllLegalMoves(attackerColor, currentBoard, currentCR, currentEPT, false); // false to prevent recursion
    for (const move of opponentMoves) {
        if (move.to.row === r && move.to.col === c) {
            // For pawns, only diagonal moves count as attacks on a square
            if (move.piece.type === PAWN) {
                if (move.from.col !== move.to.col) return true; // Diagonal pawn move
            } else {
                return true; // Any other piece moving to the square attacks it
            }
        }
    }
    return false;
}

function isKingInCheck(kingColor, currentBoard, currentCR, currentEPT) {
    let kingPos = null;
    for (let r0 = 0; r0 < ROWS; r0++) {
        for (let c0 = 0; c0 < COLS; c0++) {
            const piece = getPieceAt(r0,c0,currentBoard);
            if (piece && piece.type === KING && piece.color === kingColor) {
                kingPos = { r:r0, c:c0 }; break;
            }
        }
        if (kingPos) break;
    }
    return kingPos ? isSquareAttackedBy(kingPos.r, kingPos.c, getOpponentColor(kingColor), currentBoard, currentCR, currentEPT) : false;
}

function applyTemporaryMove(move, currentBoard, currentCR, currentEPT) {
    const nextBoard = currentBoard.map(row => row.map(p => p ? {...p} : null));
    const pieceToMove = nextBoard[move.from.row][move.from.col];
    const pieceOriginallyAtTo = currentBoard[move.to.row][move.to.col]; // Piece at destination *before* this simulated move

    nextBoard[move.to.row][move.to.col] = pieceToMove;
    nextBoard[move.from.row][move.from.col] = EMPTY;

    let nextCR = [...currentCR];
    let nextEPT = null; // Default: EPT is cleared unless a new one is made by a double pawn push

    if (move.isEnPassant) nextBoard[move.from.row][move.to.col] = EMPTY;
    if (move.isCastling) {
        if (move.to.col === 6) { nextBoard[move.from.row][5] = nextBoard[move.from.row][7]; nextBoard[move.from.row][7] = EMPTY; }
        else { nextBoard[move.from.row][3] = nextBoard[move.from.row][0]; nextBoard[move.from.row][0] = EMPTY; }
    }

    // Update En Passant Target
    if (pieceToMove.type === PAWN && Math.abs(move.from.row - move.to.row) === 2) {
        nextEPT = { row: (move.from.row + move.to.row) / 2, col: move.from.col };
    }

    // Update Castling Rights (more comprehensively)
    if (pieceToMove.type === KING) {
        if (pieceToMove.color === WHITE) { nextCR[0] = nextCR[1] = false; }
        else { nextCR[2] = nextCR[3] = false; }
    } else if (pieceToMove.type === ROOK) {
        if (pieceToMove.color === WHITE) {
            if (move.from.row === 7 && move.from.col === 0) nextCR[1] = false; // WQ rook moved
            if (move.from.row === 7 && move.from.col === 7) nextCR[0] = false; // WK rook moved
        } else { // BLACK
            if (move.from.row === 0 && move.from.col === 0) nextCR[3] = false; // BQ rook moved
            if (move.from.row === 0 && move.from.col === 7) nextCR[2] = false; // BK rook moved
        }
    }
    // If a rook is captured on the 'to' square
    if (pieceOriginallyAtTo && pieceOriginallyAtTo.type === ROOK) {
        if (move.to.row === 7 && move.to.col === 0 && pieceOriginallyAtTo.color === WHITE) nextCR[1] = false; // WQ rook captured
        if (move.to.row === 7 && move.to.col === 7 && pieceOriginallyAtTo.color === WHITE) nextCR[0] = false; // WK rook captured
        if (move.to.row === 0 && move.to.col === 0 && pieceOriginallyAtTo.color === BLACK) nextCR[3] = false; // BQ rook captured
        if (move.to.row === 0 && move.to.col === 7 && pieceOriginallyAtTo.color === BLACK) nextCR[2] = false; // BK rook captured
    }

    const promoType = move.promotion || (pieceToMove.type === PAWN && (move.to.row === 0 || move.to.row === 7) ? QUEEN : null);
    if (promoType) nextBoard[move.to.row][move.to.col] = { type: promoType, color: pieceToMove.color };

    return { nextBoard, nextCastlingRights: nextCR, nextEnPassantTarget: nextEPT };
}

function checkGameEndState() {
    const legalMoves = getAllLegalMoves(currentPlayer, board, castlingRights, enPassantTarget, true);
    if (legalMoves.length === 0) {
        return isKingInCheck(currentPlayer, board, castlingRights, enPassantTarget) ?
            `Checkmate! ${getOpponentColor(currentPlayer)} wins.` : "Stalemate! It's a draw.";
    }
    return null;
}

promotionModal.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        const pieceType = button.dataset.piece;
        const row = parseInt(promotionModal.dataset.row);
        const col = parseInt(promotionModal.dataset.col);
        const color = promotionModal.dataset.color;
        board[row][col] = { type: pieceType, color: color };
        hidePromotionModal();
        switchPlayerAndContinueGame();
    });
});
function showPromotionModal(r,c,color) { promotionModal.style.display = 'flex'; promotionModal.dataset.row=r; promotionModal.dataset.col=c; promotionModal.dataset.color=color; }
function hidePromotionModal() { promotionModal.style.display = 'none'; }


function evaluateBoard(currentBoard, colorToEvalFor) { // Always returns score from perspective of colorToEvalFor
    let score = 0;
    let numPieces = 0;
    for(let r=0; r<ROWS; ++r) for(let c=0; c<COLS; ++c) if(getPieceAt(r,c,currentBoard)) numPieces++;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const piece = getPieceAt(r,c,currentBoard);
            if (piece) {
                const value = PIECE_VALUES[piece.type];
                const table = (piece.type === KING && numPieces < 10) ? pieceSquareTables['KING_ENDGAME'] : pieceSquareTables[piece.type];
                const pieceSquareValue = piece.color === WHITE ? table[r][c] : table[7 - r][c]; // Flip for black

                if (piece.color === colorToEvalFor) score += value + pieceSquareValue;
                else score -= (value + pieceSquareValue);
            }
        }
    }
    return score;
}

function minimax(currentBoard, depth, alpha, beta, maximizingColor, currentCR, currentEPT) {
    // maximizingColor is the player whose turn it is for this node in the search tree.

    if (depth === 0) {
        return { score: evaluateBoard(currentBoard, maximizingColor), move: null };
    }

    const legalMoves = getAllLegalMoves(maximizingColor, currentBoard, currentCR, currentEPT, true); // Moves for the player whose turn it is (maximizingColor)

    if (legalMoves.length === 0) {
        if (isKingInCheck(maximizingColor, currentBoard, currentCR, currentEPT)) {
            return { score: -Infinity, move: null }; // Checkmated
        }
        return { score: 0, move: null }; // Stalemate
    }
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of legalMoves) {
        const { nextBoard, nextCastlingRights, nextEnPassantTarget } = applyTemporaryMove(move, currentBoard, currentCR, currentEPT);
        // The next call is for the opponent, so we evaluate from their perspective (negate score)
        // or pass the opponent as the new maximizingColor and adjust logic.
        // Simpler: always evaluate for 'maximizingColor' and negate if it's opponent's turn in search.
        // The current 'evaluateBoard' is from perspective of 'colorToEvalFor'.
        // Minimax structure:
        // if current player is maximizingColor: find move that leads to max(evaluate(next_state for maximizingColor))
        // if current player is opponent: find move that leads to min(evaluate(next_state for maximizingColor))
        // This means the recursive call should be for the opponent.
        const opponentColor = getOpponentColor(maximizingColor);
        const evalResult = minimax(nextBoard, depth - 1, -beta, -alpha, opponentColor, nextCastlingRights, nextEnPassantTarget);
        const currentScore = -evalResult.score; // Negate because evalResult.score is from opponent's perspective

        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMove = move;
        }
        alpha = Math.max(alpha, currentScore);
        if (alpha >= beta) break;
    }
    return { score: bestScore, move: bestMove };
}


function getAIMove() {
    let depth;
    switch (difficulty) {
        case 'easy':
            const easyMoves = getAllLegalMoves(aiColor, board, castlingRights, enPassantTarget, true);
            return easyMoves.length > 0 ? easyMoves[Math.floor(Math.random() * easyMoves.length)] : null;
        case 'medium': depth = 2; break;
        case 'hard': depth = 3; break;
        case 'grandmaster': depth = 3; break; // Depth 4 can be too slow without further optimizations
        default: depth = 2;
    }
    console.time("AI Think Time");
    const result = minimax(board, depth, -Infinity, Infinity, aiColor, castlingRights, enPassantTarget);
    console.timeEnd("AI Think Time");
    console.log(`AI (${aiColor}) eval: ${result.score}, move:`, result.move);
    return result.move;
}

function makeAIMove() {
    if (!gameRunning || currentPlayer !== aiColor) return;
    const move = getAIMove();
    if (move) performMove(move, true);
    else console.log("AI has no moves! (Should be checkmate/stalemate)");
}

newGameBtn.addEventListener('click', initGame);
difficultySelect.addEventListener('change', () => { difficulty = difficultySelect.value; });
playerColorSelect.addEventListener('change', initGame);

initGame();
