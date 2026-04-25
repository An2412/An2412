// A1: Dynamic gradient background following mouse
let enabled = true;
let rafId = null;
let targetX = 50;
let targetY = 50;
let currentX = 50;
let currentY = 50;

export function initGradientBackground() {
  const body = document.body;
  body.classList.add('dynamic-gradient');

  document.addEventListener('mousemove', (e) => {
    if (!enabled) return;
    targetX = (e.clientX / window.innerWidth) * 100;
    targetY = (e.clientY / window.innerHeight) * 100;
  });

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    body.style.setProperty('--gx', `${currentX}%`);
    body.style.setProperty('--gy', `${currentY}%`);
    rafId = requestAnimationFrame(animate);
  }
  animate();
}

export function destroyGradientBackground() {
  enabled = false;
  if (rafId) cancelAnimationFrame(rafId);
  document.body.classList.remove('dynamic-gradient');
}
