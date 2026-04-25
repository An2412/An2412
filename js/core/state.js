import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';
import { debounce } from '../utils/debounce.js';

let dashboardLayout = [];
let widgetData = {};

const LAYOUT_KEY = 'spd_layout';
const DATA_KEY = 'spd_data';

export function getLayout() { return dashboardLayout; }
export function getWidgetData() { return widgetData; }

export function loadInitialData() {
  dashboardLayout = loadFromLocalStorage(LAYOUT_KEY, null);
  widgetData = loadFromLocalStorage(DATA_KEY, {});

  if (!dashboardLayout) {
    dashboardLayout = [
      { id: genId(), type: 'todo' },
      { id: genId(), type: 'clock' },
      { id: genId(), type: 'note' },
    ];
    widgetData = {};
    saveState();
  }
}

export function saveState() {
  saveToLocalStorage(LAYOUT_KEY, dashboardLayout);
  saveToLocalStorage(DATA_KEY, widgetData);
}

export const debouncedSaveState = debounce(saveState, 500);

export function addWidget(type) {
  const id = genId();
  dashboardLayout.push({ id, type });
  saveState();
  return id;
}

export function removeWidget(id) {
  dashboardLayout = dashboardLayout.filter((w) => w.id !== id);
  delete widgetData[id];
  saveState();
}

export function updateWidgetData(widgetId, newData) {
  widgetData[widgetId] = newData;
  debouncedSaveState();
}

export function getWidgetDataById(widgetId) {
  return widgetData[widgetId] || null;
}

export function reorderLayout(newOrder) {
  const map = {};
  dashboardLayout.forEach((w) => (map[w.id] = w));
  dashboardLayout = newOrder.map((id) => map[id]).filter(Boolean);
  saveState();
}

function genId() {
  return 'w_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}
