const API_BASE = 'http://localhost:5000/api';

export class ChessAPI {
    static async uploadBoard(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(errorData.error || 'Upload failed');
        }

        return response.json();
    }

    static async randomizeBoard() {
        const response = await fetch(`${API_BASE}/randomize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Randomize failed' }));
            throw new Error(errorData.error || 'Randomize failed');
        }

        return response.json();
    }

    static async solvePosition(fen: string, algorithm: string) {
        const response = await fetch(`${API_BASE}/solve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fen, algorithm })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Solve failed' }));
            throw new Error(errorData.error || 'Solve failed');
        }

        return response.json();
    }

    static async makeMove(fen: string, move: string) {
        const response = await fetch(`${API_BASE}/gukesh-move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fen, move })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Move failed' }));
            throw new Error(errorData.error || 'Move failed');
        }

        return response.json();
    }

    static async getLegalMoves(fen: string, square?: string) {
        if (!fen || fen.trim() === '') {
            throw new Error('Board position (FEN) is required');
        }
        
        const response = await fetch(`${API_BASE}/legal-moves`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fen, square })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to get legal moves' }));
            throw new Error(errorData.error || 'Failed to get legal moves');
        }

        return response.json();
    }

        static async checkHealth() {
        const response = await fetch(`${API_BASE}/health`);
        
        if (!response.ok) {
            throw new Error('Server is not responding');
        }

        return response.json();
    }
}