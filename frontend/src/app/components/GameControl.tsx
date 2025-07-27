import React from "react";

export default function GameControl() {
    return(
        <div>
            <h2 className="font-semibold text-xl mb-6"> Game Control </h2>
            <div className="mb-6">
                <div className="mb-2 font-medium"> Playback </div>
                <div className="flex gap-3 mb-4">
                    <button className="border border-slate-200 rounded-md px-3 py-2 bg-white hover:bg-slate-50 shadow-sm" title="Rewind">
                        <i className="fas fa-step-backward text-lg text-slate-500"></i>
                    </button>
                    <button className="border border-slate-200 rounded-md px-3 py-2 bg-white hover:bg-slate-50 shadow-sm" title="Play">
                        <i className="fas fa-play text-lg text-slate-500"></i>
                    </button>
                    <button className="border border-slate-200 rounded-md px-3 py-2 bg-white hover:bg-slate-50 shadow-sm" title="Forward">
                        <i className="fas fa-step-forward text-lg text-slate-500"></i>
                    </button>
                </div>
                <button className="w-full border border-slate-200 rounded-md px-3 py-2 bg-white hover:bg-slate-50 shadow-sm flex items-center justify-center gap-2 font-medium">
                    <i className="fas fa-undo text-lg text-slate-500"></i>
                    <span> Reset Game </span>
                </button>
            </div>
            <div>
                <div className="mb-2 font-medium"> Analysis </div>
                <dl className="text-sm text-slate-600 leading-relaxed space-y-1">
                    <div className="flex justify-between">
                        <dt className="font-medium"> Algorithm: </dt>
                        <dd> Not Selected </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="font-medium"> Depth: </dt>
                        <dd> 8 plies </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="font-medium"> Evaluation: </dt>
                        <dd> +M7 </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="font-medium"> Nodes: </dt>
                        <dd> 123456 </dd>
                    </div>
                </dl>
            </div>
        </div>
    )
}