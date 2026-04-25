import { loadInitialData, addWidget, getLayout, getWidgetData } from './core/state.js';
import { renderDashboard } from './core/grid.js';
import { initTheme, toggleTheme } from './core/theme.js';
import { getAllWidgetTypes } from './core/registry.js';
import { showToast } from './utils/toast.js';
import {
  isEncryptionEnabled,
  setEncryptionEnabled,
  setEncryptionPassword,
  getEncryptionPassword,
  saveToLocalStorage,
  loadFromLocalStorage,
} from './core/storage.js';

// Effects (Phase 7)
import { initGradientBackground } from './effects/gradient.js';
import { initRipple } from './effects/ripple.js';
import { initSound, toggleSound, isSoundEnabled } from './effects/sound.js';
import { playAdd } from './effects/sound.js';

// Smart Layout (Phase 8)
import { initSidebar, toggleSidebar } from './core/sidebar.js';
import { initFocusMode } from './core/focus.js';
import { initTimeline, toggleTimelineMode, isTimelineMode } from './core/timeline.js';
import { initZenMode, toggleZenMode } from './core/zen.js';
import { saveSnapshot, getSnapshots, getSnapshotById, deleteSnapshot } from './core/snapshots.js';

// Personalization (Phase 9)
import { initBackground, setBackgroundType, getBackgroundType } from './effects/background.js';

// Import all widgets to register them
import './widgets/todo.js';
import './widgets/note.js';
import './widgets/clock.js';
import './widgets/weather.js';
import './widgets/calculator.js';
import './widgets/pomodoro.js';
import './widgets/bookmark.js';
import './widgets/habit.js';
import './widgets/cryptoWidget.js';
import './widgets/aichat.js';

// --- Init ---
function init() {
  initTheme();
  loadInitialData();

  // Phase 7: Effects
  initGradientBackground();
  initRipple();
  initSound();

  // Phase 8: Smart layouts
  initSidebar();
  initFocusMode();
  initTimeline();
  initZenMode();

  // Phase 9: Personalization
  initBackground();

  renderDashboard();
  bindEvents();
  updateSoundIcon();
  updateBgButtons();
  showToast('Dashboard loaded', 'info');
}

// --- Event Bindings ---
function bindEvents() {
  // Theme toggle (A4: circle reveal)
  document.getElementById('btn-theme')?.addEventListener('click', (e) => toggleTheme(e));

  // Add widget buttons
  document.getElementById('btn-add')?.addEventListener('click', openAddModal);
  document.getElementById('fab-add')?.addEventListener('click', openAddModal);

  // Modal close
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // Encryption
  document.getElementById('btn-encrypt')?.addEventListener('click', openEncryptModal);

  // Sidebar toggle (B1)
  document.getElementById('btn-sidebar')?.addEventListener('click', toggleSidebar);

  // Sound toggle (C2)
  document.getElementById('btn-sound')?.addEventListener('click', () => {
    toggleSound();
    updateSoundIcon();
    showToast(isSoundEnabled() ? 'Sound ON' : 'Sound OFF', 'info');
  });

  // Zen mode button (B4)
  document.getElementById('btn-zen')?.addEventListener('click', () => {
    const active = toggleZenMode();
    document.getElementById('btn-zen')?.classList.toggle('active', active);
  });

  // Timeline mode button (B3)
  document.getElementById('btn-timeline')?.addEventListener('click', () => {
    const active = toggleTimelineMode();
    document.getElementById('btn-timeline')?.classList.toggle('active', active);
    showToast(active ? 'Timeline: most used first' : 'Default layout', 'info');
  });

  // Save layout (B5)
  document.getElementById('btn-save-layout')?.addEventListener('click', () => {
    const name = prompt('Layout name:', `Layout ${new Date().toLocaleDateString()}`);
    if (name) {
      saveSnapshot(name);
    }
  });

  // Load layout (B5)
  document.getElementById('btn-load-layout')?.addEventListener('click', openLoadLayoutModal);

  // Background options (C1)
  document.getElementById('btn-bg-gradient')?.addEventListener('click', () => { setBackgroundType('gradient'); updateBgButtons(); showToast('Gradient background', 'info'); });
  document.getElementById('btn-bg-particles')?.addEventListener('click', () => { setBackgroundType('particles'); updateBgButtons(); showToast('Particle background', 'info'); });
  document.getElementById('btn-bg-waves')?.addEventListener('click', () => { setBackgroundType('waves'); updateBgButtons(); showToast('Wave background', 'info'); });

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeEncryptModal();
    }
  });
}

function updateSoundIcon() {
  const on = document.getElementById('icon-sound-on');
  const off = document.getElementById('icon-sound-off');
  if (on && off) {
    on.classList.toggle('hidden', !isSoundEnabled());
    off.classList.toggle('hidden', isSoundEnabled());
  }
}

function updateBgButtons() {
  const type = getBackgroundType();
  document.getElementById('btn-bg-gradient')?.classList.toggle('active', type === 'gradient');
  document.getElementById('btn-bg-particles')?.classList.toggle('active', type === 'particles');
  document.getElementById('btn-bg-waves')?.classList.toggle('active', type === 'waves');
}

// --- Add Widget Modal ---
function openAddModal() {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const title = document.getElementById('modal-title');
  if (!overlay || !body) return;

  title.textContent = 'Add Widget';
  const types = getAllWidgetTypes();

  body.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'widget-selector';

  types.forEach((t) => {
    const option = document.createElement('div');
    option.className = 'widget-option';
    option.innerHTML = `
      <div class="widget-option-icon">${t.icon || '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'}</div>
      <div class="widget-option-info">
        <h3>${t.name}</h3>
        <p>${t.description}</p>
      </div>`;
    option.addEventListener('click', () => {
      addWidget(t.type);
      renderDashboard();
      closeModal();
      playAdd();
      showToast(`${t.name} added`, 'success');
    });
    grid.appendChild(option);
  });

  body.appendChild(grid);
  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay')?.classList.add('hidden');
}

// --- Load Layout Modal (B5) ---
function openLoadLayoutModal() {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const title = document.getElementById('modal-title');
  if (!overlay || !body) return;

  title.textContent = 'Load Layout';
  const snapshots = getSnapshots();

  body.innerHTML = '';
  if (snapshots.length === 0) {
    body.innerHTML = '<p style="color:var(--text-secondary);font-size:0.85rem;">No saved layouts yet. Use "Save Layout" to create one.</p>';
    overlay.classList.remove('hidden');
    return;
  }

  const list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;';

  snapshots.forEach((snap) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:8px;background:var(--bg-body);';

    const info = document.createElement('div');
    info.innerHTML = `<div style="font-weight:500;font-size:0.85rem;">${snap.name}</div><div style="font-size:0.75rem;color:var(--text-secondary);">${new Date(snap.createdAt).toLocaleString()} &middot; ${snap.layout.length} widgets</div>`;

    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:0.4rem;';

    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn btn-primary btn-sm';
    loadBtn.textContent = 'Load';
    loadBtn.addEventListener('click', () => {
      const s = getSnapshotById(snap.id);
      if (s) {
        saveToLocalStorage('spd_layout', s.layout);
        saveToLocalStorage('spd_data', s.widgetData);
        loadInitialData();
        renderDashboard();
        closeModal();
        showToast(`Layout "${snap.name}" loaded`, 'success');
      }
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      deleteSnapshot(snap.id);
      openLoadLayoutModal();
      showToast('Snapshot deleted', 'info');
    });

    btns.append(loadBtn, delBtn);
    row.append(info, btns);
    list.appendChild(row);
  });

  body.appendChild(list);
  overlay.classList.remove('hidden');
}

// --- Encryption Modal ---
function openEncryptModal() {
  const modal = document.getElementById('encrypt-modal');
  const body = document.getElementById('encrypt-body');
  if (!modal || !body) return;

  const enabled = isEncryptionEnabled();
  body.innerHTML = `
    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
      ${enabled
        ? 'Encryption is enabled. Your data is encrypted with AES-GCM.'
        : 'Enable encryption to protect your dashboard data with a password.'}
    </p>
    <div style="display:flex;flex-direction:column;gap:0.75rem;">
      ${!enabled ? `
        <input type="password" class="input" id="enc-password" placeholder="Set a password">
        <input type="password" class="input" id="enc-confirm" placeholder="Confirm password">
        <button class="btn btn-primary" id="enc-enable">Enable Encryption</button>
      ` : `
        <button class="btn btn-danger" id="enc-disable">Disable Encryption</button>
      `}
      <button class="btn" id="enc-close">Close</button>
    </div>`;

  document.getElementById('enc-close')?.addEventListener('click', closeEncryptModal);

  if (!enabled) {
    document.getElementById('enc-enable')?.addEventListener('click', () => {
      const pw = document.getElementById('enc-password')?.value;
      const confirm = document.getElementById('enc-confirm')?.value;
      if (!pw) { showToast('Password required', 'warning'); return; }
      if (pw !== confirm) { showToast('Passwords do not match', 'error'); return; }
      setEncryptionPassword(pw);
      setEncryptionEnabled(true);
      showToast('Encryption enabled', 'success');
      closeEncryptModal();
    });
  } else {
    document.getElementById('enc-disable')?.addEventListener('click', () => {
      setEncryptionPassword(null);
      setEncryptionEnabled(false);
      showToast('Encryption disabled', 'info');
      closeEncryptModal();
    });
  }

  modal.classList.remove('hidden');
}

function closeEncryptModal() {
  document.getElementById('encrypt-modal')?.classList.add('hidden');
}

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
