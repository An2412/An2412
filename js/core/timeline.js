// B3: Timeline mode - sort widgets by interaction frequency
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';
import { getLayout, reorderLayout } from './state.js';
import { renderDashboard } from './grid.js';

const INTERACTIONS_KEY = 'spd_interactions';
let interactions = {};
let timelineMode = false;

export function initTimeline() {
  interactions = loadFromLocalStorage(INTERACTIONS_KEY, {});

  // Track clicks on widgets
  document.addEventListener('click', (e) => {
    const widget = e.target.closest('.widget');
    if (!widget) return;
    const id = widget.dataset.id;
    if (!id) return;
    interactions[id] = (interactions[id] || 0) + 1;
    saveToLocalStorage(INTERACTIONS_KEY, interactions);
  });
}

export function isTimelineMode() { return timelineMode; }

export function toggleTimelineMode() {
  timelineMode = !timelineMode;
  if (timelineMode) {
    const layout = getLayout();
    const sorted = [...layout].sort((a, b) => (interactions[b.id] || 0) - (interactions[a.id] || 0));
    const newOrder = sorted.map((w) => w.id);
    reorderLayout(newOrder);
  }
  renderDashboard();
  return timelineMode;
}

export function getInteractionCount(widgetId) {
  return interactions[widgetId] || 0;
}
