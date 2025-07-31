import chess
import random

def validate_board(board):
    try:
        pieces = board.piece_map()
        # print(pieces)

        # Menghitung jumlah setiap komponen catur
        piece_count = {}
        for piece in pieces.values():
            key = f"{piece.color}_{piece.piece_type}"
            piece_count[key] = piece_count.get(key, 0) + 1
        
        required_pieces = {
            f"{chess.WHITE}_{chess.KING}": 1,
            f"{chess.WHITE}_{chess.PAWN}": 1,
            f"{chess.BLACK}_{chess.KING}": 1,
        }

        # Validasi jumlah per komponen catur
        for piece_key, expected_count in required_pieces.items():
            if piece_count.get(piece_key, 0) != expected_count:
                return False

        # Validasi jumlah total komponen catur
        total_pieces = sum(piece_count.values())
        if total_pieces != 3:
            return False
        
        # Validasi posisi king
        white_king = board.king(chess.WHITE)
        black_king = board.king(chess.BLACK)
        
        if white_king and black_king:
            king_distance = max(
                abs(chess.square_file(white_king) - chess.square_file(black_king)),
                abs(chess.square_rank(white_king) - chess.square_rank(black_king))
            )
            if king_distance < 2:
                return False
        
        return True
    except:
        return False

def apply_move(fen, move_uci):
    try:
        board = chess.Board(fen) # Load board from FEN
        move = chess.Move.from_uci(move_uci) # Convert UCI to Move object
        
        # Validasi apakah gerakan legal
        if move not in board.legal_moves:
            return board, False
        
        board.push(move)
        
        # Promosi bidak jika mencapai baris terakhir
        if board.piece_at(move.to_square) and board.piece_at(move.to_square).piece_type == chess.PAWN:
            if chess.square_rank(move.to_square) == 7:
                board.set_piece_at(move.to_square, chess.Piece(chess.QUEEN, chess.WHITE))
        
        return board, True
        
    except Exception as e:
        print(f"Apply move error: {e}")
        return chess.Board(fen), False

def randomize_board():
    while True:
        try:
            # Inisialisasi papan catur
            board = chess.Board()
            board.clear_board()
            
            # Memilih 3 square acak
            available_squares = list(range(64))
            selected_squares = random.sample(available_squares, 3)
            
            # Menempatkan komponen catur
            white_king_square = selected_squares[0]
            white_pawn_square = selected_squares[1] 
            black_king_square = selected_squares[2]
            
            # Validasi posisi bidak
            pawn_rank = chess.square_rank(white_pawn_square)
            if pawn_rank == 0 or pawn_rank == 7:
                continue
            
            board.set_piece_at(white_king_square, chess.Piece(chess.KING, chess.WHITE))
            board.set_piece_at(white_pawn_square, chess.Piece(chess.PAWN, chess.WHITE))
            board.set_piece_at(black_king_square, chess.Piece(chess.KING, chess.BLACK))
            
            # Black (Gukesh) to move
            board.turn = chess.BLACK
            
            if validate_board(board) and not board.is_check():
                return board
        except:
            continue

def check_mate_in_moves(board, max_depth=3):
    try:
        if board.is_checkmate():
            return {
                "mate_in": 0,
                "for_side": "white" if board.turn == chess.BLACK else "black",
                "status": "Checkmate"
            }
        
        if board.is_stalemate():
            return {
                "mate_in": None,
                "for_side": None,
                "status": "Stalemate"
            }
        
        return {
            "mate_in": None,
            "for_side": None,
            "status": "Game continues"
        }
    except:
        return {
            "mate_in": None,
            "for_side": None,
            "status": "Unknown"
        }