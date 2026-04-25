import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';
import { sanitize } from '../utils/sanitize.js';
import { fireConfetti } from '../effects/confetti.js';
import { playComplete } from '../effects/sound.js';

registerWidget('habit', {
  name: 'Habit Tracker',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  description: 'Track daily habits',
  defaultData: { habits: [] },
  create: createHabit,
  destroy: () => {},
});

function createHabit(container, widgetId) {
  const data = getWidgetDataById(widgetId) || { habits: [] };
  const DAYS = 7;

  function save() { updateWidgetData(widgetId, { habits: data.habits }); }

  function todayKey() { return new Date().toISOString().slice(0, 10); }

  function last7Days() {
    const days = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  function render() {
    container.innerHTML = '';
    const days = last7Days();
    const dayLabels = document.createElement('div');
    dayLabels.style.cssText = 'display:flex;justify-content:flex-end;gap:3px;margin-bottom:0.25rem;padding-right:28px;';
    days.forEach((d) => {
      const lbl = document.createElement('span');
      lbl.style.cssText = 'width:14px;text-align:center;font-size:0.6rem;color:var(--text-secondary);';
      lbl.textContent = new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' });
      dayLabels.appendChild(lbl);
    });
    container.appendChild(dayLabels);

    data.habits.forEach((habit, hIdx) => {
      const row = document.createElement('div');
      row.className = 'habit-item';
      const name = document.createElement('span');
      name.style.cssText = 'font-size:0.85rem;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      name.textContent = habit.name;
      row.appendChild(name);

      const dots = document.createElement('div');
      dots.className = 'habit-dots';
      days.forEach((day) => {
        const dot = document.createElement('button');
        dot.className = 'habit-dot' + ((habit.log || []).includes(day) ? ' filled' : '');
        dot.title = day;
        dot.addEventListener('click', () => {
          if (!habit.log) habit.log = [];
          const idx = habit.log.indexOf(day);
          if (idx >= 0) {
            habit.log.splice(idx, 1);
          } else {
            habit.log.push(day);
            fireConfetti(dot);
            playComplete();
          }
          save();
          render();
        });
        dots.appendChild(dot);
      });
      row.appendChild(dots);

      const del = document.createElement('button');
      del.className = 'widget-close-btn';
      del.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      del.addEventListener('click', () => {
        data.habits.splice(hIdx, 1);
        save();
        render();
      });
      row.appendChild(del);
      container.appendChild(row);
    });

    const form = document.createElement('div');
    form.style.cssText = 'display:flex;gap:0.5rem;margin-top:0.5rem;';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input';
    input.placeholder = 'New habit...';
    input.style.fontSize = '0.85rem';
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-sm';
    btn.textContent = 'Add';
    const addHabit = () => {
      const val = input.value.trim();
      if (!val) return;
      data.habits.push({ name: val, log: [] });
      save();
      render();
    };
    btn.addEventListener('click', addHabit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addHabit(); });
    form.append(input, btn);
    container.appendChild(form);
  }

  render();
}
