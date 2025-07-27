import React from 'react';

export default function GameSetup() {
    return (
        <div>
            <h2 className="font-semibold text-xl mb-6"> Game Setup </h2>
            <div className="mb-6">
                <div className="mb-4 font-medium"> Board State </div>
                <div className="flex flex-col gap-3">
                    <label htmlFor="upload-board" className="cursor-pointer rounded-md border border-slate-200 px-4 py-2 flex items-center gap-2 bg-white hover:bg-slate-50 shadow-sm font-medium">
                        <i className="fas fa-upload text-gray-500 text-lg"></i>
                        Upload Board (.txt)
                        <input type="file" id="upload-board" className="hidden" accept=".txt" />
                    </label>
                    <button className="rounded-md border border-slate-200 px-4 py-2 flex items-center gap-2 bg-white hover:bg-slate-50 shadow-sm font-medium">
                        <i className="fas fa-random text-gray-500 text-lg"></i>
                        Randomize Board
                    </button>
                </div>
            </div>
            <div>
                <div className="mb-2 font-medium"> AI Magnus Algorithm </div>
                <select defaultValue="" className="w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-slate-700">
                    <option value="" disabled> Select Algorithm </option>
                    <option value="minimax"> Minimax dengan alpha-beta pruning </option>
                </select>
            </div>
        </div>
    )
}