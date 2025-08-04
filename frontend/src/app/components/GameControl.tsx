"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import { ChessAPI } from "../service/api";

export default function GameControl() {
    const { state, dispatch } = useGame();

    const handleSolve = async () => {
        // Validasi untuk board dan algoritma
        if (!state.board || !state.selectedAlgorithm) {
            alert('Please select a board and an algorithm');
            return;
        }

        // Validasi giliran untuk AI Magnus
        if (state.currentTurn !== 'white') {
            alert(`Wait for Gukesh to make a move first. Current turn: ${state.currentTurn}`);
            return;
        }  
        
        // Solve
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const result = await ChessAPI.solvePosition(state.board, state.selectedAlgorithm);
            if (result.success) {
                dispatch({
                    type: 'SET_BOARD',
                    payload: {
                        board: result.board,
                        positions: result.positions,
                        mateInfo: result.mate_info
                    }
                });
                dispatch({ type: 'SET_ANALYSIS', payload: result.analysis });
                dispatch({ type: 'ADD_TO_HISTORY', payload: result.board });
            }
        } catch (error) {
            console.error('Solve error:', error);
            alert('Failed to solve position');
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const isButtonDisabled = state.isLoading || !state.board || !state.selectedAlgorithm || state.currentTurn !== 'white';

    const getDetailedAnalysisDisplay = () => {
        if (!state.analysis) return null;
        
        const analysis = state.analysis;
        
        return (
            <div className="text-sm text-gray-600 mt-2">
                <div className="font-medium mb-1">Analysis Details:</div>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                    {/* Waktu */}
                    {analysis.time !== undefined && (
                        <div className="flex justify-between">
                            <span>Time:</span>
                            <span className="font-mono">{analysis.time.toFixed(3)}s</span>
                        </div>
                    )}

                    {/* Evaluasi posisi */}
                    {analysis.evaluation !== undefined && (
                        <div className="flex justify-between">
                            <span>Evaluation:</span>
                            <span className="font-mono">{analysis.evaluation > 0 ? '+' : ''}{analysis.evaluation}</span>
                        </div>
                    )}

                    {/* Depth pencarian */}
                    {analysis.depth !== undefined && (
                        <div className="flex justify-between">
                            <span>Depth:</span>
                            <span className="font-mono">{analysis.depth}</span>
                        </div>
                    )}

                    {/* Node yang dieksplorasi */}
                    {analysis.nodes_explored !== undefined && (
                        <div className="flex justify-between">
                            <span>Nodes Explored:</span>
                            <span className="font-mono">{analysis.nodes_explored.toLocaleString()}</span>
                        </div>
                    )}

                    {/* Iterasi (khusus MCTS) */}
                    {analysis.iterations !== undefined && (
                        <div className="flex justify-between">
                            <span>Iterations:</span>
                            <span className="font-mono">{analysis.iterations.toLocaleString()}</span>
                        </div>
                    )}

                    {/* Status mate */}
                    {analysis.mate && analysis.mate_info && (
                        <div className="flex justify-between text-red-600 font-medium">
                            <span>Mate Status:</span>
                            <span>{analysis.mate_info.status}</span>
                        </div>
                    )}

                    {/* Game over */}
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
                    className="w-full border border-red-200 rounded-md px-3 py-2 bg-white hover:bg-red-100 shadow-sm flex items-center justify-center gap-2 font-medium text-red-700"
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
                                {state.gameHistory.map((fen, index) => (
                                    <div
                                        key={index}
                                        className="text-xs p-2 bg-white border rounded hover:bg-blue-50 cursor-pointer"
                                        onClick={() => {
                                            dispatch({
                                                type: 'SET_BOARD',
                                                payload: {
                                                    board: fen,
                                                    positions: null
                                                }
                                            });
                                        }}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-mono">Move #{index + 1}</span>
                                            <span className="text-gray-500">
                                                {fen.split(' ')[1] === 'w' ? 'White to play' : 'Black to play'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {getDetailedAnalysisDisplay()}
        </div>
    );
}