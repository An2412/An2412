import { registerWidget } from '../core/registry.js';

const intervals = {};

registerWidget('clock', {
  name: 'Clock',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  description: 'Current time & date',
  defaultData: {},
  create: createClock,
  destroy: (id) => { clearInterval(intervals[id]); delete intervals[id]; },
});

function createClock(container, widgetId) {
  container.innerHTML = `
    <div style="text-align:center;">
      <div id="clock-time-${widgetId}" style="font-size:2.5rem;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:1px;"></div>
      <div id="clock-date-${widgetId}" style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.25rem;"></div>
    </div>`;

  function tick() {
    const now = new Date();
    const timeEl = document.getElementById(`clock-time-${widgetId}`);
    const dateEl = document.getElementById(`clock-date-${widgetId}`);
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
    if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  tick();
  intervals[widgetId] = setInterval(tick, 1000);
}
