"use client";

import React from "react";
import { useGame } from "../context/GameContext";

export default function MateInfo() {
    const { state } = useGame();

    const getMateStatus = () => {
        if (!state.mateInfo) return "Position loaded";
    
        if (state.mateInfo.mate_in) {
            return `Mate in ${state.mateInfo.mate_in} moves`;
        }
    
        return state.mateInfo.status || "Analysis pending";
    };

    const getMoveStatus = () => {
        const currentPlayer = state.currentTurn === 'white' ? 'AI Magnus' : 'Gukesh';
        return `Move: ${state.gameHistory.length} | ${currentPlayer} to play`;
    };

    const getStatusColor = () => {
        if (!state.mateInfo || !state.mateInfo.mate_in) {
            return "bg-gray-50 border-gray-200 text-gray-600";
        }
    
        return "bg-green-50 border-green-200 text-green-600";
    };

    return (
        <div className={`mt-7 border rounded-md px-6 py-4 w-full max-w-md text-center select-none shadow ${getStatusColor()}`}>
            <p className="font-bold text-2xl mb-1">{getMateStatus()}</p>
            <p className="text-sm text-gray-500">{getMoveStatus()}</p>
            {state.isLoading && (
                <p className="text-xs text-blue-500 mt-1">Computing...</p>
            )}
        </div>
    );
}