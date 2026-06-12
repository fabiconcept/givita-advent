'use client';

import { useEffect, useRef, type RefObject } from 'react';

const W = 480;

const T = {
  brand: '#512ef8', brandL: '#7a5cfa', brandBg: '#2a1f5a',
  lime: '#d6ff5d',
  dark: '#141414', dark2: '#1e1e1e', dark3: '#2a2a2a', dark4: '#333',
  textPrimary: '#f0f0f0', textMuted: '#555',
  success: '#22c55e', error: '#ef4444',
  pink: '#f472b6', pinkMid: '#db2777',
  peach: '#fb923c',
  purple: '#a78bfa',
  sky: '#7dd3fc',
  green: '#4ade80', greenDark: '#166534',
  lime2: '#bef264',
  amber: '#fbbf24', amberDark: '#d97706',
};

const GF = [
  (cx: CanvasRenderingContext2D, x: number, y: number, a: number) => {
    cx.globalAlpha = a;
    cx.fillStyle = '#0f2e18'; cx.fillRect(x + 3, y - 20, 2, 20);
    cx.fillRect(x + 5, y - 12, 5, 2);
    cx.fillStyle = '#4a1a3a'; cx.fillRect(x, y - 32, 8, 14);
    cx.fillRect(x + 1, y - 35, 6, 5);
    cx.globalAlpha = 1;
  },
  (cx: CanvasRenderingContext2D, x: number, y: number, a: number) => {
    cx.globalAlpha = a;
    cx.fillStyle = '#0f2e18'; cx.fillRect(x + 3, y - 18, 2, 18);
    cx.fillStyle = '#2a2a1a';
    for (let i = 0; i < 6; i++) { const ag = i * Math.PI / 3; cx.beginPath(); cx.ellipse(x + 4 + Math.cos(ag) * 6, y - 22 + Math.sin(ag) * 6, 4, 2, ag, 0, Math.PI * 2); cx.fill(); }
    cx.fillStyle = '#2e2a10'; cx.beginPath(); cx.arc(x + 4, y - 22, 4, 0, Math.PI * 2); cx.fill();
    cx.globalAlpha = 1;
  },
  (cx: CanvasRenderingContext2D, x: number, y: number, a: number) => {
    cx.globalAlpha = a;
    cx.fillStyle = '#0f2e18'; cx.fillRect(x + 3, y - 22, 2, 22);
    cx.fillStyle = '#1e1428';
    for (let i = 0; i < 5; i++) cx.fillRect(x + 1, y - 32 + i * 5, 6, 4);
    cx.globalAlpha = 1;
  },
];

function mkPetal(x: number, y: number) {
  return {
    x, y,
    vy: .45 + Math.random() * .55,
    vx: (Math.random() - .5) * .7,
    rot: Math.random() * Math.PI * 2,
    rs: (Math.random() - .5) * .05,
    s: 1.8 + Math.random() * 1.4,
    c: ['#2e1f2e', '#2a1a2a', '#301e28', '#221828'][Math.floor(Math.random() * 4)],
  };
}

interface FlowerRunnerProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  scRef: RefObject<HTMLSpanElement | null>;
  hiRef: RefObject<HTMLSpanElement | null>;
  fundsRef: RefObject<HTMLSpanElement | null>;
  progRef: RefObject<HTMLDivElement | null>;
}

export function FlowerRunnerMobile({ canvasRef, scRef, hiRef, fundsRef, progRef }: FlowerRunnerProps) {
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;

    let state: 'idle' | 'running' | 'dead' = 'idle';
    let fr = 0, spd = 3.0, sc = 0, hi = 0, sx = 0, oTimer = 0, funds = 0, slowTimer = 0, shielded = false, fastTimer = 0, scAcc = 0, fundsBonus = 0;
    const bee = { x: 68, y: 0, vy: 0, j: 0, dead: false, wp: 0 };
    let objs: any[] = [], parts: any[] = [], bgPetals: any[] = [], gFlowers: { x: number; t: number; ph: number }[] = [];
    let camShake = 0;
    let animId = 0;
    let displayScale = 1;
    let H = 580;
    let GY = H - 46;

    function resize() {
      const rect = cv.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      displayScale = rect.width / W;
      H = Math.round(rect.height / displayScale);
      GY = H - 46;
      cv.width = Math.round(rect.width * dpr);
      cv.height = Math.round(rect.height * dpr);
      cx.setTransform(dpr * displayScale, 0, 0, dpr * displayScale, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(cv.parentElement || cv);
    resize();

    function seedFlowers() {
      gFlowers = [];
      for (let i = 0; i < 9; i++) gFlowers.push({ x: i * 82 + 30, t: i % 3, ph: Math.random() * 200 });
    }
    seedFlowers();
    for (let i = 0; i < 8; i++) bgPetals.push(mkPetal(Math.random() * W, Math.random() * H * 0.85));

    function gY() { return GY - 38; }

    function resetBee() { bee.y = gY(); bee.vy = 0; bee.j = 0; bee.dead = false; bee.wp = 0; }

    function jump() {
      if (bee.j < 2) {
        bee.vy = bee.j === 0 ? -9.6 : -8.4;
        bee.j++;
        for (let i = 0; i < 5; i++) parts.push({ x: bee.x + 16, y: bee.y + 10, vx: (Math.random() - .5) * 3, vy: -Math.random() * 3, l: 18, ml: 18, c: T.lime, r: 2, type: 'pollen' });
      }
    }

    function startGame() {
      objs = []; parts = []; oTimer = 0; fr = 0; spd = 3.0; sc = 0; sx = 0; funds = 0; camShake = 0; slowTimer = 0; shielded = false; fastTimer = 0; scAcc = 0; fundsBonus = 0;
      seedFlowers(); bgPetals = [];
      for (let i = 0; i < 8; i++) bgPetals.push(mkPetal(Math.random() * W, Math.random() * H * 0.85));
      resetBee(); state = 'running';
      if (progRef.current) progRef.current.style.width = '0%';
    }

    function updateBgPetals() {
      if (Math.random() < .012) bgPetals.push(mkPetal(Math.random() * W, -6));
      bgPetals.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(fr * .018 + p.x * .01) * .25; p.rot += p.rs; });
      bgPetals = bgPetals.filter(p => p.y < H + 8);
    }

    function drawBgPetals() {
      bgPetals.forEach(p => {
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
        cx.globalAlpha = .22;
        cx.fillStyle = p.c;
        cx.beginPath(); cx.ellipse(0, 0, p.s, p.s * .48, 0, 0, Math.PI * 2); cx.fill();
        cx.restore();
      });
      cx.globalAlpha = 1;
    }

    function drawSky() {
      cx.fillStyle = '#0b0918'; cx.fillRect(0, 0, W, GY);
      const g = cx.createLinearGradient(0, GY - 55, 0, GY);
      g.addColorStop(0, 'rgba(81,46,248,0)');
      g.addColorStop(1, 'rgba(81,46,248,0.1)');
      cx.fillStyle = g; cx.fillRect(0, GY - 55, W, 55);
      cx.fillStyle = 'rgba(255,255,255,0.55)';
      const starSeed = [17, 53, 101, 143, 199, 241, 307, 359, 401, 443, 487, 509];
      starSeed.forEach((s, i) => {
        const sx2 = (s * 37 + i * 111) % W, sy = (s * 23 + i * 57) % (GY - 20);
        const twinkle = .4 + .6 * Math.abs(Math.sin(fr * .02 + i));
        cx.globalAlpha = twinkle * .7;
        cx.fillRect(sx2, sy, 1, 1);
      });
      cx.globalAlpha = 1;
    }

    function drawGround() {
      cx.fillStyle = '#0e1f10'; cx.fillRect(0, GY, W, H - GY);
      cx.fillStyle = '#122116'; cx.fillRect(0, GY, W, 10);
      cx.fillStyle = '#0a180c'; cx.fillRect(0, GY + 10, W, H - GY - 10);
      cx.fillStyle = '#16a34a'; cx.fillRect(0, GY - 1, W, 3);
      cx.fillStyle = '#15803d'; cx.fillRect(0, GY + 2, W, 4);
      for (let i = 0; i < 32; i++) {
        const bx = (((i * 22 + sx * .55) % W) + W) % W;
        const bh = 4 + ((i * 7) % 5);
        cx.fillStyle = i % 3 === 0 ? '#166534' : '#15803d';
        cx.fillRect(bx, GY - bh, 2, bh + 2);
        if (i % 4 === 0) cx.fillRect(bx + 3, GY - bh + 2, 1, bh);
      }
    }

    function drawGroundFlowers() {
      gFlowers.forEach(f => {
        const bob = Math.sin((fr + f.ph) * .038) * 1.2;
        GF[f.t](cx, f.x, GY + bob, .14);
        f.x -= spd * .38;
        if (f.x < -20) f.x = W + 20;
      });
    }

    function drawBee({ x, y, dead, wp }: typeof bee) {
      const bob = dead ? 0 : Math.sin(fr * .2) * 1.2;
      const yy = y + bob;

      if (!dead) {
        const sdist = Math.max(0, (gY() - y));
        const sa = Math.max(0, .3 - sdist * .006);
        cx.globalAlpha = sa;
        cx.fillStyle = '#000';
        cx.beginPath(); cx.ellipse(x + 16, GY + 3, 14 - sdist * .1, 4, 0, 0, Math.PI * 2); cx.fill();
        cx.globalAlpha = 1;
      }

      const wFlap = Math.sin(wp) * 6;

      cx.globalAlpha = dead ? .15 : .5;
      cx.fillStyle = '#bae6fd';
      cx.beginPath(); cx.ellipse(x + 10, yy + 8 + wFlap, 11, 6, -.3, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.ellipse(x + 20, yy + 7 + wFlap, 9, 5, -.2, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#7dd3fc';
      cx.beginPath(); cx.ellipse(x + 10, yy + 15 - wFlap * .6, 9, 5, .2, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.ellipse(x + 20, yy + 14 - wFlap * .6, 7, 4, .15, 0, Math.PI * 2); cx.fill();
      cx.globalAlpha = dead ? .05 : .12;
      cx.strokeStyle = '#0369a1'; cx.lineWidth = .8;
      cx.beginPath(); cx.moveTo(x + 6, yy + 8 + wFlap); cx.lineTo(x + 18, yy + 6 + wFlap); cx.stroke();
      cx.beginPath(); cx.moveTo(x + 16, yy + 7 + wFlap); cx.lineTo(x + 26, yy + 5 + wFlap); cx.stroke();
      cx.globalAlpha = 1;

      cx.fillStyle = '#b45309';
      cx.beginPath(); cx.moveTo(x - 1, yy + 16); cx.lineTo(x - 7, yy + 19); cx.lineTo(x - 1, yy + 22); cx.fill();

      cx.fillStyle = dead ? '#ef4444' : T.amber;
      cx.beginPath(); cx.roundRect(x + 1, yy + 10, 20, 18, 5); cx.fill();
      if (!dead) {
        cx.fillStyle = '#1c1c1c';
        cx.fillRect(x + 3, yy + 15, 17, 3);
        cx.fillRect(x + 3, yy + 20, 17, 3);
      }

      cx.fillStyle = dead ? '#dc2626' : '#d97706';
      cx.fillRect(x + 6, yy + 8, 10, 5);

      cx.fillStyle = dead ? '#ef4444' : T.amber;
      cx.beginPath(); cx.roundRect(x + 14, yy + 5, 16, 16, 4); cx.fill();

      cx.fillStyle = dead ? '#fca5a5' : '#1c1c1c';
      cx.beginPath(); cx.arc(x + 20, yy + 10, 3.5, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.arc(x + 27, yy + 10, 3.5, 0, Math.PI * 2); cx.fill();
      if (!dead) {
        cx.fillStyle = '#fff';
        cx.beginPath(); cx.arc(x + 21, yy + 9, 1.5, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.arc(x + 28, yy + 9, 1.5, 0, Math.PI * 2); cx.fill();
      }

      if (dead) {
        cx.strokeStyle = '#fca5a5'; cx.lineWidth = 1.5;
        cx.beginPath(); cx.moveTo(x + 18, yy + 9); cx.lineTo(x + 22, yy + 13); cx.moveTo(x + 22, yy + 9); cx.lineTo(x + 18, yy + 13); cx.stroke();
        cx.beginPath(); cx.moveTo(x + 25, yy + 9); cx.lineTo(x + 29, yy + 13); cx.moveTo(x + 29, yy + 9); cx.lineTo(x + 25, yy + 13); cx.stroke();
      }

      cx.fillStyle = '#1c1c1c'; cx.lineWidth = 1.5;
      cx.beginPath(); cx.moveTo(x + 20, yy + 5); cx.lineTo(x + 17, yy - 3); cx.stroke();
      cx.beginPath(); cx.moveTo(x + 27, yy + 5); cx.lineTo(x + 30, yy - 3); cx.stroke();
      cx.fillStyle = dead ? T.error : T.lime;
      cx.beginPath(); cx.arc(x + 17, yy - 4, 2.5, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.arc(x + 30, yy - 4, 2.5, 0, Math.PI * 2); cx.fill();

      if (shielded && !dead) {
        cx.globalAlpha = .22 + Math.sin(fr * .08) * .08;
        cx.fillStyle = T.sky;
        cx.beginPath(); cx.ellipse(x + 15, yy + 11, 22, 26, 0, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = T.sky; cx.lineWidth = 1.5; cx.globalAlpha = .4;
        cx.beginPath(); cx.ellipse(x + 15, yy + 11, 22, 26, 0, 0, Math.PI * 2); cx.stroke();
        cx.globalAlpha = 1;
      }
    }

    function drawThorn(o: any) {
      const cx2 = o.x + o.w / 2;
      cx.fillStyle = '#14532d'; cx.fillRect(cx2 - 4, o.y, 8, o.h);
      cx.fillStyle = '#166534';
      for (let i = 0; i < 4; i++) {
        const ty = o.y + 6 + i * 10;
        cx.beginPath(); cx.moveTo(cx2 - 4, ty); cx.lineTo(cx2 - 13, ty + 4); cx.lineTo(cx2 - 4, ty + 7); cx.fill();
        cx.beginPath(); cx.moveTo(cx2 + 4, ty); cx.lineTo(cx2 + 13, ty + 4); cx.lineTo(cx2 + 4, ty + 7); cx.fill();
      }
      cx.fillStyle = '#052e16';
      cx.fillRect(cx2 - 6, o.y - 2, 12, 6);
      cx.beginPath(); cx.moveTo(cx2 - 4, o.y - 2); cx.lineTo(cx2, o.y - 10); cx.lineTo(cx2 + 4, o.y - 2); cx.fill();
      cx.fillStyle = '#14532d';
      cx.beginPath(); cx.moveTo(cx2 - 8, o.y + 1); cx.lineTo(cx2 - 3, o.y - 7); cx.lineTo(cx2 + 1, o.y + 1); cx.fill();
      cx.beginPath(); cx.moveTo(cx2 + 2, o.y + 1); cx.lineTo(cx2 + 7, o.y - 7); cx.lineTo(cx2 + 12, o.y + 1); cx.fill();
      cx.fillStyle = '#16a34a'; cx.fillRect(cx2 - 2, o.y, 2, o.h);
    }

    function drawFlowerObs(o: any) {
      const mx = o.x + o.w / 2, my = o.y + o.h / 2;
      const rot = fr * .028;
      const variants = [
        { p: T.pink, c: T.pinkMid },
        { p: T.peach, c: '#c2410c' },
        { p: T.purple, c: '#6d28d9' },
      ];
      const { p: pc, c: cc } = variants[o.v % 3];

      cx.fillStyle = pc;
      for (let i = 0; i < 8; i++) {
        const a = rot + i * Math.PI / 4;
        cx.beginPath(); cx.ellipse(mx + Math.cos(a) * 12, my + Math.sin(a) * 12, 7.5, 3.5, a, 0, Math.PI * 2); cx.fill();
      }
      cx.fillStyle = cc;
      for (let i = 0; i < 4; i++) {
        const a = -rot * .7 + i * Math.PI / 2;
        cx.beginPath(); cx.ellipse(mx + Math.cos(a) * 7, my + Math.sin(a) * 7, 5, 2.5, a, 0, Math.PI * 2); cx.fill();
      }
      cx.fillStyle = T.lime; cx.beginPath(); cx.arc(mx, my, 7, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#141414'; cx.beginPath(); cx.arc(mx, my, 3.5, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = T.lime;
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * .4; cx.beginPath(); cx.arc(mx + Math.cos(a) * 4, my + Math.sin(a) * 4, .8, 0, Math.PI * 2); cx.fill(); }
      cx.globalAlpha = .15;
      cx.fillStyle = pc;
      cx.beginPath(); cx.arc(mx, my, 20, 0, Math.PI * 2); cx.fill();
      cx.globalAlpha = 1;
    }

    function drawShear(o: any) {
      const mx = o.x + o.w / 2;
      const snap = Math.sin(fr * .22) * 4;
      cx.fillStyle = '#f59e0b';
      cx.beginPath(); cx.roundRect(o.x + 1, o.y + o.h - 14, 7, 16, 3); cx.fill();
      cx.beginPath(); cx.roundRect(o.x + o.w - 8, o.y + o.h - 14, 7, 16, 3); cx.fill();
      cx.fillStyle = '#b45309'; cx.beginPath(); cx.arc(mx, o.y + o.h - 18, 5, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#fcd34d'; cx.beginPath(); cx.arc(mx, o.y + o.h - 18, 2.5, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#d1d5db';
      cx.fillRect(o.x + 2, o.y, 5, o.h - 16 + snap);
      cx.fillRect(o.x + o.w - 7, o.y, 5, o.h - 16 - snap);
      cx.fillStyle = '#f9fafb';
      cx.fillRect(o.x + 2, o.y, 1.5, o.h - 16 + snap);
      cx.fillRect(o.x + o.w - 5, o.y, 1.5, o.h - 16 - snap);
      cx.fillStyle = '#6b7280';
      cx.fillRect(o.x + 3, o.y + 2, 3, 2);
      cx.fillRect(o.x + o.w - 6, o.y + 2, 3, 2);
    }

    function drawCollect(o: any) {
      const mx = o.x + o.w / 2, my = o.y + o.h / 2;
      const pulse = Math.sin(fr * .06) * .3 + .7;
      cx.save();
      cx.globalAlpha = .18 * pulse;
      const gc = o.sub === 'slowmo' ? T.lime : o.sub === 'shield' ? T.sky : o.sub === 'fast' ? T.amber : T.purple;
      cx.fillStyle = gc;
      cx.beginPath(); cx.arc(mx, my, 18, 0, Math.PI * 2); cx.fill();
      cx.globalAlpha = 1;
      if (o.sub === 'slowmo') {
        cx.fillStyle = gc;
        cx.beginPath(); cx.moveTo(mx, my - 9); cx.lineTo(mx + 7, my); cx.lineTo(mx, my + 9); cx.lineTo(mx - 7, my); cx.closePath(); cx.fill();
        cx.fillStyle = '#fff';
        cx.beginPath(); cx.moveTo(mx, my - 4); cx.lineTo(mx + 3, my); cx.lineTo(mx, my + 4); cx.lineTo(mx - 3, my); cx.closePath(); cx.fill();
      } else if (o.sub === 'shield') {
        cx.fillStyle = gc;
        cx.beginPath(); cx.arc(mx, my, 9, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#fff'; cx.lineWidth = 1.5; cx.strokeStyle = '#fff';
        cx.beginPath(); cx.arc(mx, my, 6, 0, Math.PI * 2); cx.stroke();
        cx.beginPath(); cx.moveTo(mx - 3, my - 2); cx.lineTo(mx, my + 5); cx.lineTo(mx + 3, my - 2); cx.stroke();
      } else if (o.sub === 'fast') {
        cx.fillStyle = gc;
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * .4; cx.beginPath(); cx.arc(mx + Math.cos(a) * 8, my + Math.sin(a) * 8, 4, 0, Math.PI * 2); cx.fill(); }
        cx.fillStyle = '#fff'; cx.font = '600 9px Onest,sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('\u26A1', mx, my);
      } else {
        cx.fillStyle = gc;
        cx.beginPath(); cx.moveTo(mx, my - 9); cx.lineTo(mx + 5, my - 3); cx.lineTo(mx + 8, my + 5); cx.lineTo(mx, my + 9); cx.lineTo(mx - 8, my + 5); cx.lineTo(mx - 5, my - 3); cx.closePath(); cx.fill();
        cx.fillStyle = '#fff';
        cx.beginPath(); cx.arc(mx, my, 3, 0, Math.PI * 2); cx.fill();
      }
      cx.restore();
    }

    function drawParticles() {
      parts.forEach(p => {
        const a = p.l / p.ml;
        cx.globalAlpha = a * .9;
        cx.fillStyle = p.c;
        cx.beginPath(); cx.arc(p.x, p.y, p.r * a + .5, 0, Math.PI * 2); cx.fill();
      });
      cx.globalAlpha = 1;
    }

    function card(x: number, y: number, w: number, h: number, r = 16) {
      cx.fillStyle = '#1e1e1e';
      cx.beginPath(); cx.roundRect(x, y, w, h, r); cx.fill();
      cx.strokeStyle = 'rgba(255,255,255,0.1)'; cx.lineWidth = .5;
      cx.beginPath(); cx.roundRect(x, y, w, h, r); cx.stroke();
    }

    function pillBtn(label: string, cx2: number, cy: number, bg = '#512ef8', tc = '#fff') {
      cx.font = '500 12px Onest,sans-serif';
      const tw = cx.measureText(label).width;
      const pw = tw + 28, ph = 34;
      cx.fillStyle = bg;
      cx.beginPath(); cx.roundRect(cx2 - pw / 2, cy - ph / 2, pw, ph, 100); cx.fill();
      cx.fillStyle = tc; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(label, cx2, cy);
      cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    }

    function drawIdle() {
      cx.fillStyle = 'rgba(14,9,24,0.78)'; cx.fillRect(0, 0, W, H);
      const cw = 320, ch = 118, cx2 = W / 2 - cw / 2, cy = 56;
      card(cx2, cy, cw, ch);
      cx.fillStyle = '#fff'; cx.font = '600 18px Onest,sans-serif';
      cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
      cx.fillText('Givita Garden Run', W / 2, cy + 32);
      cx.fillStyle = '#555'; cx.font = '400 12px Onest,sans-serif';
      cx.fillText('Dodge thorns \u00B7 grow the community fund', W / 2, cy + 54);
      cx.fillStyle = '#d6ff5d'; cx.font = '500 10px Onest,sans-serif';
      const bt = '\uD83C\uDF38  Every point = \u20A60.01 donated';
      const btw = cx.measureText(bt).width;
      cx.fillStyle = 'rgba(214,255,93,0.1)'; cx.beginPath(); cx.roundRect(W / 2 - btw / 2 - 10, cy + 62, btw + 20, 18, 100); cx.fill();
      cx.fillStyle = T.lime; cx.fillText(bt, W / 2, cy + 74);
      cx.textAlign = 'left';
      pillBtn('Space \u00B7 Click \u00B7 Tap  to start', W / 2, cy + 104);
    }

    function drawDead() {
      cx.fillStyle = 'rgba(14,9,24,0.8)'; cx.fillRect(0, 0, W, H);
      const cw = 300, ch = 126, cx2 = W / 2 - cw / 2, cy = 50;
      card(cx2, cy, cw, ch);
      cx.fillStyle = 'rgba(239,68,68,0.1)';
      cx.beginPath(); cx.roundRect(cx2, cy, cw, 28, { upperLeft: 16, upperRight: 16, lowerLeft: 0, lowerRight: 0 }); cx.fill();
      cx.fillStyle = '#ef4444'; cx.font = '600 13px Onest,sans-serif'; cx.textAlign = 'center';
      cx.fillText('Got stung! \uD83D\uDC1D', W / 2, cy + 18);
      cx.fillStyle = '#f0f0f0'; cx.font = '500 13px Onest,sans-serif';
      cx.fillText('Score ' + sc, W / 2, cy + 46);
      cx.fillStyle = T.lime; cx.font = '600 15px Onest,sans-serif';
      cx.fillText('\u20A6' + funds.toFixed(2) + ' raised', W / 2, cy + 68);
      cx.fillStyle = sc >= hi ? T.lime : '#555'; cx.font = '400 11px Onest,sans-serif';
      cx.fillText('Best: ' + hi, W / 2, cy + 88);
      cx.textAlign = 'left';
      pillBtn('Try again', W / 2, cy + 112);
    }

    function updateHud() {
      if (scRef.current) scRef.current.textContent = String(sc);
      if (hiRef.current) hiRef.current.textContent = String(hi);
      if (fundsRef.current) fundsRef.current.textContent = '\u20A6' + funds.toFixed(2) + ' raised';
      if (progRef.current) progRef.current.style.width = Math.min(100, (sc / 1500) * 100) + '%';
    }

    function spawn() {
      const r = Math.random();
      if (r < .34) {
        const n = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) { const h = 32 + Math.random() * 20; objs.push({ type: 'thorn', x: W + 6 + i * 28, y: GY - h, w: 22, h }); }
      } else if (r < .56) {
        const yOff = Math.random() < .5 ? 50 : 85;
        objs.push({ type: 'flower', x: W + 6, y: GY - yOff - 28, w: 34, h: 34, v: Math.floor(Math.random() * 3) });
      } else if (r < .78) {
        const h = 36 + Math.random() * 12;
        objs.push({ type: 'shear', x: W + 6, y: GY - h, w: 22, h });
      } else {
        const subs = ['slowmo', 'shield', 'fast', 'funds'];
        objs.push({ type: 'collect', sub: subs[Math.floor(Math.random() * 4)], x: W + 6, y: GY - 65, w: 20, h: 20 });
      }
    }

    function hits(o: any) {
      const pad = 2;
      return bee.x + pad < o.x + o.w - pad && bee.x + 30 - pad > o.x + pad &&
        bee.y + pad < o.y + o.h - pad && bee.y + 28 - pad > o.y + pad;
    }

    function update() {
      fr++; sx += spd;
      scAcc += spd / 20;
      sc = Math.floor(scAcc);
      funds = +((scAcc * .01) + fundsBonus).toFixed(2);
      spd = Math.min(7, 3.0 + sc * .0012);
      if (slowTimer > 0) { spd *= 0.5; slowTimer--; }
      if (fastTimer > 0) { spd *= 1.8; fastTimer--; }
      updateHud();
      updateBgPetals();

      bee.vy += .56; bee.y += bee.vy;
      bee.wp += bee.j > 0 ? .38 : .22;
      const gy = gY();
      if (bee.y >= gy) { bee.y = gy; bee.vy = 0; bee.j = 0; }

      if (!bee.dead && Math.random() < .18) {
        parts.push({ x: bee.x + 4, y: bee.y + 10, vx: -1.2 - Math.random() * 1.5, vy: (Math.random() - .5) * .8, l: 12, ml: 12, c: T.lime, r: 1.5, type: 'dust' });
      }

      const interval = Math.max(56, 105 - sc * .042);
      oTimer++; if (oTimer >= interval) { oTimer = 0; spawn(); }

      objs.forEach(o => {
        o.x -= spd;
        if (o.type === 'flower') o.y += Math.sin(fr * .038) * 0.45;
        if (!bee.dead && hits(o)) {
          if (o.type === 'collect') {
            o.collected = true;
            const preSc = sc, preF = funds;
            if (o.sub === 'slowmo') { slowTimer = 120; console.log('[collect] slowmo — sc=' + sc + ' funds=' + funds + ' → spd halved 2s'); }
            else if (o.sub === 'shield') { shielded = true; console.log('[collect] shield — sc=' + sc + ' funds=' + funds + ' → next hit absorbed'); }
            else if (o.sub === 'fast') { fastTimer = 120; console.log('[collect] fast — sc=' + sc + ' funds=' + funds + ' → spd×1.8 for 2s'); }
            else if (o.sub === 'funds') { fundsBonus += 1; funds = +((scAcc * .01) + fundsBonus).toFixed(2); console.log('[collect] funds — sc=' + sc + ' funds ' + preF + '→' + funds + ' (+₦1.00)'); }
            updateHud();
            const cc = o.sub === 'slowmo' ? T.lime : o.sub === 'shield' ? T.sky : o.sub === '2x' ? T.amber : T.purple;
            for (let i = 0; i < 16; i++) parts.push({
              x: o.x + 10, y: o.y + 10,
              vx: (Math.random() - .5) * 5, vy: -Math.random() * 5,
              l: 30, ml: 30, c: [cc, '#fff', cc, T.amber][i % 4], r: 3, type: 'burst',
            });
          } else if (shielded) {
            shielded = false;
            o.collected = true;
            camShake = 6;
            console.log('[collect] shield break — saved from ' + o.type);
            for (let i = 0; i < 20; i++) parts.push({
              x: bee.x + 16, y: bee.y + 14,
              vx: (Math.random() - .5) * 8, vy: (Math.random() - .5) * 8,
              l: 20, ml: 20, c: [T.sky, '#fff', T.sky, '#93c5fd'][i % 4], r: 3, type: 'burst',
            });
          } else {
            bee.dead = true; state = 'dead'; camShake = 14;
            console.log('[game] died — final sc=' + sc + ' funds=' + funds);
            for (let i = 0; i < 12; i++) parts.push({
              x: bee.x + 16, y: bee.y + 14,
              vx: (Math.random() - .5) * 6, vy: -Math.random() * 6,
              l: 28, ml: 28, c: [T.amber, T.lime, '#fff', T.error][i % 4], r: 3, type: 'burst',
            });
          }
        }
      });
      objs = objs.filter(o => o.x + o.w > -10 && !o.collected);
      parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .14; p.l--; });
      parts = parts.filter(p => p.l > 0);
      if (camShake > 0) camShake--;
      if (state === 'dead' && sc > hi) { hi = sc; updateHud(); }
    }

    function drawScene(shake: number) {
      cx.save();
      if (shake > 0) { cx.translate((Math.random() - .5) * shake * .6, (Math.random() - .5) * shake * .4); }
      drawSky();
      drawBgPetals();
      drawGroundFlowers();
      drawGround();
      drawParticles();
      objs.forEach(o => {
        if (o.type === 'thorn') drawThorn(o);
        else if (o.type === 'flower') drawFlowerObs(o);
        else if (o.type === 'shear') drawShear(o);
        else if (o.type === 'collect') drawCollect(o);
      });
      drawBee(bee);
      cx.restore();
    }

    function loop() {
      cx.clearRect(0, 0, W, H);
      if (state === 'running') {
        update(); drawScene(0);
      } else if (state === 'idle') {
        updateBgPetals(); fr++;
        gFlowers.forEach(f => { f.x -= .5; if (f.x < -20) f.x = W + 20; });
        drawScene(0); drawIdle();
      } else if (state === 'dead') {
        drawScene(camShake); drawDead();
      }
      animId = requestAnimationFrame(loop);
    }

    function act() {
      if (state !== 'running') startGame(); else jump();
    }

    const handleKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); act(); } };
    const handleTouch = (e: TouchEvent) => { e.preventDefault(); act(); };
    const handleClick = () => act();

    document.addEventListener('keydown', handleKey);
    cv.addEventListener('touchstart', handleTouch, { passive: false });
    cv.addEventListener('mousedown', handleClick);

    resetBee();
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      document.removeEventListener('keydown', handleKey);
      cv.removeEventListener('touchstart', handleTouch);
      cv.removeEventListener('mousedown', handleClick);
    };
  }, [canvasRef, scRef, hiRef, fundsRef, progRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '480/580', cursor: 'pointer', touchAction: 'none' }}
    />
  );
}
