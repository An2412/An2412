import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';

const THEME_KEY = 'spd_theme';

export function initTheme() {
  const saved = loadFromLocalStorage(THEME_KEY, 'light');
  applyTheme(saved);
}

export function toggleTheme() {
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  saveToLocalStorage(THEME_KEY, next);
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
