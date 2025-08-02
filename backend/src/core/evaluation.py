import chess

def evaluate_board(board):
    if board.is_checkmate():
        return -9000 if board.turn == chess.WHITE else 9000
    
    if board.is_stalemate() or board.is_insufficient_material():
        return 0
    
    score = 0

    # Value untuk setiap piece (harusnya cukup pawn, queen, sama king si, cuma ntar sekalian untuk bonus promotion)
    pieces_values = {
        chess.PAWN: 100,
        chess.KNIGHT: 320,
        chess.BISHOP: 330,
        chess.ROOK: 500,
        chess.QUEEN: 900,
        chess.KING: 0
    }

    # Menghitung score total (jika positif, AI Magnus unggul)
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
        # Advantage jika posisi raja di tengah
        white_king_center_distance = abs(chess.square_file(white_king_square) - 3.5) + abs(chess.square_rank(white_king_square) - 3.5)
        black_king_center_distance = abs(chess.square_file(black_king_square) - 3.5) + abs(chess.square_rank(black_king_square) - 3.5)
        score += (black_king_center_distance - white_king_center_distance) * 10
        
        # Jarak antar raja
        king_distance = abs(chess.square_file(white_king_square) - chess.square_file(black_king_square)) + abs(chess.square_rank(white_king_square) - chess.square_rank(black_king_square))
        if king_distance == 2:
            score += 20 if board.turn == chess.BLACK else -20
    
    return score

def evaluate_pawn_advancement(board):
    score = 0
    
    for square in board.pieces(chess.PAWN, chess.WHITE):
        rank = chess.square_rank(square)
        score += rank * rank * 5 
        
        if rank >= 5:
            score += 50
        if rank == 6:
            score += 100
    
    return score

def evaluate_king_pawn_support(board):
    score = 0
    white_king_square = board.king(chess.WHITE)
    black_king_square = board.king(chess.BLACK)
    
    # Posisi king dari masing-masing warna terhadap pawn
    for pawn_square in board.pieces(chess.PAWN, chess.WHITE):
        if white_king_square:
            white_king_pawn_distance = abs(chess.square_file(white_king_square) - chess.square_file(pawn_square)) + abs(chess.square_rank(white_king_square) - chess.square_rank(pawn_square))
            score += max(0, 8 - white_king_pawn_distance) * 5
        
        if black_king_square:
            black_king_pawn_distance = abs(chess.square_file(black_king_square) - chess.square_file(pawn_square)) + abs(chess.square_rank(black_king_square) - chess.square_rank(pawn_square))
            score += black_king_pawn_distance * 3
    
    return score

def evaluate_board_for_mcts(board):
    raw_score = evaluate_board(board)
    
    # Normalisasi ke range [-1, 1]
    if abs(raw_score) >= 9000:  # Untuk checkmate
        return 1.0 if raw_score > 0 else -1.0
    
    # Normalisasi raw score
    return max(-1.0, min(1.0, raw_score / 1000.0))

def get_piece_value(piece_type):
    values = {
        chess.PAWN: 100,
        chess.KNIGHT: 320,
        chess.BISHOP: 330,
        chess.ROOK: 500,
        chess.QUEEN: 900,
        chess.KING: 0
    }
    return values.get(piece_type, 0)

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