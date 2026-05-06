// Floating Widget Dock — macOS-style dock with magnification
import { getAllWidgetTypes } from '../core/registry.js';
import { addWidget } from '../core/state.js';
import { renderDashboard } from '../core/grid.js';
import { showToast } from '../utils/toast.js';
import { playAdd } from './sound.js';

let dockEl = null;

export function initDock() {
  dockEl = document.getElementById('widget-dock');
  if (!dockEl) return;

  const types = getAllWidgetTypes();
  dockEl.innerHTML = '';

  types.forEach((t) => {
    const item = document.createElement('button');
    item.className = 'dock-item';
    item.title = t.name;
    item.innerHTML = `<div class="dock-item-icon">${t.emoji || '📦'}</div><span class="dock-tooltip">${t.name}</span>`;
    item.addEventListener('click', () => {
      addWidget(t.type);
      renderDashboard();
      playAdd();
      showToast(`${t.name} added`, 'success');
    });
    dockEl.appendChild(item);
  });

  // Magnification effect
  dockEl.addEventListener('mousemove', (e) => {
    const items = dockEl.querySelectorAll('.dock-item');
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - cx);
      const maxDist = 120;
      const scale = dist < maxDist ? 1 + (1 - dist / maxDist) * 0.5 : 1;
      item.style.transform = `scale(${scale})`;
    });
  });

  dockEl.addEventListener('mouseleave', () => {
    dockEl.querySelectorAll('.dock-item').forEach((item) => {
      item.style.transform = 'scale(1)';
    });
  });
}
