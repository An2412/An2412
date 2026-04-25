import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';
import { debounce } from '../utils/debounce.js';

registerWidget('note', {
  name: 'Quick Note',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  description: 'Jot down quick notes',
  defaultData: { text: '' },
  create: createNote,
  destroy: () => {},
});

function createNote(container, widgetId) {
  const data = getWidgetDataById(widgetId) || { text: '' };

  const debouncedSave = debounce((text) => {
    updateWidgetData(widgetId, { text });
  }, 500);

  const textarea = document.createElement('textarea');
  textarea.className = 'input';
  textarea.placeholder = 'Type your notes here...';
  textarea.value = data.text;
  textarea.style.minHeight = '120px';

  textarea.addEventListener('input', () => {
    debouncedSave(textarea.value);
  });

  container.appendChild(textarea);
}
