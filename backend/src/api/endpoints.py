from flask import Flask, request, jsonify
from flask_cors import CORS
import chess
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from core.chess_rules import validate_board, apply_move, randomize_board, mate_search
from core.mabp import minimax_alpha_beta_pruning
from core.mcts import monte_carlo_tree_search
from core.iterative_deepening import iterative_deepening_search
from util.board_parser import parse_board, board_to_positions

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Untuk handle upload file input
@app.route('/api/upload', methods=['POST'])
def upload_board():
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file uploaded"}), 400
        
        # Validasi file
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
        
        # Validasi format file (harus txt)
        if not file.filename.endswith('.txt'):
            return jsonify({"success": False, "error": "File must be a .txt file"}), 400
        
        board = parse_board(file)
        
        # Validasi konfigurasi board
        if not validate_board(board):
            return jsonify({"success": False, "error": "Invalid board configuration"}), 400
        
        positions = board_to_positions(board)
        mate_info = mate_search(board)
        
        return jsonify({
            "success": True,
            "board": board.fen(),
            "positions": positions,
            "mate_info": mate_info
        })
        
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500

# Untuk handle randomization board
@app.route('/api/randomize', methods=['POST'])
def randomize():
    try:
        board = randomize_board()
        positions = board_to_positions(board)
        mate_info = mate_search(board)
        
        return jsonify({
            "success": True,
            "board": board.fen(),
            "positions": positions,
            "mate_info": mate_info
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Randomization failed: {str(e)}"}), 500

# Untuk handle move dari AI magnus
@app.route('/api/solve', methods=['POST'])
def solve():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        fen = data.get('fen')
        algorithm = data.get('algorithm')
        promotion_move = data.get('promotion_move') # Pengecekan apakah move sekarang membuat pawn dapat promosi

        if not fen or not algorithm:
            return jsonify({"success": False, "error": "Missing fen or algorithm"}), 400
        
        board = chess.Board(fen)

        # Validasi turn
        if not board.turn == chess.WHITE:
            return jsonify({"success": False, "error": "It's not AI Magnus's turn"}), 400
        
        print(f"Solving with algorithm: {algorithm}")
        
        if promotion_move:
            try:
                move = chess.Move.from_uci(promotion_move)
                if move in board.legal_moves:
                    board.push(move)
                    positions = board_to_positions(board)
                    mate_info = mate_search(board)
                    
                    return jsonify({
                        "success": True,
                        "move": promotion_move,
                        "board": board.fen(),
                        "positions": positions,
                        "mate_info": mate_info,
                        "analysis": {
                            "evaluation": 0,
                            "time": 0.001,
                            "promotion": True
                        }
                    })
                else:
                    return jsonify({"success": False, "error": "Invalid promotion move"}), 400
            except Exception as e:
                return jsonify({"success": False, "error": f"Promotion move error: {str(e)}"}), 400
        
        # Solve based on algoritma yang dipilih
        if algorithm == 'mabp':
            result = minimax_alpha_beta_pruning(fen, depth=5)
        elif algorithm == 'mcts':
            result = monte_carlo_tree_search(fen, time_limit=7.0)
        elif algorithm == 'iterative_deepening':
            result = iterative_deepening_search(fen, max_depth=5, time_limit=7.0)
        else:
            return jsonify({"success": False, "error": "Invalid algorithm"}), 400

        if 'error' in result:
            return jsonify({"success": False, "error": result['error']}), 400
        
        # Kondisi jika game_over (bisa checkmate, draw)
        if result.get('game_over'):
            return jsonify({
                "success": True,
                "game_over": True,
                "game_over_reason": result.get('game_over_reason'),
                "analysis": result,
                "message": f"Game is over: {result.get('game_over_reason', 'unknown')}"
            })
        
        if result.get('mate') and not result.get('best_move'):
            return jsonify({
                "success": True,
                "mate": True,
                "mate_info": result.get('mate_info'),
                "analysis": result,
                "message": "Position has forced mate sequence"
            })
        
        best_move = result.get('best_move')
        if not best_move:
            return jsonify({"success": False, "error": "No valid move found"}), 400
        
        move = chess.Move.from_uci(best_move)

        # Untuk promosiin pawn
        if board.piece_at(move.from_square) and board.piece_at(move.from_square).piece_type == chess.PAWN:
            to_rank = chess.square_rank(move.to_square)
            if (board.turn == chess.WHITE and to_rank == 7):
                return jsonify({
                    "success": True,
                    "promotion_required": True,
                    "move": best_move,
                    "analysis": result,
                    "message": "AI Magnus needs to choose promotion piece"
                })
        
        new_board, success = apply_move(fen, best_move)
        if not success:
            return jsonify({"success": False, "error": "Failed to apply move"}), 400

        positions = board_to_positions(new_board)
        mate_info = mate_search(new_board)

        return jsonify({
            "success": True,
            "move": best_move,
            "board": new_board.fen(),
            "positions": positions,
            "analysis": result,
            "mate_info": mate_info
        })
    
    except Exception as e:
        print(f"Error in solve endpoint: {str(e)}")
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500

# Untuk handle move dari Gukesh
@app.route('/api/gukesh-move', methods=['POST'])
def make_move():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        fen = data.get('fen')
        move = data.get('move')

        if not fen or not move:
            return jsonify({"success": False, "error": "Missing fen or move"}), 400
        
        board = chess.Board(fen)

        # Validasi turn
        if not board.turn == chess.BLACK:
            return jsonify({"success": False, "error": "It's not Gukesh's turn"}), 400
        
        new_board, success = apply_move(fen, move)
        if not success:
            return jsonify({"success": False, "error": "Failed to apply move"}), 400
        
        positions = board_to_positions(new_board)
        mate_info = mate_search(new_board)

        return jsonify({
            "success": True,
            "board": new_board.fen(),
            "positions": positions,
            "mate_info": mate_info
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500

# Untuk handle legal moves
@app.route('/api/legal-moves', methods=['POST'])
def get_legal_moves():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        fen = data.get('fen')
        square = data.get('square')

        if not fen:
            return jsonify({"success": False, "error": "Missing fen"}), 400
        
        board = chess.Board(fen)
        
        if square:
            square_index = chess.parse_square(square)
            piece = board.piece_at(square_index)
            
            if piece is None:
                return jsonify({"success": True, "legal_moves": []})
            
            if piece.color != board.turn:
                return jsonify({"success": True, "legal_moves": []})
            
            legal_moves = []
            for move in board.legal_moves:
                if move.from_square == square_index:
                    legal_moves.append(chess.square_name(move.to_square))
            
            return jsonify({"success": True, "legal_moves": legal_moves})
        else:
            legal_moves = [move.uci() for move in board.legal_moves]
            return jsonify({"success": True, "legal_moves": legal_moves})
    
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500

# Untuk handle parse dari fen
@app.route('/api/parse-fen', methods=['POST'])
def parse_fen():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        fen = data.get('fen')

        if not fen:
            return jsonify({"success": False, "error": "Missing fen"}), 400
        
        board = chess.Board(fen)
        positions = board_to_positions(board)
        mate_info = mate_search(board)
        
        return jsonify({
            "success": True,
            "positions": positions,
            "mate_info": mate_info
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to parse FEN: {str(e)}"}), 500

# Untuk cek status koneksi
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Chess API is running"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)