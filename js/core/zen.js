// B4: Zen mode - minimal distraction-free view
let zenActive = false;

export function initZenMode() {
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'z' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
      toggleZenMode();
    }
  });
}

export function toggleZenMode() {
  zenActive = !zenActive;
  document.body.classList.toggle('zen-mode', zenActive);

  // Show/hide zen exit hint
  let hint = document.getElementById('zen-hint');
  if (zenActive && !hint) {
    hint = document.createElement('div');
    hint.id = 'zen-hint';
    hint.className = 'zen-hint';
    hint.textContent = 'Press Z to exit Zen mode';
    document.body.appendChild(hint);
    setTimeout(() => hint.classList.add('fade-out'), 2000);
    setTimeout(() => hint.remove(), 2500);
  } else if (!zenActive && hint) {
    hint.remove();
  }
  return zenActive;
}

export function isZenMode() { return zenActive; }
