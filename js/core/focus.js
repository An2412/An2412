// B2: Focus mode (fullscreen widget on double-click)
let focusedWidgetId = null;

export function initFocusMode() {
  document.addEventListener('dblclick', (e) => {
    const widget = e.target.closest('.widget');
    if (!widget || e.target.closest('input, textarea, button, a, .calc-btn')) return;
    if (focusedWidgetId) {
      exitFocusMode();
    } else {
      enterFocusMode(widget);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && focusedWidgetId) {
      exitFocusMode();
    }
  });
}

function enterFocusMode(widget) {
  focusedWidgetId = widget.dataset.id;
  document.body.classList.add('focus-mode');
  widget.classList.add('widget-focused');

  // Add exit button
  const exitBtn = document.createElement('button');
  exitBtn.className = 'focus-exit-btn';
  exitBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> Exit Focus';
  exitBtn.addEventListener('click', exitFocusMode);
  widget.prepend(exitBtn);
}

function exitFocusMode() {
  focusedWidgetId = null;
  document.body.classList.remove('focus-mode');
  document.querySelectorAll('.widget-focused').forEach((w) => w.classList.remove('widget-focused'));
  document.querySelectorAll('.focus-exit-btn').forEach((b) => b.remove());
}

export function isFocusMode() { return !!focusedWidgetId; }
