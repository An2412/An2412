// Cursor Light Trail — elegant glow following cursor
let canvas = null;
let ctx = null;
let rafId = null;
let points = [];
let mouseX = 0;
let mouseY = 0;

export function initCursorTrail() {
  canvas = document.createElement('canvas');
  canvas.id = 'cursor-trail-canvas';
  canvas.className = 'cursor-trail-canvas';
  document.body.prepend(canvas);
  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    points.push({ x: e.clientX, y: e.clientY, life: 1.0 });
    if (points.length > 50) points.shift();
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.documentElement.classList.contains('dark');

    // Trail
    if (points.length > 2) {
      for (let i = points.length - 1; i >= 0; i--) {
        points[i].life -= 0.025;
        if (points[i].life <= 0) { points.splice(i, 1); continue; }
      }

      if (points.length > 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.strokeStyle = isDark
          ? `rgba(96, 165, 250, 0.3)`
          : `rgba(59, 130, 246, 0.2)`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Glow orb at cursor
    const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 80);
    grd.addColorStop(0, isDark ? 'rgba(96,165,250,0.12)' : 'rgba(59,130,246,0.08)');
    grd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 80, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    rafId = requestAnimationFrame(draw);
  }
  draw();
}

export function destroyCursorTrail() {
  if (rafId) cancelAnimationFrame(rafId);
  if (canvas) canvas.remove();
  canvas = null;
  points = [];
}
