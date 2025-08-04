# King and Pawn Chess Endgame Solver

## Deskripsi Aplikasi

Aplikasi ini adalah simulasi endgame catur antara **AI Magnus (Putih)** dan **Gukesh (Hitam)** pada skenario King + Pawn vs King. AI Magnus menggunakan algoritma pencarian langkah terbaik, sedangkan Gukesh dimainkan manual oleh user. Aplikasi terdiri dari backend (Flask Python) dan frontend (Next.js/React) yang saling terhubung melalui REST API.

## Penjelasan Algoritma

### 1. Minimax Alpha-Beta Pruning (MABP)

**Konsep:**  
Minimax adalah algoritma pencarian pohon yang digunakan untuk permainan dua pemain (zero-sum). Setiap node pada pohon mewakili posisi papan, dan algoritma akan mengeksplorasi semua kemungkinan langkah hingga kedalaman tertentu.  
Alpha-beta pruning adalah optimasi yang memangkas cabang pohon yang tidak mungkin mempengaruhi hasil akhir, sehingga pencarian lebih efisien.

**Implementasi pada kode:**  
- Fungsi utama: `minimax_alpha_beta_pruning` (lihat pada `backend/src/core/mabp.py`)
- Fungsi rekursif: `minimax_search`
- Fungsi ini akan:
  1. Mengecek apakah posisi sudah game over (checkmate, stalemate, insufficient material).
  2. Jika belum, menjalankan pencarian minimax hingga kedalaman tertentu (`depth`).
  3. Pada setiap node, memilih langkah terbaik untuk maximizing player (AI Magnus) dan minimizing player (Gukesh).
  4. Menggunakan alpha dan beta untuk memangkas cabang yang tidak perlu dieksplorasi.
  5. Mengembalikan langkah terbaik, evaluasi posisi, dan statistik pencarian.

### 2. Monte Carlo Tree Search (MCTS)

**Konsep:**  
MCTS adalah algoritma pencarian berbasis simulasi. Algoritma ini membangun pohon pencarian secara dinamis dengan melakukan simulasi random (playout) dari posisi saat ini, lalu memperbarui statistik kemenangan pada setiap node.

**Empat tahap utama:**
1. **Selection:** Memilih node dari root ke leaf menggunakan UCB1 (Upper Confidence Bound) untuk menyeimbangkan eksplorasi dan eksploitasi.
2. **Expansion:** Jika node belum terminal dan masih ada langkah yang belum dicoba, tambahkan child node baru.
3. **Simulation:** Dari node baru, lakukan simulasi random hingga game selesai atau batas langkah tercapai.
4. **Backpropagation:** Update statistik win/visit pada node dan semua parent-nya berdasarkan hasil simulasi.

**Implementasi pada kode:**  
- Kelas utama: `MCTSNode` (lihat pada `backend/src/core/mcts.py`)
- Fungsi utama: `monte_carlo_tree_search`
- Setiap node menyimpan papan, parent, move, children, visits, wins, dan langkah yang belum dicoba.
- Fungsi `select_child` menggunakan rumus UCB1:
  ```python
  (child.wins / child.visits) + c_param * math.sqrt((2 * math.log(self.visits) / child.visits))
  ```
- Fungsi `simulate` menjalankan random playout, kadang memilih langkah yang lebih baik berdasarkan evaluasi sederhana.
- Setelah sejumlah iterasi atau waktu habis, langkah terbaik dipilih berdasarkan jumlah kunjungan (visits) terbanyak.

### 3. Iterative Deepening Search

**Konsep:**  
Iterative Deepening adalah teknik pencarian yang menjalankan pencarian minimax secara bertingkat, mulai dari depth 1 hingga depth maksimum atau hingga waktu habis. Hasil terbaik pada kedalaman terakhir yang selesai akan digunakan.

**Keunggulan:**  
- Jika waktu habis, tetap ada solusi terbaik dari kedalaman sebelumnya.
- Dapat digabung dengan alpha-beta pruning untuk efisiensi.

**Implementasi pada kode:**  
- Fungsi utama: `iterative_deepening_search` (lihat pada `backend/src/core/iterative_deepening.py`)
- Pada setiap iterasi depth:
  1. Jalankan minimax dengan timeout.
  2. Jika waktu habis, keluar dari loop.
  3. Simpan langkah terbaik dan evaluasi dari depth terdalam yang selesai.

## Fitur yang Diimplementasikan

- **Upload Board:** Upload file .txt berisi posisi King dan Pawn.
- **Randomize Board:** Generate posisi acak yang valid.
- **3 Algoritma AI:** Pilihan algoritma antara Minimax Alpha-Beta Pruning (MABP), Monte Carlo Tree Search (MCTS), atau Iterative Deepening Search untuk AI Magnus.
- **Pawn Promotion:** Dapat memilih promosi (Queen, Rook, Bishop, Knight) saat pawn mencapai rank 8.
- **Manual Move:** Gukesh (Hitam) dimainkan manual dengan klik pada papan.
- **AI Move:** Magnus (Putih) otomatis menggunakan algoritma terpilih.
- **Legal Move Highlight:** Highlight langkah legal pada papan.
- **Game History/Playback:** Riwayat langkah yang bisa diputar ulang.
- **Game Over Detection:** Deteksi checkmate, stalemate, atau draw.
- **Reset Game:** Reset papan dan riwayat.
- **Analysis Info:** Tampilkan evaluasi, waktu komputasi, dan nodes explored.

## Cara Menjalankan

### 1. Backend (Python Flask)
```bash
cd backend
python -m venv venv
venv/Scripts/activate
pip install -r requirements.txt
python src/main.py
```
Backend berjalan di `http://localhost:5000`

### 2. Frontend (Next.js/React)
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di `http://localhost:3000`

### 3. Upload Board
Buat file `.txt` dengan format:
```
d4
e5
d6
```
Baris 1: White King, Baris 2: White Pawn, Baris 3: Black King

### 4. Jalankan Game
- Upload board atau randomize posisi
- Pilih algoritma AI
- Gukesh jalan dulu (klik bidak hitam)
- Klik "AI Magnus Move" untuk langkah AI
- Ulangi hingga game selesai atau reset

**Author: Hasri Fayadh Muqaffa**