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
    historyIndex: number | null;
    isLoading: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'checking';
    promotionData: {
        isPromoting: boolean;
        move: string | null;
    };
}

type GameAction = 
    | { type: 'SET_BOARD'; payload: { board: string; positions: any; mateInfo?: any } }
    | { type: 'SET_SELECTED_SQUARE'; payload: string | null }
    | { type: 'SET_LEGAL_MOVES'; payload: string[] }
    | { type: 'SET_ALGORITHM'; payload: string }
    | { type: 'SET_ANALYSIS'; payload: any }
    | { type: 'SET_MATE_INFO'; payload: any }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'ADD_TO_HISTORY'; payload: string }
    | { type: 'SET_HISTORY_INDEX'; payload: number }
    | { type: 'SET_CONNECTION_STATUS'; payload: 'connected' | 'disconnected' | 'checking' }
    | { type: 'START_PROMOTION'; payload: { move: string } }
    | { type: 'CANCEL_PROMOTION' }
    | { type: 'COMPLETE_PROMOTION' }
    | { type: 'RESET_GAME' }
    | { type: 'CLEAR_MOVE_DATA' };

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
    historyIndex: null,
    isLoading: false,
    connectionStatus: 'checking',
    promotionData: {
        isPromoting: false,
        move: null
    }
};

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'SET_BOARD':
            const boardFen = action.payload?.board;
            console.log('SET_BOARD payload:', action.payload);
            console.log('Board FEN:', boardFen);
            
            if (!boardFen || typeof boardFen !== 'string' || boardFen.trim() === '') {
                console.error('SET_BOARD called without valid board field!', action.payload);
                return state;
            }
            
            try {
                const newCurrentTurn = boardFen.includes(' w ') ? 'white' : 'black';
                console.log('Calculated currentTurn:', newCurrentTurn);
                
                return {
                    ...state,
                    board: boardFen,
                    positions: action.payload?.positions || {},
                    mateInfo: action.payload?.mateInfo || null,
                    currentTurn: newCurrentTurn,
                    selectedSquare: null,
                    legalMoves: [],
                    historyIndex: null
                };
            } catch (error) {
                console.error('Error processing SET_BOARD:', error);
                return state;
            }
        case 'SET_SELECTED_SQUARE':
            return { ...state, selectedSquare: action.payload };
        case 'SET_LEGAL_MOVES':
            return { ...state, legalMoves: action.payload };
        case 'SET_ALGORITHM':
            return { ...state, selectedAlgorithm: action.payload };
        case 'SET_ANALYSIS':
            return { ...state, analysis: action.payload };
        case 'SET_MATE_INFO':
            return { ...state, mateInfo: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'ADD_TO_HISTORY':
            if (!action.payload || typeof action.payload !== 'string' || action.payload.trim() === '') {
                console.error('Invalid FEN being added to history:', action.payload);
                return state;
            }
            return { 
                ...state, 
                gameHistory: [...state.gameHistory, action.payload],
                historyIndex: null
            };
        case 'SET_HISTORY_INDEX':
            return { ...state, historyIndex: action.payload };
        case 'SET_CONNECTION_STATUS':
            return { ...state, connectionStatus: action.payload };
        case 'START_PROMOTION':
            return {
                ...state,
                promotionData: {
                    isPromoting: true,
                    move: action.payload.move
                }
            };
        case 'CANCEL_PROMOTION':
            return {
                ...state,
                promotionData: {
                    isPromoting: false,
                    move: null
                }
            };
        case 'COMPLETE_PROMOTION':
            return {
                ...state,
                promotionData: {
                    isPromoting: false,
                    move: null
                }
            };
        case 'RESET_GAME':
            return { 
                ...initialState, 
                selectedAlgorithm: state.selectedAlgorithm,
                currentTurn: 'black',
                connectionStatus: state.connectionStatus
            };
        case 'CLEAR_MOVE_DATA':
            return {
                ...state,
                analysis: null,
                mateInfo: null,
                historyIndex: null,
                gameHistory: [],
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