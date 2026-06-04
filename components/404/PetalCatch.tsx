'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface Petal {
  x: number;
  y: number;
  speed: number;
  size: number;
  drift: number;
  phase: number;
}

const GAME_DURATION = 30;
const CANVAS_W = 280;
const CANVAS_H = 200;
const BASKET_W = 52;
const BASKET_H = 36;
const HIGH_SCORE_KEY = 'givita_petalcatch_highscore';

function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    /* noop */
  }
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function PetalCatch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const highScoreRef = useRef(loadHighScore());
  const flowerImgRef = useRef<HTMLImageElement | null>(null);
  const basketImgRef = useRef<HTMLImageElement | null>(null);
  const basketX = useRef(CANVAS_W / 2 - BASKET_W / 2);
  const petalsRef = useRef<Petal[]>([]);
  const scoreRef = useRef(0);
  const playingRef = useRef(false);
  const gameOverRef = useRef(false);
  const inputLockedRef = useRef(false);
  const animRef = useRef<number>(0);
  const keysRef = useRef(new Set<string>());
  const mouseX = useRef<number | null>(null);
  const themeRef = useRef<'light' | 'dark'>('light');
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    themeRef.current = (resolvedTheme as 'light' | 'dark') || 'light';
  }, [resolvedTheme]);

  useEffect(() => {
    const f = new Image();
    f.crossOrigin = 'anonymous';
    f.src = '/assets/flower 2.png';
    f.onload = () => { flowerImgRef.current = f; };
    const b = new Image();
    b.crossOrigin = 'anonymous';
    b.src = '/assets/basket.png';
    b.onload = () => { basketImgRef.current = b; };
  }, []);

  // Timer
  useEffect(() => {
    if (!playing || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          const finalScore = scoreRef.current;
          gameOverRef.current = true;
          playingRef.current = false;
          inputLockedRef.current = true;
          keysRef.current.clear();
          mouseX.current = null;
          setGameOver(true);
          setPlaying(false);
          if (finalScore > highScoreRef.current) {
            highScoreRef.current = finalScore;
            saveHighScore(finalScore);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, gameOver]);

  const spawnPetal = useCallback(() => {
    petalsRef.current.push({
      x: Math.random() * (CANVAS_W - 20) + 10,
      y: -20,
      speed: 0.6 + Math.random() * 0.8,
      size: 12 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawn = 0;

    function frame() {
      const now = performance.now();
      const isLight = themeRef.current === 'light';

      if (playingRef.current && now - lastSpawn > 700) {
        spawnPetal();
        if (Math.random() < 0.35) spawnPetal();
        lastSpawn = now;
      }

      const petals = petalsRef.current;
      const bx = basketX.current;
      const by = CANVAS_H - BASKET_H - 2;
      const fImg = flowerImgRef.current;
      const bImg = basketImgRef.current;

      // Move & collide
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.y += p.speed;
        p.x += Math.sin(p.y * 0.04 + p.phase) * p.drift;

        if (
          p.y + p.size > by + 4 &&
          p.y + p.size < by + BASKET_H &&
          p.x + p.size > bx + 4 &&
          p.x < bx + BASKET_W - 4
        ) {
          petals.splice(i, 1);
          scoreRef.current += 1;
          setScore(scoreRef.current);
          continue;
        }

        if (p.y > CANVAS_H + 30) {
          petals.splice(i, 1);
        }
      }

      // Glass background
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = isLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      roundRectPath(ctx, 0, 0, CANVAS_W, CANVAS_H, 8);
      ctx.fill();

      // Grid
      ctx.strokeStyle = isLight ? 'rgba(81,46,248,0.07)' : 'rgba(214,255,93,0.07)';
      ctx.lineWidth = 1;
      for (let x = 20; x < CANVAS_W; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }
      for (let y = 20; y < CANVAS_H; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }

      // Border
      ctx.strokeStyle = isLight ? 'rgba(81,46,248,0.12)' : 'rgba(214,255,93,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      roundRectPath(ctx, 0.5, 0.5, CANVAS_W - 1, CANVAS_H - 1, 8);
      ctx.stroke();

      // Petals
      if (isLight && fImg) ctx.filter = 'saturate(1.7) hue-rotate(-20deg) brightness(1.05)';
      else ctx.filter = 'none';

      for (const p of petals) {
        const s = p.size;
        ctx.save();
        ctx.translate(p.x + s / 2, p.y + s / 2);
        ctx.rotate(p.y * 0.03);
        if (fImg) {
          ctx.drawImage(fImg, -s / 2, -s / 2, s, s);
        } else {
          ctx.fillStyle = isLight ? '#512ef8' : '#d6ff5d';
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.filter = 'none';

      // Basket
      if (bImg) {
        ctx.drawImage(bImg, bx, by, BASKET_W, BASKET_H);
      } else {
        ctx.fillStyle = isLight ? '#512ef8' : '#d6ff5d';
        ctx.beginPath();
        roundRectPath(ctx, bx, by, BASKET_W, BASKET_H, 4);
        ctx.fill();
      }

      // HUD
      if (playingRef.current) {
        ctx.fillStyle = isLight ? 'rgba(81,46,248,0.8)' : 'rgba(214,255,93,0.8)';
        ctx.font = '600 11px Onest, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${scoreRef.current}`, 8, 6);
        ctx.textAlign = 'right';
        ctx.fillText(`${timeLeft}s`, CANVAS_W - 8, 6);
      }

      // Idle overlay
      if (!playingRef.current) {
        ctx.fillStyle = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        roundRectPath(ctx, CANVAS_W / 2 - 50, CANVAS_H / 2 - 30, 100, 60, 10);
        ctx.fill();

        ctx.fillStyle = isLight ? '#512ef8' : '#d6ff5d';
        ctx.font = '600 14px Onest, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gameOverRef.current ? 'Play again' : 'Start', CANVAS_W / 2, CANVAS_H / 2 + 2);

        ctx.fillStyle = isLight ? 'rgba(81,46,248,0.5)' : 'rgba(214,255,93,0.5)';
        ctx.font = '10px Onest, sans-serif';
        ctx.textBaseline = 'bottom';
        const best = highScoreRef.current;
        ctx.fillText(best > 0 ? `Best: ${best}` : '', CANVAS_W / 2, CANVAS_H / 2 - 32);
      }

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [spawnPetal]);

  // Input
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (inputLockedRef.current) return;
      keysRef.current.add(e.key);
    }
    function handleKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
    }
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      if (inputLockedRef.current) return;
      const bx = basketX.current;
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
        basketX.current = Math.max(0, bx - 3.5);
      }
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
        basketX.current = Math.min(CANVAS_W - BASKET_W, bx + 3.5);
      }
      if (mouseX.current !== null) {
        basketX.current = Math.max(0, Math.min(CANVAS_W - BASKET_W, mouseX.current - BASKET_W / 2));
      }
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (playingRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= CANVAS_W / 2 - 50 && x <= CANVAS_W / 2 + 50 &&
        y >= CANVAS_H / 2 - 30 && y <= CANVAS_H / 2 + 30) {
      petalsRef.current = [];
      basketX.current = CANVAS_W / 2 - BASKET_W / 2;
      scoreRef.current = 0;
      gameOverRef.current = false;
      inputLockedRef.current = false;
      setScore(0);
      setTimeLeft(GAME_DURATION);
      setGameOver(false);
      setPlaying(true);
      playingRef.current = true;
    }
  }, []);

  const handleCanvasMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!playingRef.current || inputLockedRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.current = e.clientX - rect.left;
  }, []);

  const handleCanvasLeave = useCallback(() => {
    mouseX.current = null;
  }, []);

  return (
    <div className="mx-auto">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ cursor: playing && !gameOver ? 'grab' : 'pointer' }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={handleCanvasLeave}
      />
    </div>
  );
}
