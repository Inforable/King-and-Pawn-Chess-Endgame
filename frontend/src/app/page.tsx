import React from "react";
import ChessBoard from "./components/ChessBoard";
import GameSetup from "./components/GameSetup";
import GameControl from "./components/GameControl";
import MateInfo from "./components/MateInfo";

export default function Page() {
    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            <header className="mb-6 text-center max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tight mb-2"> AI Magnus vs Gukesh </h1>
                <p className="text-lg text-slate-600 mb-4"> Chess Endgame Solver </p>
                <div className="flex justify-center gap-4 text-sm text-slate-700">
                    <span className="px-3 py-1 border border-slate-300 rounded-full bg-white flex items-center gap-2 shadow-sm">
                        AI Magnus: <i className="fas fa-chess-king text-gray-300 text-xl"></i> <i className="fas fa-chess-pawn text-gray-300 text-xl"></i> <strong> (Winning) </strong>
                    </span>
                    <span className="px-3 py-1 border border-slate-300 rounded-full bg-white flex items-center gap-2 shadow-sm">
                        Gukesh: <i className="fas fa-chess-king text-black text-xl"></i> <strong> (Defending) </strong>
                    </span>
                </div>
            </header>
            <main className="flex flex-col lg:flex-row justify-center gap-8 max-w-7xl w-full">
                {/* Panel kiri untuk setup game */}
                <section className="bg-white rounded-xl shadow p-6 w-full max-w-md flex flex-col gap-6 border border-slate-100">
                    <GameSetup />
                </section>
                {/* Panel tengah untuk papan catur dan mate info */}
                <section aria-label="Chess Board" className="bg-white rounded-xl shadow p-7 flex flex-col items-center select-none border border-slate-100">
                    <ChessBoard />
                    <MateInfo />
                </section>
                {/* Panel kanan untuk kontrol game */}
                <section className="bg-white rounded-xl shadow p-6 w-full max-w-md flex flex-col gap-8 border border-slate-100">
                    <GameControl />
                </section>
            </main>
        </div>
    )
}