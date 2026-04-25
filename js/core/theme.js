import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';

const THEME_KEY = 'spd_theme';

export function initTheme() {
  const saved = loadFromLocalStorage(THEME_KEY, 'light');
  applyTheme(saved);
}

// A4: Circle reveal animation when toggling theme
export function toggleTheme(e) {
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';

  // Get click position for circle reveal
  const cx = e ? e.clientX : window.innerWidth / 2;
  const cy = e ? e.clientY : window.innerHeight / 2;

  // Create overlay with the NEW theme's background
  const overlay = document.createElement('div');
  overlay.className = 'theme-reveal-overlay';
  overlay.style.setProperty('--cx', `${cx}px`);
  overlay.style.setProperty('--cy', `${cy}px`);
  overlay.style.background = next === 'dark'
    ? '#0f172a'
    : '#f3f4f6';
  document.body.appendChild(overlay);

  // After the reveal animation reaches midpoint, apply the actual theme
  setTimeout(() => {
    applyTheme(next);
    saveToLocalStorage(THEME_KEY, next);
  }, 250);

  // Remove overlay after animation
  overlay.addEventListener('animationend', () => overlay.remove());
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    toggleIcons(true);
  } else {
    document.documentElement.classList.remove('dark');
    toggleIcons(false);
  }
}

function toggleIcons(isDark) {
  const sun = document.getElementById('icon-sun');
  const moon = document.getElementById('icon-moon');
  if (sun && moon) {
    sun.classList.toggle('hidden', isDark);
    moon.classList.toggle('hidden', !isDark);
  }
}
