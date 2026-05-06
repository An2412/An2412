// Radial Context Menu — right-click for circular action menu
import { addWidget } from '../core/state.js';
import { renderDashboard } from '../core/grid.js';
import { showToast } from '../utils/toast.js';
import { playAdd, playDelete } from './sound.js';

let menuEl = null;

const MENU_ITEMS = [
  { icon: '📝', label: 'Todo', action: () => { addWidget('todo'); renderDashboard(); playAdd(); } },
  { icon: '📓', label: 'Note', action: () => { addWidget('note'); renderDashboard(); playAdd(); } },
  { icon: '⏱️', label: 'Timer', action: () => { addWidget('pomodoro'); renderDashboard(); playAdd(); } },
  { icon: '🌤️', label: 'Weather', action: () => { addWidget('weather'); renderDashboard(); playAdd(); } },
  { icon: '📊', label: 'Crypto', action: () => { addWidget('crypto'); renderDashboard(); playAdd(); } },
  { icon: '🔖', label: 'Bookmark', action: () => { addWidget('bookmark'); renderDashboard(); playAdd(); } },
  { icon: '🧮', label: 'Calc', action: () => { addWidget('calculator'); renderDashboard(); playAdd(); } },
  { icon: '🤖', label: 'AI Chat', action: () => { addWidget('aichat'); renderDashboard(); playAdd(); } },
];

export function initRadialMenu() {
  document.addEventListener('contextmenu', (e) => {
    // Only on dashboard area
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    const rect = dashboard.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
    // Don't open on widgets themselves
    if (e.target.closest('.widget')) return;

    e.preventDefault();
    closeMenu();

    menuEl = document.createElement('div');
    menuEl.className = 'radial-menu';
    menuEl.style.left = `${e.clientX}px`;
    menuEl.style.top = `${e.clientY}px`;

    const radius = 100;
    const angleStep = (2 * Math.PI) / MENU_ITEMS.length;

    MENU_ITEMS.forEach((item, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const btn = document.createElement('button');
      btn.className = 'radial-menu-item';
      btn.style.setProperty('--tx', `${x}px`);
      btn.style.setProperty('--ty', `${y}px`);
      btn.style.animationDelay = `${i * 0.03}s`;
      btn.innerHTML = `<span class="radial-icon">${item.icon}</span><span class="radial-label">${item.label}</span>`;
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        item.action();
        closeMenu();
        showToast(`${item.label} added`, 'success');
      });
      menuEl.appendChild(btn);
    });

    // Center dot
    const center = document.createElement('div');
    center.className = 'radial-center';
    center.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    menuEl.appendChild(center);

    document.body.appendChild(menuEl);

    const close = (ev) => {
      if (!menuEl?.contains(ev.target)) {
        closeMenu();
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 10);
  });
}

function closeMenu() {
  if (menuEl) {
    menuEl.classList.add('closing');
    setTimeout(() => { menuEl?.remove(); menuEl = null; }, 200);
  }
}
