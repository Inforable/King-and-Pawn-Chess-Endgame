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
        # if board.piece_at(move.to_square) and board.piece_at(move.to_square).piece_type == chess.PAWN:
        #     if chess.square_rank(move.to_square) == 7:
        #         board.set_piece_at(move.to_square, chess.Piece(chess.QUEEN, chess.WHITE))
        
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

            board.fullmove_number = 1
            board.halfmove_clock = 0
            
            if validate_board(board) and not board.is_check():
                return board
        except:
            continue

def mate_search(board, max_depth=5):
    # Kondisi jika checkmate
    if board.is_checkmate():
        winner = "AI Magnus"
        return {
            "mate_in": 0,
            "for_side": "AI Magnus",
            "winner": winner,
            "status": f"Checkmate - {winner.title()} wins"
        }
    
    # Kondisi jika draw
    if board.is_stalemate():
        return {
            "mate_in": None,
            "for_side": None,
            "status": "Stalemate - Draw"
        }
    
    # Kondisi jika insufficient material
    if board.is_insufficient_material():
        return {
            "mate_in": None,
            "for_side": None,
            "status": "Insufficient Material - Draw"
        }
    
    for depth in range(1, max_depth + 1):
        if board.turn == chess.WHITE:
            mate_moves = search_forced_mate(board, depth, True)
            if mate_moves is not None:
                return {
                    "mate_in": mate_moves,
                    "for_side": "AI Magnus",
                    "winner": None,
                    "status": f"Mate in {mate_moves} moves for AI Magnus"
                }
    
    # Jika tidak terjadi apa"
    return {
        "mate_in": None,
        "for_side": None,
        "status": "Game Continues"
    }

# Fungsi untuk mencari forced mate menggunakan minimax
def search_forced_mate(board, max_depth, is_attacker_turn):
    def mate_minimax(board, depth, is_maximizing):

        # Base case jika checkmate ditemukan
        if board.is_checkmate():
            return depth
        
        # Base case jika checkmate gada
        if board.is_stalemate() or board.is_insufficient_material() or depth == 0:
            return None
        
        if is_maximizing:
            # Find moves yang mengarah ke mate
            for move in board.legal_moves:
                board.push(move)
                result = mate_minimax(board, depth - 1, False)
                board.pop()

                if result is not None:
                    return result
            
            return None
        else:
            # Cek semua moves apakah mengarah ke mate
            if not list(board.legal_moves):
                return None
            
            all_moves = True
            shortest_mate = float('inf')

            for move in board.legal_moves:
                board.push(move)
                result = mate_minimax(board, depth - 1, True)
                board.pop()

                if result is None:
                    all_moves = False
                    break
                shortest_mate = min(shortest_mate, result)
            
            if all_moves and shortest_mate != float('inf'):
                return shortest_mate
            
            return None
    
    result = mate_minimax(board, max_depth, is_attacker_turn)
    if result is not None:
        return max_depth - result # jumlah langkah
    return None