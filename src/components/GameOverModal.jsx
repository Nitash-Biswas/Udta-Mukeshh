import React from 'react';

const GameOverModal = ({ score, highScore, onMenu, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f0e456] border-4 border-black rounded-xl p-6 flex flex-col items-center gap-4 shadow-[0_10px_0_rgba(0,0,0,0.2)] animate-bounce-in">
        <h2 className="text-4xl font-black text-white [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]">
          GAME OVER
        </h2>

        <div className="bg-white border-2 border-black rounded-lg p-4 w-full flex justify-around">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Score</p>
            <p className="text-3xl font-black text-slate-800">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Best</p>
            <p className="text-3xl font-black text-slate-800">{highScore}</p>
          </div>
        </div>

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onMenu}
            className="flex-1 py-3 font-bold text-white cursor-pointer bg-slate-500 hover:bg-slate-600 border-2 border-black rounded-lg shadow-[0_4px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
          >
            Menu
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-3 font-bold text-white cursor-pointer bg-green-500 hover:bg-green-600 border-2 border-black rounded-lg shadow-[0_4px_0_#15803d] active:translate-y-1 active:shadow-none transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;