import chess
import time
from .chess_rules import mate_search
from .evaluation import evaluate_board

def principal_variation_search(fen, depth=5):
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
        
        best_move, best_score = pvs_root(board, depth)
        
        end_time = time.time()
        time_taken = end_time - start_time
        
        return {
            'mate': False,
            'best_move': best_move.uci() if best_move else None,
            'evaluation': best_score,
            'depth': depth,
            'time': time_taken
        }
    except Exception as e:
        return {'error': str(e), 'mate': False, 'best_move': None}

def pvs_root(board, depth):
    best_move = None
    best_score = float('-inf') if board.turn == chess.WHITE else float('inf')
    
    # Jika tidak ada legal moves
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None, evaluate_board(board)
    
    # Cari dengan full window for first move
    first_move = legal_moves[0]
    board.push(first_move)
    first_score = -pvs_search(board, depth - 1, float('-inf'), float('inf'), False)
    board.pop()
    
    best_move = first_move
    best_score = first_score
    
    for move in legal_moves[1:]:
        board.push(move)
        
        # Null window search
        score = -pvs_search(board, depth - 1, -best_score - 1, -best_score, False)
        
        # Jika fail high, re-search dengan full window
        if score > best_score:
            score = -pvs_search(board, depth - 1, float('-inf'), -best_score, False)
        
        board.pop()
        
        if board.turn == chess.WHITE and score > best_score:
            best_score = score
            best_move = move
        elif board.turn == chess.BLACK and score < best_score:
            best_score = score
            best_move = move
    
    return best_move, best_score

def pvs_search(board, depth, alpha, beta, is_null_window):
    # Base case 1
    if depth == 0 or board.is_game_over():
        return evaluate_board(board)
    
    # Base case 2
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return evaluate_board(board)
    
    # Untuk node pertama
    first_move = legal_moves[0]
    board.push(first_move)
    best_score = -pvs_search(board, depth - 1, -beta, -alpha, False)
    board.pop()
    
    if best_score >= beta:
        return best_score
    
    alpha = max(alpha, best_score)

    for move in legal_moves[1:]:
        board.push(move)
        
        # Null window search
        score = -pvs_search(board, depth - 1, -alpha - 1, -alpha, True)
        
        # Jika fail high, re-search
        if alpha < score < beta:
            score = -pvs_search(board, depth - 1, -beta, -score, False)
        
        board.pop()
        
        if score >= beta:
            return score
        
        alpha = max(alpha, score)
        best_score = max(best_score, score)
    
    return best_score