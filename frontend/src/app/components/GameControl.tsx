"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import { ChessAPI } from "../service/api";

export default function GameControl() {
    const { state, dispatch } = useGame();

    const handleSolve = async () => {
        if (!state.board || !state.selectedAlgorithm) {
            alert('Please select a board and an algorithm');
            return;
        }

        const isWhiteTurn = state.board.includes(' w ');
        if (!isWhiteTurn) {
            alert('Wait for the black player (Gukesh) to make a move');
            return;
        }  
        
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

    const handleReset = () => {
        dispatch({ type: 'RESET_GAME' });
    };

    const isButtonDisabled = state.isLoading || !state.board || !state.selectedAlgorithm || state.currentTurn !== 'white';

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
                <div className="mb-2 font-medium">Game Action</div>
                <button
                    onClick={handleReset}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 shadow-sm flex items-center justify-center gap-2 font-medium"
                >
                    <i className="fas fa-undo text-lg text-red-600"></i>
                    Reset Game
                </button>
            </div>

            <div className="mb-6">
                <div className="mb-2 font-medium">Game Status</div>
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span>Current Turn:</span>
                        <span className={`font-medium ${state.currentTurn === 'white' ? 'text-gray-600' : 'text-black'}`}>
                            {state.currentTurn === 'white' ? 'AI Magnus' : 'Gukesh'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Selected Algorithm:</span>
                        <span className="font-medium">
                            {state.selectedAlgorithm || 'None'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Moves Played:</span>
                        <span className="font-medium">{state.gameHistory.length}</span>
                    </div>
                </div>
            </div>

            {state.analysis && (
                <div>
                    <div className="mb-2 font-medium">Analysis</div>
                    <dl className="text-sm text-slate-600 leading-relaxed space-y-1">
                        <div className="flex justify-between">
                            <dt className="font-medium">Algorithm:</dt>
                            <dd>{state.analysis.algorithm}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-medium">Depth/Sims:</dt>
                            <dd>{state.analysis.depth || state.analysis.simulations || state.analysis.max_depth_reached}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-medium">Score:</dt>
                            <dd>{state.analysis.score || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-medium">Nodes:</dt>
                            <dd>{state.analysis.nodes?.toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-medium">Time:</dt>
                            <dd>{state.analysis.time}s</dd>
                        </div>
                        {state.analysis.mate_in && (
                            <div className="flex justify-between">
                                <dt className="font-medium">Mate in:</dt>
                                <dd className="text-green-600 font-bold">{state.analysis.mate_in}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}  
        </div>
    )
}