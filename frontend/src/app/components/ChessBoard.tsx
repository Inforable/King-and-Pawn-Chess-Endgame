"use client";

import React from "react";
import { useGame } from "../context/GameContext"
import { ChessAPI } from "../service/api"

export default function ChessBoard() {
    const { state, dispatch } = useGame();

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    const handleSquareClick = async (square: string) => {
        if (state.currentTurn !== 'black') {
            alert('Wait for AI Magnus to move');
            return;
        }
        
        // Kondisi jika king hitam tidak ada
        if (!state.positions.black_king) {
            return;
        }

        // Kondisi jika square ditekan dua kali
        if (state.selectedSquare === square) {
            dispatch({ type: 'SET_SELECTED_SQUARE', payload: null }); // Membatalkan pilihan
            dispatch({ type: 'SET_LEGAL_MOVES', payload: [] }); // Menghilangkan legal moves
            return;
        }
        
        // Kondisi jika square yang dipilih adalah king hitam (Gukesh)
        if (square === state.positions.black_king) {
            dispatch({ type: 'SET_SELECTED_SQUARE', payload: square });
            try {
                const result = await ChessAPI.getLegalMoves(state.board, square);
                dispatch({ type: 'SET_LEGAL_MOVES', payload: result.legal_moves || [] });
            } catch (error) {
                console.error('Error getting legal moves:', error);
            }
        }

        // Kondisi jika square telah dipilih dan legal moves tersedia
        if (state.selectedSquare && state.legalMoves.includes(square)) {
            try {
                const move = `${state.selectedSquare}${square}`;
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
                alert('Invalid move');
            }
        }
    };

    const getPieceIcon = (square: string) => {
        if (square === state.positions.white_king) {
            return <i className="fas fa-chess-king text-gray-400 text-xl"></i>;
        }
        if (square === state.positions.black_king) {
            return <i className="fas fa-chess-king text-black text-xl"></i>;
        }
        if (square === state.positions.white_pawn) {
            return <i className="fas fa-chess-pawn text-gray-400 text-xl"></i>;
        }
        if (square === state.positions.white_queen) {
            return <i className="fas fa-chess-queen text-gray-400 text-xl"></i>;
        }
        return null;
    };

    const getSquareClass = (square: string, file: string, rank: string) => {
        const fileIdx = files.indexOf(file);
        const rankIdx = ranks.indexOf(rank);
        const isLightSquare = (fileIdx + rankIdx) % 2 === 0;

        let classes = `w-12 h-12 flex items-center justify-center text-2xl cursor-pointer border border-gray-300 ${
            isLightSquare ? 'bg-amber-100' : 'bg-amber-800'
        }`;

        // Untuk highlight selected square
        if (state.selectedSquare === square) {
            classes += ' ring-4 ring-blue-400';
        }

        // Untuk highlight legal moves
        if (state.legalMoves.includes(square)) {
            classes += ' bg-green-200 ring-2 ring-green-400';
        }

        // Untuk highlight black king (Gukesh)
        if (square === state.positions.black_king && state.currentTurn === 'black') {
            classes += ' ring-2 ring-yellow-400';
        }

        return classes;
    };

    return (
        <div>
            <div className="relative">
                <div className="grid grid-cols-8 border-2 border-gray-400">
                    {ranks.map((rank, rankIdx) =>
                        files.map((file, fileIdx) => {
                            const square = `${file}${rank}`;
                            const piece = getPieceIcon(square);

                            return (
                                <div
                                key={square}
                                className={getSquareClass(square, file, rank)}
                                onClick={() => handleSquareClick(square)}
                                >
                                    {piece}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-between mt-2">
                    {files.map((file) => (
                        <div key={file} className="w-8 text-center text-sm font-medium text-gray-600">
                            {file}
                        </div>
                    ))}
                </div>

                <div className="absolute -left-5 top-0 h-full flex flex-col gap-0">
                    {ranks.map((rank) => (
                        <div key={rank} className="h-12 flex items-center justify-center text-sm font-medium text-gray-600">
                            {rank}
                        </div>
                    ))}
                </div>
            </div>

            {state.mateInfo && state.mateInfo.status !== 'Game continues' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="font-medium text-yellow-800">Game Status</div>
                    <div className="text-sm text-yellow-700">{state.mateInfo.status}</div>
                    {state.mateInfo.moves && (
                        <div className="text-sm text-yellow-700">
                            Mate in {state.mateInfo.mate_in} for {state.mateInfo.for_side}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}