import chess
import time
import random
import math
from .chess_rules import mate_search
from .evaluation import evaluate_board_for_mcts

class MCTSNode:
    def __init__(self, board, parent=None, move=None):
        self.board = board.copy()
        self.parent = parent
        self.move = move
        self.children = []
        self.visits = 0
        self.wins = 0.0
        self.untried_moves = list(board.legal_moves)
        
    def is_terminal(self):
        return self.board.is_game_over()
    
    def is_fully_expanded(self):
        return len(self.untried_moves) == 0
    
    def select_child(self, c_param=1.414):
        # UCB1 formula: (w_i / n_i) + c * sqrt(2 * ln(N) / n_i) dgn w_i: jumlah kemenangan child, n_i: jumlah kunjungan child, N: jumlah kunjungan parent
        choices_weights = [
            (child.wins / child.visits) + c_param * math.sqrt((2 * math.log(self.visits) / child.visits))
            for child in self.children
        ]
        return self.children[choices_weights.index(max(choices_weights))]
    
    def expand(self):
        move = self.untried_moves.pop()
        new_board = self.board.copy()
        new_board.push(move)
        child = MCTSNode(new_board, parent=self, move=move)
        self.children.append(child)
        return child
    
    def simulate(self):
        current_board = self.board.copy()
        
        # Simulasi random sampai game selesai atau maksimal 50 move
        simulation_depth = 0
        while not current_board.is_game_over() and simulation_depth < 50:
            legal_moves = list(current_board.legal_moves)
            if not legal_moves:
                break
            
            # Random move dengan sedikit bias ke move yang baik
            if random.random() < 0.3 and len(legal_moves) > 1:
                # 30% peluang pilih move terbaik dari 3 random move
                sample_moves = random.sample(legal_moves, min(3, len(legal_moves)))
                best_move = sample_moves[0]
                best_eval = float('-inf')
                
                for move in sample_moves:
                    current_board.push(move)
                    eval_score = evaluate_board_for_mcts(current_board)
                    if eval_score > best_eval:
                        best_eval = eval_score
                        best_move = move
                    current_board.pop()
                
                current_board.push(best_move)
            else:
                # 70% peluang random move
                current_board.push(random.choice(legal_moves))
            
            simulation_depth += 1
        
        # Evaluasi posisi akhir
        return self.evaluate_position(current_board)
    
    def evaluate_position(self, board):
        if board.is_checkmate():
            return 1 if board.turn == chess.BLACK else -1
        elif board.is_stalemate() or board.is_insufficient_material():
            return 0
        else:
            return evaluate_board_for_mcts(board)
    
    def backpropagate(self, result):
        self.visits += 1
        self.wins += result
        if self.parent:
            self.parent.backpropagate(-result)

def monte_carlo_tree_search(fen, max_iterations=5000, time_limit=5.0):
    try:
        board = chess.Board(fen)

        # Cek posisi mate
        mate_result = mate_search(board)
        if mate_result.get('mate_in') is not None:
            return {
                'mate': True,
                'best_move': None,
                'evaluation': 0,
                'mate_info': mate_result
            }
        
        board = chess.Board(fen)
        
        if board.is_game_over():
            result = {'mate': True, 'best_move': None, 'evaluation': 0}
            if board.is_checkmate():
                result['evaluation'] = -1000 if board.turn == chess.WHITE else 1000
            return result
        
        start_time = time.time()
        root = MCTSNode(board)
        
        iteration = 0
        while iteration < max_iterations and (time.time() - start_time) < time_limit:
            # Selection
            node = root
            while not node.is_terminal() and node.is_fully_expanded():
                node = node.select_child()
            
            # Expansion
            if not node.is_terminal() and not node.is_fully_expanded():
                node = node.expand()
            
            # Simulation
            result = node.simulate()
            
            # Backpropagation
            node.backpropagate(result)
            
            iteration += 1
        
        # Pilih move terbaik berdasarkan visit count
        if not root.children:
            return {'mate': False, 'best_move': None, 'evaluation': 0}
        
        best_child = max(root.children, key=lambda child: child.visits)
        
        # Hitung evaluation dari best child
        evaluation = best_child.wins / best_child.visits if best_child.visits > 0 else 0
        evaluation *= 1000  # Scale untuk konsistensi dengan algoritma lain
        
        end_time = time.time()
        time_taken = end_time - start_time
        
        return {
            'mate': False,
            'best_move': best_child.move.uci() if best_child.move else None,
            'evaluation': evaluation,
            'iterations': iteration,
            'time': time_taken
        }
    
    except Exception as e:
        return {'error': str(e), 'mate': False, 'best_move': None}