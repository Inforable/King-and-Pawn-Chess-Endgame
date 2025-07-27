import React from "react";

const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rows = ["8", "7", "6", "5", "4", "3", "2", "1"];

const pieces: Record<string, { type: string; owner: string }> = {
    "d3": { type: "king", owner: "gukesh" },
    "d2": { type: "pawn", owner: "magnus" },
    "c1": { type: "king", owner: "magnus" }
};

export default function ChessBoard() {
    const getPieceIcon = (type: string, owner: string) => {
        if (type === "king" && owner === "magnus")
            return <i className="fas fa-chess-king text-gray-400 text-2xl"></i>;
        if (type === "king" && owner === "gukesh")
            return <i className="fas fa-chess-king text-black text-2xl"></i>;
        if (type === "pawn" && owner === "magnus")
            return <i className="fas fa-chess-pawn text-gray-400 text-2xl"></i>;
        if (type === "pawn" && owner === "gukesh")
            return <i className="fas fa-chess-pawn text-black text-2xl"></i>;
        return null;
    };

    return (
        <div className="flex flex-col items-center">
            {/* Angka di kiri board */}
            <div className="flex">
                <div className="flex flex-col justify-between mr-1" style={{ height: 360 }}>
                    {rows.map(rank => (
                        <span key={rank} className="h-9 flex items-center justify-center text-xs text-slate-500">{rank}</span>
                    ))}
                </div>
                {/* Board */}
                <div className="relative">
                    <div className="grid grid-cols-8 grid-rows-8 border border-slate-300 rounded-md overflow-hidden" style={{ width: 360, height: 360 }}>
                        {rows.map((rank, r) =>
                            cols.map((file, c) => {
                                const squareId = file + rank;
                                const isLight = (r + c) % 2 === 0;
                                const piece = pieces[squareId];
                                return (
                                    <div
                                        key={squareId}
                                        className={`aspect-square flex justify-center items-center text-2xl select-none ${isLight ? "bg-yellow-50" : "bg-amber-700"}`}
                                    >
                                        {piece ? getPieceIcon(piece.type, piece.owner) : ""}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {/* Alfabet di bawah board */}
                    <div className="flex justify-between mt-1 px-1" style={{ width: 360 }}>
                        {cols.map(file => (
                            <span key={file} className="w-9 text-xs text-slate-500 text-center">{file}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}