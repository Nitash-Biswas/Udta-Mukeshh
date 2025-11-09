import React, { useState, useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import Bird from "./components/Bird";
import Block from "./components/Block";
import GameOverModal from "./components/GameOverModal";
import GameWinModal from "./components/GameWinModal";

// --- Game Constants ---
const GAME_WIDTH = 500;
const GAME_HEIGHT = 600;
const BIRD_X_START = 100;
const BIRD_RADIUS = 25;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const PIPE_SPEED = 3.5;
const GRAVITY = 0.9;
const JUMP_VELOCITY = -12;
const SPAWN_RATE_MS = 2000;

// --- Asset Paths ---
const BIRD_IMAGE = "src/assets/Shaurya.png";
const PIPE_IMAGE = "src/assets/Block.jpg";
const BG_IMAGE = "src/assets/Nsut.webp";
const JUMP_SOUND = "src/assets/Jump.mp3";
const LOSE_SOUND = "src/assets/Lose.mp3";
const WIN_SOUND = "src/assets/Win.mp3";
const BG_MUSIC = "src/assets/Bg.mp3";
const WIN_IMAGE = "src/assets/Win.jpg";

const Game = ({
  onGameOver,
  onScore,
  isGameOver,
  onRestart,
  onMenu,
  score,
  highScore,
  isInfinite,
  winScore,
}) => {
  const [birdPos, setBirdPos] = useState({ x: BIRD_X_START, y: GAME_HEIGHT / 2 });
  const [blocks, setBlocks] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const engineRef = useRef(null);
  const birdBodyRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastPipeSpawnTime = useRef(0);

  // --- Audio Refs ---
  const jumpAudioRef = useRef(null);
  const dieAudioRef = useRef(null);
  const winAudioRef = useRef(null);
  const bgMusicRef = useRef(null);

  // Refs to avoid stale closures
  const isGameOverRef = useRef(isGameOver);
  const onGameOverRef = useRef(onGameOver);
  const onScoreRef = useRef(onScore);
  const gameWonRef = useRef(gameWon);
  const isInfiniteRef = useRef(isInfinite);
  const winScoreRef = useRef(winScore);

  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);
  useEffect(() => { onScoreRef.current = onScore; }, [onScore]);
  useEffect(() => { gameWonRef.current = gameWon; }, [gameWon]);
  useEffect(() => { isInfiniteRef.current = isInfinite; }, [isInfinite]);
  useEffect(() => { winScoreRef.current = winScore; }, [winScore]);

  // --- Init Physics & Audio ---
  useEffect(() => {
    jumpAudioRef.current = new Audio(JUMP_SOUND);
    dieAudioRef.current = new Audio(LOSE_SOUND);
    winAudioRef.current = new Audio(WIN_SOUND);
    bgMusicRef.current = new Audio(BG_MUSIC);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.05; // Optional: lower volume for background music

    // Start background music
    bgMusicRef.current.play().catch(e => console.warn("BG music failed to play:", e));

    const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;
    engine.world.gravity.y = GRAVITY;

    const bird = Bodies.circle(BIRD_X_START, GAME_HEIGHT / 2, BIRD_RADIUS, {
      restitution: 0.5,
      frictionAir: 0.05,
      label: "bird",
    });
    birdBodyRef.current = bird;

    const floor = Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + 50, GAME_WIDTH, 100, { isStatic: true, label: "boundary" });
    const ceiling = Bodies.rectangle(GAME_WIDTH / 2, -50, GAME_WIDTH, 100, { isStatic: true, label: "boundary" });

    World.add(engine.world, [bird, floor, ceiling]);

    Events.on(engine, "collisionStart", (event) => {
      if (gameWonRef.current) return;
      const pairs = event.pairs;
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.bodyA.label === "bird" || pair.bodyB.label === "bird") {
           if (!isGameOverRef.current) {
              // Stop BG music on loss
              if (bgMusicRef.current) {
                  bgMusicRef.current.pause();
                  bgMusicRef.current.currentTime = 0;
              }
              if (dieAudioRef.current) {
                  dieAudioRef.current.currentTime = 0;
                  dieAudioRef.current.play().catch(e => console.warn("Die sound failed:", e));
              }
           }
          if (onGameOverRef.current) onGameOverRef.current();
        }
      }
    });

    lastPipeSpawnTime.current = performance.now();
    loop();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      if (jumpAudioRef.current) jumpAudioRef.current.pause();
      if (dieAudioRef.current) dieAudioRef.current.pause();
      if (winAudioRef.current) winAudioRef.current.pause();
      if (bgMusicRef.current) bgMusicRef.current.pause();
    };
  }, []);

  // --- Input Handling ---
  useEffect(() => {
    const handleInput = (e) => {
      if (!isGameOverRef.current && !gameWonRef.current && birdBodyRef.current) {
        if (e.type === "touchstart") e.preventDefault();
        if (jumpAudioRef.current) {
            jumpAudioRef.current.currentTime = 0;
            jumpAudioRef.current.play().catch(e => console.warn("Jump sound failed:", e));
        }
        Matter.Body.setVelocity(birdBodyRef.current, { x: 0, y: JUMP_VELOCITY });
      }
    };
    window.addEventListener("keydown", (e) => e.code === "Space" && handleInput(e));
    window.addEventListener("mousedown", handleInput);
    window.addEventListener("touchstart", handleInput, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleInput);
      window.removeEventListener("mousedown", handleInput);
      window.removeEventListener("touchstart", handleInput);
    };
  }, []);

  const spawnPipe = (world) => {
    const pipeX = GAME_WIDTH + PIPE_WIDTH / 2;
    const minHeight = 50;
    const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    const bottomHeight = GAME_HEIGHT - PIPE_GAP - topHeight;

    const topPipe = Matter.Bodies.rectangle(pipeX, topHeight / 2, PIPE_WIDTH, topHeight, {
        isStatic: true, label: "pipe", passed: false, isScoring: true,
    });
    const bottomPipe = Matter.Bodies.rectangle(pipeX, GAME_HEIGHT - bottomHeight / 2, PIPE_WIDTH, bottomHeight, {
        isStatic: true, label: "pipe",
    });

    Matter.World.add(world, [topPipe, bottomPipe]);
  };

  // --- Game Loop ---
  const loop = useCallback(() => {
    if (!engineRef.current || isGameOverRef.current || gameWonRef.current) return;

    const now = performance.now();
    Matter.Engine.update(engineRef.current, 1000 / 60);
    const world = engineRef.current.world;
    const allBodies = Matter.Composite.allBodies(world);

    if (now - lastPipeSpawnTime.current > SPAWN_RATE_MS) {
      spawnPipe(world);
      lastPipeSpawnTime.current = now;
    }

    allBodies.forEach((body) => {
      if (body.label === "pipe") {
        Matter.Body.translate(body, { x: -PIPE_SPEED, y: 0 });
        if (body.isScoring && !body.passed && body.position.x < BIRD_X_START) {
          body.passed = true;
          onScoreRef.current((prevScore) => {
              const newScore = prevScore + 1;
              if (!isInfiniteRef.current && newScore >= winScoreRef.current) {
                  setGameWon(true);
                  // Stop BG music on win
                  if (bgMusicRef.current) {
                      bgMusicRef.current.pause();
                      bgMusicRef.current.currentTime = 0;
                  }
                  if (winAudioRef.current) {
                      winAudioRef.current.currentTime = 0;
                      winAudioRef.current.play().catch(e => console.warn("Win sound failed", e));
                  }
              }
              return newScore;
          });
        }
        if (body.position.x < -PIPE_WIDTH) {
          Matter.World.remove(world, body);
        }
      }
    });

    if (birdBodyRef.current) {
      setBirdPos({ ...birdBodyRef.current.position });
    }

    setBlocks(
      allBodies
        .filter((body) => body.label === "pipe")
        .map((body) => ({
          id: body.id,
          position: body.position,
          width: body.bounds.max.x - body.bounds.min.x,
          height: body.bounds.max.y - body.bounds.min.y,
        }))
    );

    animationFrameRef.current = requestAnimationFrame(loop);
  }, []);

  return (
    <div
      className="relative overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-4 border-black rounded-lg"
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: "cover",
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#322',
        backgroundBlendMode: 'screen',
        backgroundPositionX: 'center',
      }}
    >
      <Bird position={birdPos} radius={BIRD_RADIUS} image={BIRD_IMAGE} />
      {blocks.map((block) => (
        <Block
          key={block.id}
          position={block.position}
          width={block.width}
          height={block.height}
          image={PIPE_IMAGE}
        />
      ))}
      <div className="absolute bottom-0 w-full h-4 bg-green-700 border-t-4 border-green-900 z-20"></div>

      {isGameOver && (
        <GameOverModal
          score={score}
          highScore={highScore}
          onMenu={onMenu}
          onRestart={onRestart}
        />
      )}

      {gameWon && (
        <GameWinModal
          onMenu={onMenu}
          onRestart={onRestart}
          image = {WIN_IMAGE}
        />
      )}
    </div>
  );
};

export default Game;