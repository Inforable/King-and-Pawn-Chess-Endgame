import chess

def parse_board(file):
    try:
        # Membaca file
        content = file.read().decode('utf-8').strip()
        lines = content.splitlines()

        lines = [line.strip() for line in lines if line.strip()]

        # Validasi jumlah baris harus tiga
        if len(lines) != 3:
            raise ValueError(f"File harus berisi 3 baris posisi, ditemukan {len(lines)} baris")
        
        positions = []
        for i, line in enumerate(lines):
            position = line.strip().lower() # Input dalam huruf kecil
            
            # Validasi format posisi
            if len(position) != 2:
                raise ValueError(f"Baris {i+1}: Format posisi tidak valid '{position}', harus 2 karakter (contoh: d4)")
            
            file_char = position[0] # file (kolom)
            rank_char = position[1] # rank (baris)

            # Validasi file dan rank
            if file_char not in 'abcdefgh':
                raise ValueError(f"Baris {i+1}: File '{file_char}' tidak valid, harus a-h")
            
            if rank_char not in '12345678':
                raise ValueError(f"Baris {i+1}: Rank '{rank_char}' tidak valid, harus 1-8")

            positions.append(position)
        
        try:
            # Dikonversi posisi ke square
            wk_square = chess.parse_square(positions[0])  # white king
            wp_square = chess.parse_square(positions[1])  # white pawn
            bk_square = chess.parse_square(positions[2])  # black king
        except Exception as e:
            raise ValueError(f"Error parsing squares: {str(e)}")
        
        if len(set(positions)) != 3:
            raise ValueError("Posisi pieces tidak boleh sama")

        # Validasi posisi pawn
        pawn_rank = chess.square_rank(wp_square)
        if pawn_rank == 0:
            raise ValueError("White pawn tidak boleh di rank 1")
        if pawn_rank == 7:
            raise ValueError("White pawn tidak boleh di rank 8")
        
        # Membuat board
        board = chess.Board()
        board.clear_board()

        board.set_piece_at(wk_square, chess.Piece(chess.KING, chess.WHITE))
        board.set_piece_at(wp_square, chess.Piece(chess.PAWN, chess.WHITE))
        board.set_piece_at(bk_square, chess.Piece(chess.KING, chess.BLACK))

        # Black (Gukesh) to move
        board.turn = chess.BLACK

        return board

    except Exception as e:
        raise ValueError(f"Error parsing file: {str(e)}")

def board_to_positions(board):
    # Konversi posisi dari board ke dictionary agar mudah diakses
    positions = {"white_king": None, "white_pawn": None, "black_king": None}

    for square, piece in board.piece_map().items():
        square_name = chess.square_name(square)

        if piece.piece_type == chess.KING and piece.color == chess.WHITE:
            positions["white_king"] = square_name
        elif piece.piece_type == chess.PAWN and piece.color == chess.WHITE:
            positions["white_pawn"] = square_name
        elif piece.piece_type == chess.QUEEN and piece.color == chess.WHITE:
            positions["white_queen"] = square_name
        elif piece.piece_type == chess.KING and piece.color == chess.BLACK:
            positions["black_king"] = square_name

    return positions