"use client";

import React from "react";

interface PromotionModalProps {
    isOpen: boolean;
    onPromote: (piece: string) => void;
    onCancel: () => void;
}

export default function PromotionModal({ isOpen, onPromote, onCancel }: PromotionModalProps) {
    if (!isOpen) return null;

    const pieces = [
        { type: 'q', name: 'Queen', icon: 'fas fa-chess-queen' },
        { type: 'r', name: 'Rook', icon: 'fas fa-chess-rook' },
        { type: 'b', name: 'Bishop', icon: 'fas fa-chess-bishop' },
        { type: 'n', name: 'Knight', icon: 'fas fa-chess-knight' }
    ];

    return (
        <div className="fixed top-20 right-4 z-50">
            <div className="bg-slate-800 rounded-lg p-4 shadow-2xl border-2 border-blue-300 max-w-sm">
                <h3 className="text-md font-semibold mb-3 text-center text-blue-700">
                    AI Magnus Promotion
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                    {pieces.map((piece) => (
                        <button
                            key={piece.type}
                            onClick={() => onPromote(piece.type)}
                            className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all hover:scale-105"
                        >
                            <i className={`${piece.icon} text-white text-2xl mb-1 drop-shadow-lg`} />
                            <span className="text-xs text-white font-medium">{piece.name}</span>
                        </button>
                    ))}
                </div>
                
                <button
                    onClick={onCancel}
                    className="w-full mt-3 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 text-sm font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}