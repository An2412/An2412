import { loadInitialData, addWidget } from './core/state.js';
import { renderDashboard } from './core/grid.js';
import { initTheme, toggleTheme } from './core/theme.js';
import { getAllWidgetTypes } from './core/registry.js';
import { showToast } from './utils/toast.js';
import {
  isEncryptionEnabled,
  setEncryptionEnabled,
  setEncryptionPassword,
  getEncryptionPassword,
} from './core/storage.js';

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
  renderDashboard();
  bindEvents();
  showToast('Dashboard loaded', 'info');
}

// --- Event Bindings ---
function bindEvents() {
  // Theme toggle
  document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);

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

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeEncryptModal();
    }
  });
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
