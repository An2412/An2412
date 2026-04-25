// C1: Background video/particle system options
import { saveToLocalStorage, loadFromLocalStorage } from '../core/storage.js';

const BG_KEY = 'spd_bg_type';
let particleCanvas = null;
let particleRAF = null;

export function initBackground() {
  const type = loadFromLocalStorage(BG_KEY, 'gradient');
  applyBackground(type);
}

export function getBackgroundType() {
  return loadFromLocalStorage(BG_KEY, 'gradient');
}

export function setBackgroundType(type) {
  saveToLocalStorage(BG_KEY, type);
  applyBackground(type);
}

function applyBackground(type) {
  cleanupBackground();
  document.body.classList.remove('bg-particles', 'bg-waves');

  if (type === 'particles') {
    document.body.classList.add('bg-particles');
    createParticles();
  } else if (type === 'waves') {
    document.body.classList.add('bg-waves');
    createWaves();
  }
  // 'gradient' is default, handled by CSS
}

function cleanupBackground() {
  if (particleRAF) cancelAnimationFrame(particleRAF);
  if (particleCanvas) particleCanvas.remove();
  particleCanvas = null;
  const existing = document.getElementById('bg-canvas');
  if (existing) existing.remove();
}

function createParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.className = 'bg-canvas';
  document.body.prepend(canvas);
  particleCanvas = canvas;

  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const isDark = () => document.documentElement.classList.contains('dark');

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const color = isDark() ? 'rgba(96,165,250,' : 'rgba(59,130,246,';
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color + '0.4)';
      ctx.fill();
    });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = color + (0.15 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    particleRAF = requestAnimationFrame(draw);
  }
  draw();
}

function createWaves() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.className = 'bg-canvas';
  document.body.prepend(canvas);
  particleCanvas = canvas;

  const ctx = canvas.getContext('2d');
  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const isDark = () => document.documentElement.classList.contains('dark');
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const baseColor = isDark() ? [96, 165, 250] : [59, 130, 246];

    for (let wave = 0; wave < 3; wave++) {
      ctx.beginPath();
      const yBase = h * 0.6 + wave * 40;
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) {
        const y = yBase + Math.sin((x * 0.003) + t + wave) * 20 + Math.sin((x * 0.007) + t * 0.5) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = `rgba(${baseColor.join(',')},${0.04 - wave * 0.01})`;
      ctx.fill();
    }
    t += 0.015;
    particleRAF = requestAnimationFrame(draw);
  }
  draw();
}
