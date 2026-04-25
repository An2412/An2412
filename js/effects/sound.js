// C2: Sound feedback system using Web Audio API
import { saveToLocalStorage, loadFromLocalStorage } from '../core/storage.js';

const SOUND_KEY = 'spd_sound_enabled';
let audioCtx = null;
let soundEnabled = false;

export function initSound() {
  soundEnabled = loadFromLocalStorage(SOUND_KEY, true);
}

export function isSoundEnabled() { return soundEnabled; }

export function toggleSound() {
  soundEnabled = !soundEnabled;
  saveToLocalStorage(SOUND_KEY, soundEnabled);
  return soundEnabled;
}

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  if (!soundEnabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playComplete() { playTone(880, 0.15, 'sine', 0.12); setTimeout(() => playTone(1100, 0.12, 'sine', 0.1), 100); }
export function playAdd() { playTone(600, 0.1, 'triangle', 0.1); }
export function playDelete() { playTone(300, 0.15, 'sawtooth', 0.08); }
export function playClick() { playTone(500, 0.06, 'sine', 0.06); }
