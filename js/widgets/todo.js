import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';
import { sanitize } from '../utils/sanitize.js';

registerWidget('todo', {
  name: 'Todo List',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
  description: 'Track your tasks',
  defaultData: { items: [] },
  create: createTodo,
  destroy: () => {},
});

function createTodo(container, widgetId) {
  const data = getWidgetDataById(widgetId) || { items: [] };

  function save(items) {
    updateWidgetData(widgetId, { items });
  }

  function render() {
    container.innerHTML = '';
    const list = document.createElement('div');
    data.items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'todo-item' + (item.done ? ' done' : '');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = item.done;
      cb.className = 'todo-checkbox';
      cb.addEventListener('change', () => {
        data.items[idx].done = cb.checked;
        save(data.items);
        render();
      });

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = item.text;
      span.addEventListener('dblclick', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input';
        input.value = item.text;
        input.style.fontSize = '0.85rem';
        input.style.padding = '0.2rem 0.4rem';
        span.replaceWith(input);
        input.focus();
        const finish = () => {
          const val = input.value.trim();
          if (val) {
            data.items[idx].text = val;
            save(data.items);
          }
          render();
        };
        input.addEventListener('blur', finish);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') input.blur();
          if (e.key === 'Escape') { input.value = item.text; input.blur(); }
        });
      });

      const del = document.createElement('button');
      del.className = 'widget-close-btn';
      del.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      del.addEventListener('click', () => {
        data.items.splice(idx, 1);
        save(data.items);
        render();
      });

      row.append(cb, span, del);
      list.appendChild(row);
    });
    container.appendChild(list);

    const form = document.createElement('div');
    form.style.cssText = 'display:flex;gap:0.5rem;margin-top:0.5rem;';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input';
    input.placeholder = 'Add a task...';
    input.style.fontSize = '0.85rem';
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-sm';
    btn.textContent = 'Add';

    const addItem = () => {
      const val = input.value.trim();
      if (!val) return;
      data.items.push({ id: Date.now(), text: val, done: false });
      save(data.items);
      render();
    };

    btn.addEventListener('click', addItem);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem(); });
    form.append(input, btn);
    container.appendChild(form);
  }

  render();
}
