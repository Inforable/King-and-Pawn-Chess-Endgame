import chess
import time
from .chess_rules import mate_search

def minimaxWithAlphaBeta(fen, depth=7):
    board = chess.Board(fen)

    if board.turn != chess.WHITE:
        return None, {"error": "Waiting for Black (Gukesh) to move"}
    
    start_time = time.time()
    best_move = None
    best_score = float('-inf')
    nodes_evaluated = 0

    # Rekursif untuk minimax dengan alpha-beta pruning
    def minimax(board, depth, alpha, beta, maximizing_player):
        nonlocal nodes_evaluated
        nodes_evaluated += 1

        # Base case saat depth = 0 atau game over
        if depth == 0 or board.is_game_over():
            return evaluate_board(board)
        
        if maximizing_player:
            max_eval = float('-inf')
            for move in board.legal_moves:
                board.push(move)
                eval_score = minimax(board, depth - 1, alpha, beta, False)
                board.pop()

                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)

                # Alpha-beta pruning
                if beta <= alpha:
                    break

            return max_eval
        else:
            min_eval = float('inf')
            for move in board.legal_moves:
                board.push(move)
                eval_score = minimax(board, depth - 1, alpha, beta, True)
                board.pop()

                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)

                # Alpha-beta pruning
                if beta <= alpha:
                    break
            return min_eval
    
    # Evaluasi semua legal moves untuk mencari best move
    for move in board.legal_moves:
        board.push(move)
        score = minimax(board, depth - 1, float('-inf'), float('inf'), False)
        board.pop()

        if score > best_score:
            best_score = score
            best_move = move
    
    end_time = time.time()

    # Analisis mate detection berdasarkan skor
    mate_info = mate_search(board, depth)

    analysis = {
        "algorithm": "Minimax with Alpha-Beta Pruning",
        "depth": depth,
        "score": best_score,
        "nodes": nodes_evaluated,
        "time": round(end_time - start_time, 3),
        "mate_in": mate_info["mate_in"],
        "for_side": mate_info["for_side"],
        "status": mate_info["status"]
    }

    return best_move.uci() if best_move else None, analysis

def evaluate_board(board):
    if board.is_checkmate():
        return -9000 if board.turn == chess.WHITE else 9000
    
    if board.is_stalemate() or board.is_insufficient_material():
        return 0
    
    score = 0

    pieces_values = {
        chess.PAWN: 100,
        chess.KNIGHT: 320,
        chess.BISHOP: 330,
        chess.ROOK: 500,
        chess.QUEEN: 900,
        chess.KING: 0
    }

    for piece_type in pieces_values:
        white_pieces = len(board.pieces(piece_type, chess.WHITE))
        black_pieces = len(board.pieces(piece_type, chess.BLACK))
        score += pieces_values[piece_type] * (white_pieces - black_pieces)

    score += evaluate_king_position(board)
    score += evaluate_pawn_advancement(board)
    score += evaluate_king_pawn_support(board)

    return score

def evaluate_king_position(board):
    score = 0
    white_king_square = board.king(chess.WHITE)
    black_king_square = board.king(chess.BLACK)

    if white_king_square and black_king_square:
        # Jarak king dari center board
        white_king_center_distance = abs(chess.square_file(white_king_square) - 3.5) + abs(chess.square_rank(white_king_square) - 3.5)
        black_king_square_distance = abs(chess.square_file(black_king_square) - 3.5) + abs(chess.square_rank(black_king_square) - 3.5)
        score += (black_king_square_distance - white_king_center_distance) * 10

        king_distance = king_distance = abs(chess.square_file(white_king_square) - chess.square_file(black_king_square)) + abs(chess.square_rank(white_king_square) - chess.square_rank(black_king_square))
        if king_distance == 2:
            score += 20 if board.turn == chess.BLACK else -20
    
    return score

def evaluate_pawn_advancement(board): # Jarak pawn/bidak ke baris terakhir lawan
    score = 0

    for square in board.pieces(chess.PAWN, chess.WHITE):
        rank = chess.square_rank(square)
        score += rank * rank * 5

        if rank >= 5:
            score += 50
        if rank == 6:
            score += 100
    
    return score

def evaluate_king_pawn_support(board): # Jarak king ke pawn/bidak
    score = 0
    white_king_square = board.king(chess.WHITE)
    black_king_square = board.king(chess.BLACK)

    for pawn_square in board.pieces(chess.PAWN, chess.WHITE):
        if white_king_square:
            white_king_pawn_distance = abs(chess.square_file(white_king_square) - chess.square_file(pawn_square)) + abs(chess.square_rank(white_king_square) - chess.square_rank(pawn_square))
            score += max(0, 8 - white_king_pawn_distance) * 5

        if black_king_square:
            black_king_pawn_distance = abs(chess.square_file(black_king_square) - chess.square_file(pawn_square)) + abs(chess.square_rank(black_king_square) - chess.square_rank(pawn_square))
            score += black_king_pawn_distance * 3
    
    return score
