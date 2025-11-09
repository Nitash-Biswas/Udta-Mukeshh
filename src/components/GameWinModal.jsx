import React from 'react';

const GameWinModal = ({ onMenu, onRestart, image }) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
      <div
        className="border-4 border-black rounded-xl p-6 flex flex-col items-center gap-4 shadow-[0_10px_0_rgba(0,0,0,0.2)] animate-bounce-in"
        style={{
            // Fixed dimensions
            width: '320px',
            minHeight: '300px',
            // Background styling
            backgroundColor: image ? 'transparent' : '#4ade80',
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      >
        <h2 className="text-4xl font-black text-white [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]">
          YOU WIN!
        </h2>


        <div className="flex gap-3 w-full mt-auto">
          <button
            onClick={onMenu}
            className="flex-1 py-3 font-bold text-white cursor-pointer bg-slate-500 hover:bg-slate-600 border-2 border-black rounded-lg shadow-[0_4px_0_#334155] active:translate-y-1 active:shadow-none transition-all"
          >
            Menu
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-3 font-bold text-slate-800 cursor-pointer bg-[#f0e456] hover:bg-[#eadd35] border-2 border-black rounded-lg shadow-[0_4px_0_#a9a23d] active:translate-y-1 active:shadow-none transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameWinModal;