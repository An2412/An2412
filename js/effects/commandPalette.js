// Command Palette (Cmd+K / Ctrl+K) — Spotlight/Raycast style
import { getAllWidgetTypes } from '../core/registry.js';
import { addWidget } from '../core/state.js';
import { renderDashboard } from '../core/grid.js';
import { showToast } from '../utils/toast.js';
import { toggleZenMode } from '../core/zen.js';
import { toggleTimelineMode } from '../core/timeline.js';
import { playAdd } from './sound.js';

let paletteEl = null;
let isOpen = false;

const COMMANDS = [
  { id: 'zen', label: 'Toggle Zen Mode', icon: '🧘', category: 'View', action: () => toggleZenMode() },
  { id: 'timeline', label: 'Toggle Timeline Mode', icon: '📊', category: 'View', action: () => toggleTimelineMode() },
  { id: 'theme', label: 'Toggle Dark/Light Theme', icon: '🌓', category: 'View', action: () => document.getElementById('btn-theme')?.click() },
  { id: 'sound', label: 'Toggle Sound', icon: '🔊', category: 'Settings', action: () => document.getElementById('btn-sound')?.click() },
  { id: 'encrypt', label: 'Encryption Settings', icon: '🔒', category: 'Settings', action: () => document.getElementById('btn-encrypt')?.click() },
  { id: 'save-layout', label: 'Save Layout Snapshot', icon: '💾', category: 'Layout', action: () => document.getElementById('btn-save-layout')?.click() },
  { id: 'load-layout', label: 'Load Layout Snapshot', icon: '📂', category: 'Layout', action: () => document.getElementById('btn-load-layout')?.click() },
];

export function initCommandPalette() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      togglePalette();
    }
    if (e.key === 'Escape' && isOpen) {
      closePalette();
    }
  });
}

function getAllCommands(query) {
  const widgetTypes = getAllWidgetTypes();
  const widgetCommands = widgetTypes.map((t) => ({
    id: `add-${t.type}`,
    label: `Add ${t.name}`,
    icon: '➕',
    category: 'Widgets',
    action: () => {
      addWidget(t.type);
      renderDashboard();
      playAdd();
      showToast(`${t.name} added`, 'success');
    },
  }));

  const all = [...COMMANDS, ...widgetCommands];
  if (!query) return all;
  const q = query.toLowerCase();
  return all.filter((c) =>
    c.label.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
}

function togglePalette() {
  if (isOpen) closePalette();
  else openPalette();
}

function openPalette() {
  if (paletteEl) return;
  isOpen = true;

  paletteEl = document.createElement('div');
  paletteEl.className = 'cmd-palette-overlay';
  paletteEl.innerHTML = `
    <div class="cmd-palette">
      <div class="cmd-palette-header">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="cmd-palette-input" placeholder="Type a command..." autofocus>
        <kbd class="cmd-kbd">ESC</kbd>
      </div>
      <div class="cmd-palette-results"></div>
    </div>`;

  paletteEl.addEventListener('click', (e) => {
    if (e.target === paletteEl) closePalette();
  });

  document.body.appendChild(paletteEl);

  const input = paletteEl.querySelector('.cmd-palette-input');
  const results = paletteEl.querySelector('.cmd-palette-results');
  let selectedIdx = 0;

  function renderResults(query) {
    const cmds = getAllCommands(query);
    selectedIdx = 0;
    let html = '';
    let lastCategory = '';
    cmds.forEach((cmd, i) => {
      if (cmd.category !== lastCategory) {
        html += `<div class="cmd-category">${cmd.category}</div>`;
        lastCategory = cmd.category;
      }
      html += `<div class="cmd-item${i === selectedIdx ? ' selected' : ''}" data-idx="${i}">
        <span class="cmd-item-icon">${cmd.icon}</span>
        <span class="cmd-item-label">${cmd.label}</span>
      </div>`;
    });
    results.innerHTML = html || '<div style="padding:1rem;color:var(--text-secondary);text-align:center;">No results</div>';

    results.querySelectorAll('.cmd-item').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        const cmd = cmds[idx];
        if (cmd) { closePalette(); cmd.action(); }
      });
      el.addEventListener('mouseenter', () => {
        results.querySelectorAll('.cmd-item').forEach((e) => e.classList.remove('selected'));
        el.classList.add('selected');
        selectedIdx = parseInt(el.dataset.idx);
      });
    });
  }

  renderResults('');

  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', (e) => {
    const cmds = getAllCommands(input.value);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, cmds.length - 1);
      updateSelection(results, selectedIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateSelection(results, selectedIdx);
    } else if (e.key === 'Enter') {
      const cmd = cmds[selectedIdx];
      if (cmd) { closePalette(); cmd.action(); }
    }
  });

  requestAnimationFrame(() => input.focus());
}

function updateSelection(results, idx) {
  results.querySelectorAll('.cmd-item').forEach((el, i) => {
    el.classList.toggle('selected', parseInt(el.dataset.idx) === idx);
    if (parseInt(el.dataset.idx) === idx) {
      el.scrollIntoView({ block: 'nearest' });
    }
  });
}

function closePalette() {
  isOpen = false;
  if (paletteEl) {
    paletteEl.classList.add('closing');
    setTimeout(() => { paletteEl?.remove(); paletteEl = null; }, 150);
  }
}
