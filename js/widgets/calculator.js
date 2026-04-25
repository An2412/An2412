import { registerWidget } from '../core/registry.js';
import { sanitize } from '../utils/sanitize.js';

registerWidget('calculator', {
  name: 'Calculator',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="16" y2="18"/></svg>',
  description: 'Basic calculator',
  defaultData: {},
  create: createCalculator,
  destroy: () => {},
});

function createCalculator(container) {
  let display = '0';
  let prev = null;
  let op = null;
  let reset = false;

  const screenEl = document.createElement('div');
  screenEl.className = 'input';
  screenEl.style.cssText = 'text-align:right;font-size:1.5rem;font-weight:600;margin-bottom:0.5rem;min-height:2.5rem;display:flex;align-items:center;justify-content:flex-end;font-variant-numeric:tabular-nums;';
  screenEl.textContent = display;
  container.appendChild(screenEl);

  const grid = document.createElement('div');
  grid.className = 'calc-grid';
  container.appendChild(grid);

  const buttons = [
    { label: 'C', cls: '' }, { label: '+/-', cls: '' }, { label: '%', cls: '' }, { label: '/', cls: 'accent' },
    { label: '7', cls: '' }, { label: '8', cls: '' }, { label: '9', cls: '' }, { label: '*', cls: 'accent' },
    { label: '4', cls: '' }, { label: '5', cls: '' }, { label: '6', cls: '' }, { label: '-', cls: 'accent' },
    { label: '1', cls: '' }, { label: '2', cls: '' }, { label: '3', cls: '' }, { label: '+', cls: 'accent' },
    { label: '0', cls: 'span-2' }, { label: '.', cls: '' }, { label: '=', cls: 'accent' },
  ];

  buttons.forEach((b) => {
    const btn = document.createElement('button');
    btn.className = 'calc-btn' + (b.cls ? ' ' + b.cls : '');
    btn.textContent = b.label;
    btn.addEventListener('click', () => handlePress(b.label));
    grid.appendChild(btn);
  });

  function updateScreen() {
    screenEl.textContent = display.length > 12 ? display.slice(0, 12) : display;
  }

  function handlePress(key) {
    if (key >= '0' && key <= '9') {
      if (reset || display === '0') { display = key; reset = false; }
      else display += key;
    } else if (key === '.') {
      if (reset) { display = '0.'; reset = false; }
      else if (!display.includes('.')) display += '.';
    } else if (key === 'C') {
      display = '0'; prev = null; op = null; reset = false;
    } else if (key === '+/-') {
      display = String(-parseFloat(display));
    } else if (key === '%') {
      display = String(parseFloat(display) / 100);
    } else if (['+', '-', '*', '/'].includes(key)) {
      if (prev !== null && op && !reset) {
        display = String(calc(prev, parseFloat(display), op));
      }
      prev = parseFloat(display);
      op = key;
      reset = true;
    } else if (key === '=') {
      if (prev !== null && op) {
        display = String(calc(prev, parseFloat(display), op));
        prev = null;
        op = null;
        reset = true;
      }
    }
    updateScreen();
  }

  function calc(a, b, operator) {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 'Error';
      default: return b;
    }
  }
}
