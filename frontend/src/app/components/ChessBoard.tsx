"use client";

import React, { useEffect } from "react";
import { useGame } from "../context/GameContext";
import { ChessAPI } from "../service/api";
import PromotionModal from "./PromotionModal";

export default function ChessBoard() {
    const { state, dispatch } = useGame();

    const SQUARE_SIZE = 56; // Ukuran dari setiap square di papan catur
    const LABEL_SIZE = 32; // Ukuran label di papan catur

    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    useEffect(() => {
        // Load legal moves dari square yang dipilih
        const loadLegalMoves = async () => {
            if (state.selectedSquare && state.board) {
                try {
                    const result = await ChessAPI.getLegalMoves(state.board, state.selectedSquare);
                    if (result.success) {
                        dispatch({ type: 'SET_LEGAL_MOVES', payload: result.legal_moves });
                    }
                } catch (error) {
                    console.error('Error loading legal moves:', error);
                }
            } else {
                dispatch({ type: 'SET_LEGAL_MOVES', payload: [] });
            }
        };

        loadLegalMoves();
    }, [state.selectedSquare, state.board, dispatch]);

    const checkAndMakeMove = async (move: string, toSquare: string) => {
        const fromSquare = state.selectedSquare;
        const piece = getPieceAt(fromSquare!);

        // Cek apakah move dari pawn akan promotion
        if (piece && piece.includes('pawn') && piece.includes('white')) {
            const toRank = toSquare[1];
            console.log('White pawn move to rank:', toRank); // Debugging
            
            if (toRank === '8') {
                console.log('Starting promotion process'); // Debugging
                // Start promotion process
                dispatch({
                    type: 'START_PROMOTION',
                    payload: {
                        move: move
                    }
                });
                return;
            }
        }
        
        await makeMove(move);
    };

    const handlePromotion = async (promotionPiece: string) => {
        if (!state.promotionData.move) return;

        const promotionMove = state.promotionData.move + promotionPiece;
        console.log('Making promotion move:', promotionMove); // Debugging
        await makeMove(promotionMove);
        dispatch({ type: 'COMPLETE_PROMOTION' });
    };

    const handleCancelPromotion = () => {
        dispatch({ type: 'CANCEL_PROMOTION' });
    };

    const handleSquareClick = async (square: string) => {
        // Validasi apakah board sudah ada atau belum
        if (!state.board || state.board.trim() === '') {
            alert('Please upload a board file or randomize');
            return;
        }

        // Validasi apakah posisi sudah dimuat
        if (!state.positions || Object.keys(state.positions).length === 0) {
            alert('Board positions not loaded properly');
            return;
        }

        // Validasi giliran pemain
        if (state.currentTurn !== 'black') {
            alert('Wait for AI Magnus to move');
            return;
        }

        // Event ketika menekan suatu square
        if (state.selectedSquare) {
            // Membatalkan pilihan square jika square yang sama ditekan
            if (state.selectedSquare === square) {
                dispatch({ type: 'SET_SELECTED_SQUARE', payload: null });
                return;
            }

            // Move ke square lain jika legal moves
            if (state.legalMoves.includes(square)) {
                const move = `${state.selectedSquare}${square}`;
                await checkAndMakeMove(move, square); 
            } else {
                const piece = getPieceAt(square);
                if (piece && piece.includes('black')) {
                    dispatch({ type: 'SET_SELECTED_SQUARE', payload: square });
                } else {
                    dispatch({ type: 'SET_SELECTED_SQUARE', payload: null });
                }
            }
        } else {
            const piece = getPieceAt(square);
            if (piece && piece.includes('black')) {
                dispatch({ type: 'SET_SELECTED_SQUARE', payload: square });
            }
        }
    };

    const makeMove = async (move: string) => {
        try {
            const result = await ChessAPI.makeMove(state.board, move);

            if (result.success) {
                dispatch({
                    type: 'SET_BOARD',
                    payload: {
                        board: result.board,
                        positions: result.positions,
                        mateInfo: result.mate_info
                    }
                });
                dispatch({ type: 'SET_SELECTED_SQUARE', payload: null });
                dispatch({ type: 'SET_LEGAL_MOVES', payload: [] });
                dispatch({ type: 'ADD_TO_HISTORY', payload: result.board });
            }
        } catch (error) {
            console.error('Error making move:', error);
            alert('Invalid move. Please try again.');
        }
    };

    const getPieceAt = (square: string) => {
        if (!state.positions) return null; // Jika posisi komponen catur tidak ada

        for (const [piece, position] of Object.entries(state.positions)) {
            if (position === square) {
                return piece;
            }
        }
        return null;
    };

    const renderPiece = (piece: string | null) => {
        if (!piece) return null;

        const pieceIcons: Record<string, string> = {
            'white_king': 'fas fa-chess-king text-white',
            'white_pawn': 'fas fa-chess-pawn text-white',
            'white_queen': 'fas fa-chess-queen text-white',
            'white_rook': 'fas fa-chess-rook text-white',
            'white_bishop': 'fas fa-chess-bishop text-white',
            'white_knight': 'fas fa-chess-knight text-white',
            'black_king': 'fas fa-chess-king text-black',
        };

        return <i className={`${pieceIcons[piece]} text-4xl drop-shadow-lg`} />;
    };

    const getSquareColor = (file: string, rank: string) => {
        const fileIndex = files.indexOf(file);
        const rankIndex = ranks.indexOf(rank);
        const isLight = (fileIndex + rankIndex) % 2 === 0;
        return isLight ? 'bg-amber-100' : 'bg-amber-700';
    };

    const isSquareSelected = (square: string) => {
        return state.selectedSquare === square;
    };

    const isSquareLegalMove = (square: string) => {
        return state.legalMoves.includes(square);
    };

    if (!state.board) {
        return (
            <div
                className="bg-slate-100 rounded-lg flex items-center justify-center shadow-inner"
                style={{ width: `${SQUARE_SIZE * 8}px`, height: `${SQUARE_SIZE * 8}px` }}
            >
                <div className="text-center">
                    <i className="fas fa-chess-board text-6xl text-slate-400 mb-4"></i>
                    <p className="text-lg text-slate-600 mb-2">No board loaded</p>
                    <p className="text-sm text-slate-500">Upload a file or randomize to start</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {/* Board Container */}
            <div
                className="inline-block bg-slate-800 p-4 rounded-xl shadow-2xl"
                style={{
                    width: `${SQUARE_SIZE * 8 + LABEL_SIZE + 16}px`,
                    height: `${SQUARE_SIZE * 8 + LABEL_SIZE + 16}px`,
                }}
            >
                <div className="flex items-start">
                    {/* Rank label */}
                    <div className="flex flex-col mr-1">
                        {ranks.map(rank => (
                            <div
                                key={rank}
                                className="flex items-center justify-center"
                                style={{ width: `${LABEL_SIZE}px`, height: `${SQUARE_SIZE}px` }}
                            >
                                <span className="text-base font-bold text-amber-100 select-none">{rank}</span>
                            </div>
                        ))}
                    </div>

                    {/* Square dari board */}
                    <div
                        className="grid grid-cols-8 gap-0 border-2 border-slate-700 rounded-lg overflow-hidden"
                        style={{
                            width: `${SQUARE_SIZE * 8}px`,
                            height: `${SQUARE_SIZE * 8}px`,
                        }}
                    >
                        {ranks.map(rank =>
                            files.map(file => {
                                const square = `${file}${rank}`;
                                const piece = getPieceAt(square);
                                const isSelected = isSquareSelected(square);
                                const isLegalMove = isSquareLegalMove(square);

                                return (
                                    <div
                                        key={square}
                                        className={`
                                            flex items-center justify-center cursor-pointer
                                            relative transition-all duration-150
                                            ${getSquareColor(file, rank)}
                                            ${isSelected ? 'ring-4 ring-blue-400 ring-inset' : ''}
                                            ${isLegalMove ? 'ring-2 ring-green-400 ring-inset' : ''}
                                            hover:brightness-110
                                        `}
                                        style={{ width: `${SQUARE_SIZE}px`, height: `${SQUARE_SIZE}px` }}
                                        onClick={() => handleSquareClick(square)}
                                    >
                                        {renderPiece(piece)}

                                        {/* Legal moves highlight */}
                                        {isLegalMove && !piece && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-4 h-4 bg-green-500 rounded-full opacity-75"></div>
                                            </div>
                                        )}
                                        {isLegalMove && piece && (
                                            <div className="absolute inset-0 ring-2 ring-red-500 ring-inset"></div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* File label */}
                <div className="flex items-center" style={{ marginTop: '2px' }}>
                    <div style={{ width: `${LABEL_SIZE}px` }}></div>
                    <div className="grid grid-cols-8 gap-0">
                        {files.map(file => (
                            <div
                                key={file}
                                className="flex items-center justify-center"
                                style={{ width: `${SQUARE_SIZE}px`, height: `${LABEL_SIZE}px` }}
                            >
                                <span className="text-base font-bold text-amber-100 select-none" style={{ lineHeight: `${LABEL_SIZE}px` }}>{file}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Turn info */}
            <div className="mt-4 text-center">
                <div className="text-lg font-medium text-slate-700 mb-2">
                    <strong>Current Turn:</strong>
                    <span className={`ml-2 ${state.currentTurn === 'white' ? 'text-blue-600' : 'text-red-600'}`}>
                        {state.currentTurn === 'white' ? 'AI Magnus (White)' : 'Gukesh (Black)'}
                    </span>
                </div>

                {state.selectedSquare && (
                    <div className="text-sm text-blue-600 bg-blue-50 rounded-md p-2 border border-blue-200 inline-block">
                        <strong>Selected:</strong> {state.selectedSquare.toUpperCase()}
                        {state.legalMoves.length > 0 && (
                            <span className="ml-2 text-green-600">
                                ({state.legalMoves.length} legal moves)
                            </span>
                        )}
                    </div>
                )}
            </div>
            {/* Promotion Modal */}
            <PromotionModal
                isOpen={state.promotionData.isPromoting}
                onPromote={handlePromotion}
                onCancel={handleCancelPromotion}
            />
        </div>
    );
}