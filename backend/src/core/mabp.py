import chess
import time
from .chess_rules import mate_search
from .evaluation import evaluate_board, get_piece_value

def minimax_alpha_beta_pruning(fen, depth=7):
    try:
        # Cek posisi mate
        mate_result = mate_search(fen)
        if mate_result['mate']:
            return mate_result
        
        board = chess.Board(fen)
        
        # Jika game over
        if board.is_game_over():
            result = {'mate': True, 'best_move': None, 'evaluation': 0, 'depth': depth}
            if board.is_checkmate():
                result['evaluation'] = -9000 if board.turn == chess.WHITE else 9000
            return result
        
        start_time = time.time()
        
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

def order_moves(board, legal_moves):
    move_scores = []
    
    for move in legal_moves:
        score = 0
        
        # Jika move dapat meng-capture piece lawan
        if board.is_capture(move):
            captured_piece = board.piece_at(move.to_square)
            if captured_piece:
                score += get_piece_value(captured_piece.piece_type) * 10
        
        # Jika move membuat lawan check
        board.push(move)
        if board.is_check():
            score += 50
        board.pop()
        
        # Jika move membuat promosi (khusus pawn)
        if move.promotion:
            score += 900
        
        move_scores.append((move, score))
    
    # Sort berdasarkan score (descending)
    move_scores.sort(key=lambda x: x[1], reverse=True)
    return [move for move, _ in move_scores]