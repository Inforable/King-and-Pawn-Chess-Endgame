"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import { ChessAPI } from "../service/api";
import PromotionModal from "./PromotionModal";

export default function GameControl() {
    const { state, dispatch } = useGame();

    const handleSolve = async () => {
        if (!state.board || !state.selectedAlgorithm) {
            alert('Please select a board and an algorithm');
            return;
        }

        if (state.currentTurn !== 'white') {
            alert(`Wait for Gukesh to make a move first. Current turn: ${state.currentTurn}`);
            return;
        }  
        
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const result = await ChessAPI.solvePosition(state.board, state.selectedAlgorithm);
            
            if (result.success) {
                if (result.promotion_required) {
                    dispatch({
                        type: 'START_PROMOTION',
                        payload: {
                            move: result.move
                        }
                    });
                    dispatch({ type: 'SET_ANALYSIS', payload: result.analysis });
                    return;
                }

                if (result.game_over) {
                    dispatch({ type: 'SET_ANALYSIS', payload: result.analysis });
                    
                    if (result.mate_info) {
                        result.mate_info.winner = result.winner;
                    }
                    
                    dispatch({ type: 'SET_MATE_INFO', payload: result.mate_info });
                    
                    const winner = result.winner;
                    let gameOverMessage = result.game_over_reason || 'Game Over';
                    
                    if (winner) {
                        gameOverMessage = `${winner} wins! ${gameOverMessage}`;
                    } else {
                        gameOverMessage = `Draw! ${gameOverMessage}`;
                    }
                    
                    const shouldRestart = window.confirm(
                        `${gameOverMessage}\n\nWould you like to start a new game?\n\nClick OK to reset, or Cancel to analyze this position.`
                    );
                    if (shouldRestart) {
                        dispatch({ type: 'RESET_GAME' });
                        alert('Game has been reset. Please upload a new board or randomize a position to start playing.');
                    }
                    return;
                }

                if (result.move && result.board) {
                    dispatch({
                        type: 'SET_BOARD',
                        payload: {
                            board: result.board,
                            positions: result.positions,
                            mateInfo: result.mate_info
                        }
                    });
                    dispatch({ type: 'SET_ANALYSIS', payload: result.analysis });
                    
                    if (result.board && typeof result.board === 'string' && result.board.trim() !== '') {
                        dispatch({ type: 'ADD_TO_HISTORY', payload: result.board });
                    }
                } else {
                    console.error('No move or board in solve result:', result);
                    alert('No valid move found');
                }
            } else {
                const errorMessage = result.error || 'Failed to solve position';
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Solve error:', error);
            alert('Network error: Failed to communicate with the server. Please check your connection and try again.');
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const handleAIPromotion = async (promotionPiece: string) => {
        if (!state.promotionData.move) return;

        const baseMove = state.promotionData.move;
        let promotionMove;

        if (baseMove.length === 4) {
            promotionMove = baseMove + promotionPiece;
        } else {
            promotionMove = baseMove.substring(0, 4) + promotionPiece;
        }

        try {
            dispatch({ type: "SET_LOADING", payload: true });
            const result = await ChessAPI.solvePosition(state.board, state.selectedAlgorithm, promotionMove);
            console.log('Promotion result:', result);
            
            if (result.success && result.board) {
                dispatch({
                    type: 'SET_BOARD',
                    payload: {
                        board: result.board,
                        positions: result.positions,
                        mateInfo: result.mate_info
                    }
                });
                dispatch({ type: 'SET_ANALYSIS', payload: result.analysis });
                
                if (result.board && typeof result.board === 'string' && result.board.trim() !== '') {
                    dispatch({ type: 'ADD_TO_HISTORY', payload: result.board });
                }
                
                dispatch({ type: 'COMPLETE_PROMOTION' });
            } else {
                console.error('Promotion failed:', result);
                alert('Failed to complete promotion');
            }
        } catch (error) {
            console.error('AI promotion error:', error);
            alert('Failed to complete AI promotion');
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const handleCancelPromotion = () => {
        dispatch({ type: 'CANCEL_PROMOTION' });
    };

    const isButtonDisabled = state.isLoading || !state.board || !state.selectedAlgorithm || state.currentTurn !== 'white';

    const getDetailedAnalysisDisplay = () => {
        if (!state.analysis) return null;
        
        const analysis = state.analysis;
        
        return (
            <div className="text-sm text-gray-600 mt-2">
                <div className="font-medium mb-1">Analysis Details:</div>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                    {analysis.time !== undefined && (
                        <div className="flex justify-between">
                            <span>Time:</span>
                            <span className="font-mono">{analysis.time.toFixed(3)}s</span>
                        </div>
                    )}

                    {analysis.evaluation !== undefined && (
                        <div className="flex justify-between">
                            <span>Evaluation:</span>
                            <span className="font-mono">{analysis.evaluation > 0 ? '+' : ''}{analysis.evaluation}</span>
                        </div>
                    )}

                    {analysis.depth !== undefined && (
                        <div className="flex justify-between">
                            <span>Depth:</span>
                            <span className="font-mono">{analysis.depth}</span>
                        </div>
                    )}

                    {analysis.nodes_explored !== undefined && (
                        <div className="flex justify-between">
                            <span>Nodes Explored:</span>
                            <span className="font-mono">{analysis.nodes_explored.toLocaleString()}</span>
                        </div>
                    )}

                    {analysis.iterations !== undefined && (
                        <div className="flex justify-between">
                            <span>Iterations:</span>
                            <span className="font-mono">{analysis.iterations.toLocaleString()}</span>
                        </div>
                    )}

                    {analysis.mate && analysis.mate_info && (
                        <div className="flex justify-between text-red-600 font-medium">
                            <span>Mate Status:</span>
                            <span>{analysis.mate_info.status}</span>
                        </div>
                    )}

                    {analysis.game_over && (
                        <div className="flex justify-between text-red-600 font-medium">
                            <span>Game Over:</span>
                            <span className="capitalize">{analysis.game_over_reason || 'Game Over'}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 className="font-semibold text-xl mb-6">Game Control</h2>

            <div className="mb-6">
                <div className="mb-2 font-medium">Magnus Action</div>
                <button
                    onClick={handleSolve}
                    disabled={isButtonDisabled}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 bg-blue-50 hover:bg-blue-100 shadow-sm flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <i className="fas fa-brain text-lg text-blue-600"></i>
                   {state.isLoading ? 'Thinking...' : 'AI Magnus Move'}
                </button>
            </div>

            <div className="mt-6">
                <div className="mb-2 font-medium">Reset Game</div>
                <button
                    onClick={() => {
                        const confirmReset = window.confirm('Are you sure you want to reset the game? This will clear all progress.');
                        if (confirmReset) {
                            dispatch({ type: 'RESET_GAME' });
                            alert('Game has been reset. Please upload a new board or randomize a position to start playing.');
                        }
                    }}
                    className="w-full border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 shadow-sm flex items-center justify-center gap-2 font-medium text-red-700"
                >
                    <i className="fas fa-refresh text-lg"></i>
                    Reset Game
                </button>
            </div>

            <div className="mt-6">
                <div className="mb-2 font-medium">Game Playback</div>
                {state.gameHistory.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-4 border rounded-md bg-gray-50">
                        No moves recorded yet
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                            Total moves: {state.gameHistory.length}
                        </div>
                        <div className="bg-gray-50 p-3 rounded border">
                            <div className="text-xs font-medium mb-2">Move History:</div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {state.gameHistory
                                    .filter((fen, index) => {
                                        const isValid = fen && 
                                                       typeof fen === 'string' && 
                                                       fen.trim() !== '' && 
                                                       fen.includes('/') && 
                                                       fen.split(' ').length >= 2;
                                        
                                        if (!isValid) {
                                            console.warn(`Invalid FEN at history index ${index}:`, fen);
                                        }
                                        return isValid;
                                    })
                                    .map((fen, filteredIndex) => {
                                        const fenParts = fen.split(' ');
                                        const turn = fenParts.length >= 2 ? fenParts[1] : 'unknown';
                                        
                                        return (
                                            <div
                                                key={filteredIndex}
                                                className="text-xs p-2 bg-white border rounded hover:bg-blue-50 cursor-pointer"
                                                onClick={async () => {
                                                    console.log('Loading board from history:', fen);
                                                    
                                                    if (!fen || typeof fen !== 'string' || fen.trim() === '') {
                                                        console.error('Invalid FEN in history:', fen);
                                                        alert('Invalid board data in history');
                                                        return;
                                                    }
                                                    
                                                    try {
                                                        const result = await ChessAPI.parseFen(fen);
                                                        if (result.success) {
                                                            dispatch({
                                                                type: 'SET_BOARD',
                                                                payload: {
                                                                    board: fen,
                                                                    positions: result.positions,
                                                                    mateInfo: result.mate_info
                                                                }
                                                            });
                                                        } else {
                                                            console.error('API error:', result.error);
                                                            alert('Failed to load board from history');
                                                        }
                                                    } catch (error) {
                                                        console.error('Error loading board from history:', error);
                                                        alert('Network error while loading board');
                                                    }
                                                }}
                                            >
                                                <div className="flex justify-between">
                                                    <span className="font-mono">Move #{filteredIndex + 1}</span>
                                                    <span className="text-gray-500">
                                                        {turn === 'w' ? 'White to play' : turn === 'b' ? 'Black to play' : 'Unknown turn'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <PromotionModal
                isOpen={state.promotionData.isPromoting}
                onPromote={handleAIPromotion}
                onCancel={handleCancelPromotion}
            />

            {getDetailedAnalysisDisplay()}
        </div>
    );
}