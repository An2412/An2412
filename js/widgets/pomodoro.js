import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';
import { showToast } from '../utils/toast.js';

const timers = {};

registerWidget('pomodoro', {
  name: 'Pomodoro Timer',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3L2 6"/><path d="M22 6l-3-3"/></svg>',
  description: 'Focus timer 25/5 min',
  defaultData: { work: 25, break: 5, sessions: 0 },
  create: createPomodoro,
  destroy: (id) => { clearInterval(timers[id]); delete timers[id]; },
});

function createPomodoro(container, widgetId) {
  const data = getWidgetDataById(widgetId) || { work: 25, break: 5, sessions: 0 };
  let seconds = data.work * 60;
  let running = false;
  let isBreak = false;

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  container.innerHTML = `
    <div id="pom-label-${widgetId}" style="text-align:center;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.25rem;">FOCUS</div>
    <div id="pom-display-${widgetId}" class="pomodoro-display">${fmt(seconds)}</div>
    <div style="text-align:center;margin-top:0.25rem;font-size:0.8rem;color:var(--text-secondary);">
      Sessions: <span id="pom-count-${widgetId}">${data.sessions}</span>
    </div>
    <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:0.75rem;">
      <button class="btn btn-primary btn-sm" id="pom-start-${widgetId}">Start</button>
      <button class="btn btn-sm" id="pom-reset-${widgetId}">Reset</button>
    </div>`;

  const displayEl = document.getElementById(`pom-display-${widgetId}`);
  const labelEl = document.getElementById(`pom-label-${widgetId}`);
  const countEl = document.getElementById(`pom-count-${widgetId}`);
  const startBtn = document.getElementById(`pom-start-${widgetId}`);
  const resetBtn = document.getElementById(`pom-reset-${widgetId}`);

  function tick() {
    if (seconds <= 0) {
      clearInterval(timers[widgetId]);
      running = false;
      startBtn.textContent = 'Start';
      if (!isBreak) {
        data.sessions++;
        updateWidgetData(widgetId, data);
        if (countEl) countEl.textContent = data.sessions;
        showToast('Focus session complete! Take a break.', 'success');
        isBreak = true;
        seconds = data.break * 60;
        if (labelEl) labelEl.textContent = 'BREAK';
      } else {
        showToast('Break over! Ready for next session.', 'info');
        isBreak = false;
        seconds = data.work * 60;
        if (labelEl) labelEl.textContent = 'FOCUS';
      }
      if (displayEl) displayEl.textContent = fmt(seconds);
      return;
    }
    seconds--;
    if (displayEl) displayEl.textContent = fmt(seconds);
  }

  startBtn.addEventListener('click', () => {
    if (running) {
      clearInterval(timers[widgetId]);
      running = false;
      startBtn.textContent = 'Start';
    } else {
      timers[widgetId] = setInterval(tick, 1000);
      running = true;
      startBtn.textContent = 'Pause';
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timers[widgetId]);
    running = false;
    isBreak = false;
    seconds = data.work * 60;
    startBtn.textContent = 'Start';
    if (displayEl) displayEl.textContent = fmt(seconds);
    if (labelEl) labelEl.textContent = 'FOCUS';
  });
}
