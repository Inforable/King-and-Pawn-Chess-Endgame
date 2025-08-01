"use client";

import React, { useRef } from "react";
import { useGame } from "../context/GameContext";
import { ChessAPI } from "../service/api";

export default function GameSetup() {
    const { state, dispatch } = useGame();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Load file
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const result = await ChessAPI.uploadBoard(file);
            if (result.success) {
                dispatch({
                    type: "SET_BOARD",
                    payload: {
                        board: result.board,
                        positions: result.positions,
                        mateInfo: result.mate_info
                    }
                });
                dispatch({ type: 'ADD_TO_HISTORY', payload: result.board });
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload board file');
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Randomize board
    const handleRandomize = async () => {
        dispatch({ type: "SET_LOADING", payload: true });

        try {
            const result = await ChessAPI.randomizeBoard();
            if (result.success) {
                dispatch({
                    type: "SET_BOARD",
                    payload: {
                        board: result.board,
                        positions: result.positions,
                        mateInfo: result.mate_info
                    }
                });
                dispatch({ type: 'ADD_TO_HISTORY', payload: result.board });
            }
        } catch (error) {
            console.error('Randomize error:', error);
            alert('Failed to randomize board');
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    // Handle algorithm selection
    const handleAlgorithmChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedAlgorithm = event.target.value;
        dispatch({ type: "SET_ALGORITHM", payload: selectedAlgorithm });
    };

    return (
        <div>
            <h2 className="font-semibold text-xl mb-6">Game Setup</h2>
            <div className="mb-6">
                <div className="mb-4 font-medium">Board State</div>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={state.isLoading}
                        className="cursor-pointer rounded-md border border-slate-200 px-4 py-2 flex items-center gap-2 bg-white hover:bg-slate-50 shadow-sm font-medium disabled:opacity-50"
                    >
                        <i className="fas fa-upload text-gray-500 text-lg"></i>
                        {state.isLoading ? 'Uploading...' : 'Upload Board (.txt)'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={handleRandomize}
                        disabled={state.isLoading}
                        className="rounded-md border border-slate-200 px-4 py-2 flex items-center gap-2 bg-white hover:bg-slate-50 shadow-sm font-medium disabled:opacity-50"
                    >
                        <i className="fas fa-random text-gray-500 text-lg"></i>
                        {state.isLoading ? 'Randomizing...' : 'Randomize Board'}
                    </button>
                </div>
            </div>
            <div>
                <div className="mb-2 font-medium">AI Magnus Algorithm</div>
                <select
                    value={state.selectedAlgorithm}
                    onChange={handleAlgorithmChange}
                    className="w-full rounded-md border border-slate-200 px-4 py-2 bg-white hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="" disabled>Select algorithm</option>
                    <option value="mabp">Minimax + Alpha-Beta Pruning</option>
                    <option value="iterative_deepening">Iterative Deepening Search</option>
                    <option value="pvs">Principal Variation Search (PVS)</option>
                    <option value="mcts">Monte Carlo Tree Search (MCTS)</option>
                </select>
            </div>
        </div>
    );
}