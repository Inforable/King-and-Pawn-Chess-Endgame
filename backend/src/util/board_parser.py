import chess

def parse_board(file):
    try:
        content = file.read().decode('utf-8').strip()
        lines = content.splitlines()
        lines = [line.strip() for line in lines if line.strip()]

        if len(lines) != 3:
            raise ValueError(f"File harus berisi 3 baris posisi, ditemukan {len(lines)} baris")
        
        positions = []
        for i, line in enumerate(lines):
            position = line.strip().lower()
            
            if len(position) != 2:
                raise ValueError(f"Baris {i+1}: Format posisi tidak valid '{position}', harus 2 karakter (contoh: d4)")
            
            file_char = position[0]
            rank_char = position[1]

            if file_char not in 'abcdefgh':
                raise ValueError(f"Baris {i+1}: File '{file_char}' tidak valid, harus a-h")
            
            if rank_char not in '12345678':
                raise ValueError(f"Baris {i+1}: Rank '{rank_char}' tidak valid, harus 1-8")

            positions.append(position)
        
        try:
            wk_square = chess.parse_square(positions[0])
            wp_square = chess.parse_square(positions[1])
            bk_square = chess.parse_square(positions[2])
        except Exception as e:
            raise ValueError(f"Error parsing squares: {str(e)}")
        
        if len(set(positions)) != 3:
            raise ValueError("Posisi pieces tidak boleh sama")

        pawn_rank = chess.square_rank(wp_square)
        if pawn_rank == 0:
            raise ValueError("White pawn tidak boleh di rank 1")
        if pawn_rank == 7:
            raise ValueError("White pawn tidak boleh di rank 8")
        
        board = chess.Board()
        board.clear_board()

        board.set_piece_at(wk_square, chess.Piece(chess.KING, chess.WHITE))
        board.set_piece_at(wp_square, chess.Piece(chess.PAWN, chess.WHITE))
        board.set_piece_at(bk_square, chess.Piece(chess.KING, chess.BLACK))

        board.turn = chess.BLACK
        board.fullmove_number = 1
        board.halfmove_clock = 0

        return board

    except Exception as e:
        raise ValueError(f"Error parsing file: {str(e)}")

def board_to_positions(board):
    positions = {}
    white_pawn_count = 0
    white_queen_count = 0
    white_rook_count = 0
    white_bishop_count = 0
    white_knight_count = 0
    
    for square, piece in board.piece_map().items():
        square_name = chess.square_name(square)

        if piece.piece_type == chess.KING and piece.color == chess.WHITE:
            positions["white_king"] = square_name
        elif piece.piece_type == chess.KING and piece.color == chess.BLACK:
            positions["black_king"] = square_name
        elif piece.piece_type == chess.PAWN and piece.color == chess.WHITE:
            white_pawn_count += 1
            if white_pawn_count == 1:
                positions["white_pawn"] = square_name
            else:
                positions[f"white_pawn_{white_pawn_count}"] = square_name
        elif piece.piece_type == chess.QUEEN and piece.color == chess.WHITE:
            white_queen_count += 1
            if white_queen_count == 1:
                positions["white_queen"] = square_name
            else:
                positions[f"white_queen_{white_queen_count}"] = square_name
        elif piece.piece_type == chess.ROOK and piece.color == chess.WHITE:
            white_rook_count += 1
            if white_rook_count == 1:
                positions["white_rook"] = square_name
            else:
                positions[f"white_rook_{white_rook_count}"] = square_name
        elif piece.piece_type == chess.BISHOP and piece.color == chess.WHITE:
            white_bishop_count += 1
            if white_bishop_count == 1:
                positions["white_bishop"] = square_name
            else:
                positions[f"white_bishop_{white_bishop_count}"] = square_name
        elif piece.piece_type == chess.KNIGHT and piece.color == chess.WHITE:
            white_knight_count += 1
            if white_knight_count == 1:
                positions["white_knight"] = square_name
            else:
                positions[f"white_knight_{white_knight_count}"] = square_name

    return positions