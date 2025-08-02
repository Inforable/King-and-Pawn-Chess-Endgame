import chess
import time
from .chess_rules import mate_search
from .evaluation import evaluate_board, order_moves

def minimax_alpha_beta_pruning(fen, depth=5):
    try:
        board = chess.Board(fen)

        start_time = time.time()

        # Cek mate
        mate_result = mate_search(board)

        # Jika game over (checkmate, stalemate, and insufficient material)
        if board.is_game_over():
            end_time = time.time()
            time_taken = end_time - start_time

            result = {
                'mate': False,
                'best_move': None,
                'evaluation': 0,
                'depth': depth,
                'nodes_explored': 0,
                'time': time_taken,
                'game_over': True,
            }

            if board.is_checkmate():
                result['mate'] = True
                result['evaluation'] = -9000 if board.turn == chess.WHITE else 9000
                result['game_over_reason'] = 'Checkmate'
            elif board.is_stalemate():
                result['game_over_reason'] = 'Stalemate'
            elif board.is_insufficient_material():
                result['game_over_reason'] = 'Insufficient Material'
            
            return result
        
        best_move, best_score, nodes_explored = minimax_search(board, depth, float('-inf'), float('inf'), True, 0)
        
        end_time = time.time()
        time_taken = end_time - start_time
        
        return {
            'mate': False,
            'best_move': best_move.uci() if best_move else None,
            'evaluation': best_score,
            'depth': depth,
            'nodes_explored': nodes_explored,
            'time': time_taken
        }
    except Exception as e:
        return {'error': str(e), 'mate': False, 'best_move': None}

def minimax_search(board, depth, alpha, beta, maximizing_player, nodes_explored):
    nodes_explored += 1
    
    # Base case 1
    if depth == 0 or board.is_game_over():
        return None, evaluate_board(board), nodes_explored
    
    legal_moves = list(board.legal_moves)
    # Base case 2
    if not legal_moves:
        return None, evaluate_board(board), nodes_explored
    
    ordered_moves = order_moves(board, legal_moves)
    
    best_move = None
    
    if maximizing_player:
        max_eval = float('-inf')
        for move in ordered_moves:
            board.push(move)
            _, current_eval, nodes_explored = minimax_search(board, depth - 1, alpha, beta, False, nodes_explored)
            board.pop()
            
            if current_eval > max_eval:
                max_eval = current_eval
                best_move = move
            
            alpha = max(alpha, current_eval)
            if beta <= alpha:
                break
        
        return best_move, max_eval, nodes_explored
    else:
        min_eval = float('inf')
        for move in ordered_moves:
            board.push(move)
            _, current_eval, nodes_explored = minimax_search(board, depth - 1, alpha, beta, True, nodes_explored)
            board.pop()
            
            if current_eval < min_eval:
                min_eval = current_eval
                best_move = move
            
            beta = min(beta, current_eval)
            if beta <= alpha:
                break
        
        return best_move, min_eval, nodes_explored