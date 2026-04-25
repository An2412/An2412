// B1: Sidebar groups (drag-drop to create groups)
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';
import { getLayout, reorderLayout } from './state.js';
import { renderDashboard } from './grid.js';

const GROUPS_KEY = 'spd_groups';
const ACTIVE_GROUP_KEY = 'spd_active_group';

const DEFAULT_GROUPS = [
  { id: 'all', name: 'All', icon: '⊞' },
  { id: 'work', name: 'Work', icon: '💼' },
  { id: 'personal', name: 'Personal', icon: '🏠' },
  { id: 'health', name: 'Health', icon: '❤️' },
  { id: 'tools', name: 'Tools', icon: '🔧' },
];

let groups = [];
let activeGroup = 'all';
let widgetGroupMap = {};
const WIDGET_GROUP_KEY = 'spd_widget_groups';

export function initSidebar() {
  groups = loadFromLocalStorage(GROUPS_KEY, DEFAULT_GROUPS);
  activeGroup = loadFromLocalStorage(ACTIVE_GROUP_KEY, 'all');
  widgetGroupMap = loadFromLocalStorage(WIDGET_GROUP_KEY, {});
  renderSidebar();
}

export function getActiveGroup() { return activeGroup; }

export function getWidgetGroup(widgetId) {
  return widgetGroupMap[widgetId] || 'all';
}

export function setWidgetGroup(widgetId, groupId) {
  widgetGroupMap[widgetId] = groupId;
  saveToLocalStorage(WIDGET_GROUP_KEY, widgetGroupMap);
}

export function getFilteredLayout() {
  if (activeGroup === 'all') return getLayout();
  return getLayout().filter((w) => (widgetGroupMap[w.id] || 'all') === activeGroup || !widgetGroupMap[w.id]);
}

export function getGroups() { return groups; }

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = '';

  // Groups list
  const list = document.createElement('div');
  list.className = 'sidebar-groups';

  groups.forEach((g) => {
    const item = document.createElement('button');
    item.className = 'sidebar-group-btn' + (activeGroup === g.id ? ' active' : '');
    item.dataset.groupId = g.id;
    item.innerHTML = `<span class="sidebar-group-icon">${g.icon}</span><span class="sidebar-group-name">${g.name}</span>`;
    item.addEventListener('click', () => {
      activeGroup = g.id;
      saveToLocalStorage(ACTIVE_GROUP_KEY, activeGroup);
      renderSidebar();
      renderDashboard();
    });

    // Allow dropping widgets into groups
    item.addEventListener('dragover', (e) => { e.preventDefault(); item.classList.add('drag-over'); });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const widgetId = e.dataTransfer.getData('text/widget-id');
      if (widgetId) {
        setWidgetGroup(widgetId, g.id);
        renderDashboard();
      }
    });

    list.appendChild(item);
  });

  sidebar.appendChild(list);

  // Add group button
  const addBtn = document.createElement('button');
  addBtn.className = 'sidebar-add-group';
  addBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Group';
  addBtn.addEventListener('click', () => {
    const name = prompt('Group name:');
    if (!name) return;
    const icon = prompt('Emoji icon:', '📁') || '📁';
    const id = 'g_' + Date.now().toString(36);
    groups.push({ id, name, icon });
    saveToLocalStorage(GROUPS_KEY, groups);
    renderSidebar();
  });
  sidebar.appendChild(addBtn);
}

export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.app-layout');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  if (main) main.classList.toggle('sidebar-collapsed');
}
