"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface GameState {
    board: string;
    positions: any;
    selectedSquare: string | null;
    legalMoves: string[];
    currentTurn: 'white' | 'black';
    selectedAlgorithm: string;
    mateInfo: any;
    analysis: any;
    gameHistory: string[];
    isLoading: boolean;
}

type GameAction = 
    | { type: 'SET_BOARD'; payload: { board: string; positions: any; mateInfo?: any } }
    | { type: 'SET_SELECTED_SQUARE'; payload: string | null }
    | { type: 'SET_LEGAL_MOVES'; payload: string[] }
    | { type: 'SET_ALGORITHM'; payload: string }
    | { type: 'SET_ANALYSIS'; payload: any }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'ADD_TO_HISTORY'; payload: string }
    | { type: 'RESET_GAME' };

const initialState: GameState = {
    board: '',
    positions: {},
    selectedSquare: null,
    legalMoves: [],
    currentTurn: 'black',
    selectedAlgorithm: '',
    mateInfo: null,
    analysis: null,
    gameHistory: [],
    isLoading: false
};

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'SET_BOARD':
            return {
                ...state,
                board: action.payload.board,
                positions: action.payload.positions,
                mateInfo: action.payload.mateInfo || null,
                currentTurn: action.payload.board.includes(' w ') ? 'white' : 'black'
            };
        case 'SET_SELECTED_SQUARE':
            return { ...state, selectedSquare: action.payload };
        case 'SET_LEGAL_MOVES':
            return { ...state, legalMoves: action.payload };
        case 'SET_ALGORITHM':
            return { ...state, selectedAlgorithm: action.payload };
        case 'SET_ANALYSIS':
            return { ...state, analysis: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'ADD_TO_HISTORY':
            return { ...state, gameHistory: [...state.gameHistory, action.payload] };
        case 'RESET_GAME':
            return { 
                ...initialState, 
                selectedAlgorithm: state.selectedAlgorithm,
                currentTurn: 'black'
            };
        default:
            return state;
    }
}

const GameContext = createContext<{
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
}