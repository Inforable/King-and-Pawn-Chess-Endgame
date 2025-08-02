import chess
import time
from .chess_rules import mate_search
from .evaluation import evaluate_board, order_moves

def iterative_deepening_search(fen, max_depth=8, time_limit=5.0):
    try:
        # Cek posisi mate
        mate_result = mate_search(fen)
        if mate_result['mate']:
            return mate_result
        
        board = chess.Board(fen)
        
        # Jika game over
        if board.is_game_over():
            result = {'mate': True, 'best_move': None, 'evaluation': 0, 'depth': max_depth}
            if board.is_checkmate():
                result['evaluation'] = -9000 if board.turn == chess.WHITE else 9000
            return result
        
        start_time = time.time()
        
        best_move = None
        best_score = 0
        nodes_explored = 0
        depths_completed = 0
        
        # Iterative deepening loop
        for depth in range(1, max_depth + 1):
            if (time.time() - start_time) >= time_limit:
                break
            
            try:
                current_best_move, current_best_score, current_nodes = minimax_with_timeout(
                    board, depth, float('-inf'), float('inf'), True, 0, start_time, time_limit
                )
                
                if current_best_move is not None:
                    best_move = current_best_move
                    best_score = current_best_score
                    nodes_explored += current_nodes
                    depths_completed = depth
                
            except TimeoutException:
                break
        
        end_time = time.time()
        time_taken = end_time - start_time
        
        return {
            'mate': False,
            'best_move': best_move.uci() if best_move else None,
            'evaluation': best_score,
            'depth': depths_completed,
            'nodes_explored': nodes_explored,
            'time': time_taken
        }
    except Exception as e:
        return {'error': str(e), 'mate': False, 'best_move': None}

class TimeoutException(Exception):
    pass

def minimax_with_timeout(board, depth, alpha, beta, maximizing_player, nodes_explored, start_time, time_limit):
    # Check timeout
    if (time.time() - start_time) >= time_limit:
        raise TimeoutException()
    
    nodes_explored += 1
    
    if depth == 0 or board.is_game_over():
        return None, evaluate_board(board), nodes_explored
    
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None, evaluate_board(board), nodes_explored
    
    ordered_moves = order_moves(board, legal_moves)
    
    best_move = None
    
    if maximizing_player:
        max_eval = float('-inf')
        for move in ordered_moves:
            board.push(move)
            _, current_eval, nodes_explored = minimax_with_timeout(
                board, depth - 1, alpha, beta, False, nodes_explored, start_time, time_limit
            )
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
            _, current_eval, nodes_explored = minimax_with_timeout(
                board, depth - 1, alpha, beta, True, nodes_explored, start_time, time_limit
            )
            board.pop()
            
            if current_eval < min_eval:
                min_eval = current_eval
                best_move = move
            
            beta = min(beta, current_eval)
            if beta <= alpha:
                break
        
        return best_move, min_eval, nodes_explored