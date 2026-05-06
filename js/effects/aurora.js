// Aurora Borealis + Animated Mesh Gradient backgrounds
let canvas = null;
let ctx = null;
let rafId = null;
let currentType = null;

export function initAurora(type) {
  destroyAurora();
  currentType = type;
  canvas = document.createElement('canvas');
  canvas.id = 'aurora-canvas';
  canvas.className = 'aurora-canvas';
  document.body.prepend(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  if (type === 'aurora') drawAurora();
  else if (type === 'mesh') drawMesh();
}

export function destroyAurora() {
  if (rafId) cancelAnimationFrame(rafId);
  if (canvas) canvas.remove();
  canvas = null;
  ctx = null;
  rafId = null;
  currentType = null;
}

function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const isDark = () => document.documentElement.classList.contains('dark');

// Aurora Borealis
function drawAurora() {
  let t = 0;
  const bands = [
    { baseY: 0.25, amplitude: 60, freq: 0.003, speed: 0.008, hue: 140, width: 180 },
    { baseY: 0.30, amplitude: 50, freq: 0.004, speed: 0.012, hue: 170, width: 140 },
    { baseY: 0.20, amplitude: 70, freq: 0.002, speed: 0.006, hue: 280, width: 120 },
    { baseY: 0.35, amplitude: 40, freq: 0.005, speed: 0.015, hue: 200, width: 100 },
  ];

  function frame() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    bands.forEach((band) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      const alpha = isDark() ? 0.25 : 0.12;
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.3, `hsla(${band.hue}, 80%, 60%, ${alpha})`);
      grad.addColorStop(0.6, `hsla(${band.hue + 20}, 70%, 50%, ${alpha * 0.6})`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 3) {
        const y = h * band.baseY +
          Math.sin(x * band.freq + t * band.speed * 60) * band.amplitude +
          Math.sin(x * band.freq * 1.5 + t * band.speed * 40) * (band.amplitude * 0.5) +
          Math.cos(x * band.freq * 0.5 + t * band.speed * 20) * (band.amplitude * 0.3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Light shimmer
      for (let x = 0; x < w; x += 8) {
        const y = h * band.baseY +
          Math.sin(x * band.freq + t * band.speed * 60) * band.amplitude;
        const shimmer = Math.sin(x * 0.02 + t * 0.05) * 0.5 + 0.5;
        if (shimmer > 0.7) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${band.hue}, 90%, 80%, ${shimmer * (isDark() ? 0.4 : 0.2)})`;
          ctx.fill();
        }
      }
    });

    t++;
    rafId = requestAnimationFrame(frame);
  }
  frame();
}

// Animated Mesh Gradient
function drawMesh() {
  const blobs = [];
  const numBlobs = 5;
  const colors = isDark()
    ? ['#1e3a8a', '#7c3aed', '#be185d', '#0e7490', '#4338ca']
    : ['#93c5fd', '#c4b5fd', '#f9a8d4', '#67e8f9', '#a5b4fc'];

  for (let i = 0; i < numBlobs; i++) {
    blobs.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 200 + Math.random() * 250,
      color: colors[i % colors.length],
    });
  }

  function frame() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    blobs.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.radius) b.x = w + b.radius;
      if (b.x > w + b.radius) b.x = -b.radius;
      if (b.y < -b.radius) b.y = h + b.radius;
      if (b.y > h + b.radius) b.y = -b.radius;

      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      grad.addColorStop(0, b.color + (isDark() ? '55' : '40'));
      grad.addColorStop(1, b.color + '00');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    rafId = requestAnimationFrame(frame);
  }
  frame();
}
