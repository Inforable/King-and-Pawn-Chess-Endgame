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

    const getMateStatusDisplay = () => {
        if (!state.mateInfo) return "Position loaded";
        
        // Tampilkan informasi mate in x moves, jika sudah ada
        if (state.mateInfo.mate_in !== null && state.mateInfo.mate_in !== undefined) {
            return `Mate in ${state.mateInfo.mate_in} moves for ${state.mateInfo.for_side}`;
        }
        
        return state.mateInfo.status || "Game continues";
    };

    const getMateStatusColor = () => {
        if (!state.mateInfo || !state.mateInfo.mate_in) {
            return "bg-gray-50 border-gray-200 text-gray-600";
        }
        
        if (state.mateInfo.for_side === "AI Magnus") {
            return "bg-green-50 border-green-200 text-green-700";
        } else {
            return "bg-red-50 border-red-200 text-red-700";
        }
    };

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

            <div className="mb-6">
                <div className="mb-2 font-medium">Game Status</div>
                <div className={`border rounded-md p-3 text-center ${getMateStatusColor()}`}>
                    <div className="font-semibold text-lg mb-1">
                        {getMateStatusDisplay()}
                    </div>
                    <div className="text-sm opacity-75">
                        Move: {state.gameHistory.length} | {state.currentTurn === 'white' ? 'AI Magnus' : 'Gukesh'} to play
                    </div>
                    {state.isLoading && (
                        <div className="text-xs text-blue-500 mt-1">Computing...</div>
                    )}
                </div>
            </div>

            {getDetailedAnalysisDisplay()}
        </div>
    );
}