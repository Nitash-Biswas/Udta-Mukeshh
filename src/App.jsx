import React, { useState, useEffect } from 'react';
import Game from './GameLoop';
import './App.css';

// --- NEW: Import assets here for preloading ---
import birdImageUrl from "./assets/Shaurya.png";
import pipeImageUrl from "./assets/Block.jpg";
import bgImageUrl from "./assets/Nsut.webp";
import jumpSoundUrl from "./assets/Jump.mp3";
import loseSoundUrl from "./assets/Lose.mp3";
import winSoundUrl from "./assets/Win.mp3";
import bgMusicUrl from "./assets/Bg.mp3";
import winImageUrl from "./assets/Win.jpg";

// Shared constants needed for scaling
const GAME_WIDTH = 500;
const GAME_HEIGHT = 600;
const LOCAL_STORAGE_KEY = 'flappySphereHighScore';

// --- NEW: Helper function to preload assets ---
const preloadAssets = () => {
  const images = [birdImageUrl, pipeImageUrl, bgImageUrl, winImageUrl];
  const audio = [jumpSoundUrl, loseSoundUrl, winSoundUrl, bgMusicUrl];

  const imagePromises = images.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    });
  });

  const audioPromises = audio.map(src => {
    return new Promise((resolve, reject) => {
      const aud = new Audio();
      aud.src = src;
      aud.oncanplaythrough = resolve; 
      aud.onerror = reject;
      aud.load();
    });
  });

  return Promise.all([...imagePromises, ...audioPromises]);
};


function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [scale, setScale] = useState(1);
  const [gameId, setGameId] = useState(0);
  const [isInfinite, setIsInfinite] = useState(false);
  const [winScore, setWinScore] = useState(20);

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, highScore.toString());
  }, [highScore]);

  useEffect(() => {
    const handleResize = () => {
      const s = Math.min(
        window.innerWidth / GAME_WIDTH,
        window.innerHeight / GAME_HEIGHT
      ) * 0.95;
      setScale(s);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isLoading) {
      preloadAssets()
        .then(() => {
          setGameStarted(true);
          setIsLoading(false);
        })
        .catch(err => {

          console.error("Failed to preload assets:", err);
          alert("Failed to load game assets. Please refresh the page.");
          setIsLoading(false);
        });
    }
  }, [isLoading]);

  const handleStart = () => {

    setIsLoading(true);
    setGameOver(false);
    setScore(0);
    setGameId((prev) => prev + 1);
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (score > highScore) setHighScore(score);
  };

  const handleMenu = () => {
    setGameStarted(false);
    setGameOver(false);
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[#333] overflow-hidden font-sans">
      <div
        style={{
          transform: `scale(${scale})`,
          width: `${GAME_WIDTH}px`,
          height: `${GAME_HEIGHT}px`,
          flexShrink: 0,
          transition: 'transform 0.2s ease-out',
        }}
      >

        {!gameStarted && !isLoading && (
          // --- Main Menu ---
          <div className="flex flex-col items-center justify-center gap-6 w-full h-full bg-[#70c5ce] border-4 border-black rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.3)] overflow-hidden relative p-4">
            <h1 className="text-[4.5rem] font-black text-white text-center leading-none m-0">
              Udta Mukeshhh
            </h1>

            {/* --- Game Options Container --- */}
            <div className="flex flex-col gap-4 items-center w-full max-w-xs">
                {/* Infinite Toggle */}
                <div className="flex items-center justify-between w-full bg-white/30 px-4 py-2 rounded-full border-2 border-black/20">
                  <span className="font-bold text-[#333]">Infinite Arcade</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isInfinite}
                      onChange={(e) => setIsInfinite(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#f0e456]"></div>
                  </label>
                </div>

                {/* Win Score Input */}
                {!isInfinite && (
                    <div className="flex items-center justify-between w-full bg-white/30 px-4 py-2 rounded-full border-2 border-black/20 animate-fade-in">
                        <span className="font-bold text-[#333]">Target Score:</span>
                        <input
                            type="number"
                            min="1"
                            max="999"
                            value={winScore}
                            onChange={(e) => setWinScore(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 text-center font-bold text-lg border-2 border-black/30 rounded-md p-1"
                        />
                    </div>
                )}
            </div>

            <button
              className="mt-4 px-[40px] py-[15px] text-[2rem] font-bold text-[#333] bg-[#f0e456] border-[3px] border-black rounded-xl cursor-pointer shadow-[0_6px_0_#a9a23d] transition-all duration-100 ease-out hover:bg-[#f7ef8a] active:translate-y-[4px] active:shadow-[0_2px_0_#a9a23d]"
              onClick={handleStart}
            >
              PLAY
            </button>
          </div>
        )}


        {isLoading && (
          <div className="flex flex-col items-center justify-center w-full h-full bg-[#333] border-4 border-black rounded-lg">
            <h2 className="text-3xl font-bold text-white animate-pulse">
              Loading...
            </h2>
          </div>
        )}


        {gameStarted && !isLoading && (
          <>
            {!gameOver && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-mono font-bold text-white bg-black/50 px-6 py-2 rounded-full border-2 border-black z-50">
                {score} {isInfinite ? '' : `/ ${winScore}`}
              </div>
            )}
            <Game
              key={gameId}
              isGameOver={gameOver}
              onGameOver={handleGameOver}
              onScore={setScore}
              onRestart={handleStart}
              onMenu={handleMenu}
              score={score}
              highScore={highScore}
              isInfinite={isInfinite}
              winScore={winScore}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;