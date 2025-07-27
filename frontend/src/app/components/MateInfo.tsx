import React from 'react';

export default function MateInfo() {
  return (
    <div className="mt-5 bg-green-100 border border-green-300 rounded-md px-6 py-4 w-full max-w-[360px] text-center select-none">
        <p className="text-green-700 font-semibold text-lg"> Mate in 7 moves </p>
        <p className="text-sm text-green-900/75 mt-1"> Move: 0 | Paused </p>
    </div>
  );
}