// Ambient Screensaver Mode — beautiful live data display
import { showToast } from '../utils/toast.js';

let isActive = false;
let containerEl = null;
let clockInterval = null;

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Simplicity is the ultimate sophistication.",
  "Stay hungry, stay foolish.",
  "Design is not just what it looks like, design is how it works.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Innovation distinguishes between a leader and a follower.",
  "Make each day your masterpiece.",
  "Think different.",
  "Less is more.",
  "Be the change you wish to see in the world.",
];

export function initAmbientMode() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F6') {
      e.preventDefault();
      toggleAmbient();
    }
  });
}

export function toggleAmbient() {
  if (isActive) exitAmbient();
  else enterAmbient();
  return isActive;
}

function enterAmbient() {
  isActive = true;
  document.body.classList.add('ambient-mode');

  containerEl = document.createElement('div');
  containerEl.className = 'ambient-container';
  containerEl.innerHTML = `
    <div class="ambient-content">
      <div class="ambient-time" id="ambient-time"></div>
      <div class="ambient-date" id="ambient-date"></div>
      <div class="ambient-quote" id="ambient-quote"></div>
      <div class="ambient-hint">Press F6 or click to exit</div>
    </div>
    <canvas class="ambient-particles" id="ambient-particles"></canvas>`;

  containerEl.addEventListener('click', exitAmbient);
  document.body.appendChild(containerEl);

  updateAmbientClock();
  clockInterval = setInterval(updateAmbientClock, 1000);
  setRandomQuote();
  initAmbientParticles();
}

function exitAmbient() {
  isActive = false;
  document.body.classList.remove('ambient-mode');
  if (clockInterval) clearInterval(clockInterval);
  if (containerEl) {
    containerEl.classList.add('fading-out');
    setTimeout(() => { containerEl?.remove(); containerEl = null; }, 500);
  }
}

function updateAmbientClock() {
  const now = new Date();
  const timeEl = document.getElementById('ambient-time');
  const dateEl = document.getElementById('ambient-date');
  if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function setRandomQuote() {
  const quoteEl = document.getElementById('ambient-quote');
  if (quoteEl) {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    quoteEl.textContent = `"${q}"`;
  }
}

function initAmbientParticles() {
  const canvas = document.getElementById('ambient-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    if (!isActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      s.twinkle += 0.02;
      s.y -= s.speed;
      if (s.y < -10) { s.y = canvas.height + 10; s.x = Math.random() * canvas.width; }
      const alpha = 0.3 + Math.sin(s.twinkle) * 0.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

export function isAmbientActive() { return isActive; }
