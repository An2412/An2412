import { getLayout, removeWidget, reorderLayout } from './state.js';
import { getWidgetConfig, widgetRegistry } from './registry.js';
import { showToast } from '../utils/toast.js';
import { playDelete } from '../effects/sound.js';

let sortableInstance = null;
const loadedWidgets = new Set();

export function renderDashboard() {
  const grid = document.getElementById('dashboard');
  if (!grid) return;

  destroyAllWidgets();
  grid.innerHTML = '';

  const layout = getLayout();
  if (layout.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--text-secondary);">
        <svg style="width:48px;height:48px;margin:0 auto 1rem;opacity:0.4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
        <p style="font-size:1.1rem;font-weight:500;">No widgets yet</p>
        <p style="font-size:0.85rem;margin-top:0.25rem;">Click <strong>Add Widget</strong> to get started</p>
      </div>`;
    return;
  }

  layout.forEach((item, idx) => {
    const cfg = getWidgetConfig(item.type);
    if (!cfg) return;

    const card = document.createElement('div');
    card.className = 'widget';
    card.dataset.id = item.id;
    // Stagger animation for premium feel
    card.style.animationDelay = `${idx * 0.05}s`;
    card.style.opacity = '0';

    // Make widget draggable for sidebar group assignment
    card.draggable = true;
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/widget-id', item.id);
    });

    card.innerHTML = `
      <div class="widget-header">
        <div class="widget-title">${cfg.icon || ''}${cfg.name}</div>
        <button class="widget-close-btn" title="Remove widget">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="widget-body" id="wb-${item.id}"></div>`;

    const closeBtn = card.querySelector('.widget-close-btn');
    closeBtn.addEventListener('click', () => handleRemoveWidget(item.id, item.type, card));

    grid.appendChild(card);
    initWidget(item.id, item.type);
  });

  initSortable(grid);
}

function initWidget(id, type) {
  const cfg = getWidgetConfig(type);
  if (!cfg) return;
  const container = document.getElementById(`wb-${id}`);
  if (!container) return;
  try {
    cfg.create(container, id);
    loadedWidgets.add(id);
  } catch (e) {
    container.textContent = 'Error loading widget';
    showToast(`Widget error: ${e.message}`, 'error');
  }
}

function handleRemoveWidget(id, type, card) {
  const cfg = getWidgetConfig(type);
  if (cfg && cfg.destroy) {
    try { cfg.destroy(id); } catch {}
  }
  loadedWidgets.delete(id);
  card.classList.add('removing');
  playDelete();
  // A3: Wait for smoke animation (350ms) before removing
  setTimeout(() => {
    removeWidget(id);
    renderDashboard();
  }, 350);
}

function destroyAllWidgets() {
  const layout = getLayout();
  loadedWidgets.forEach((id) => {
    const item = layout.find((w) => w.id === id);
    if (item) {
      const cfg = getWidgetConfig(item.type);
      if (cfg && cfg.destroy) {
        try { cfg.destroy(id); } catch {}
      }
    }
  });
  loadedWidgets.clear();
}

function initSortable(grid) {
  if (sortableInstance) sortableInstance.destroy();
  sortableInstance = new Sortable(grid, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    handle: '.widget-header',
    forceFallback: true,
    fallbackClass: 'sortable-drag',
    onEnd: () => {
      const newOrder = Array.from(grid.children)
        .map((el) => el.dataset.id)
        .filter(Boolean);
      reorderLayout(newOrder);
    },
  });
}
