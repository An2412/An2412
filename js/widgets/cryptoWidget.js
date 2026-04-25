import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';
import { fetchWithRetry } from '../utils/fetchRetry.js';
import { sanitize } from '../utils/sanitize.js';

const intervals = {};

registerWidget('crypto', {
  name: 'Crypto Prices',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
  description: 'Live crypto prices',
  defaultData: { coins: ['bitcoin', 'ethereum', 'solana'] },
  create: createCrypto,
  destroy: (id) => { clearInterval(intervals[id]); delete intervals[id]; },
});

function createCrypto(container, widgetId) {
  const data = getWidgetDataById(widgetId) || { coins: ['bitcoin', 'ethereum', 'solana'] };

  container.innerHTML = `
    <div id="crypto-list-${widgetId}" style="margin-bottom:0.5rem;">
      <div style="text-align:center;color:var(--text-secondary);font-size:0.85rem;">Loading prices...</div>
    </div>
    <div style="display:flex;gap:0.5rem;">
      <input type="text" class="input" id="crypto-add-${widgetId}" placeholder="Add coin (e.g. dogecoin)" style="font-size:0.85rem;">
      <button class="btn btn-primary btn-sm" id="crypto-add-btn-${widgetId}">Add</button>
    </div>`;

  async function fetchPrices() {
    const listEl = document.getElementById(`crypto-list-${widgetId}`);
    if (!listEl || data.coins.length === 0) {
      if (listEl) listEl.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:0.85rem;">No coins tracked</div>';
      return;
    }
    try {
      const ids = data.coins.join(',');
      const resp = await fetchWithRetry(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      listEl.innerHTML = '';
      data.coins.forEach((coin) => {
        const info = resp[coin];
        const row = document.createElement('div');
        row.className = 'crypto-row';
        const name = document.createElement('span');
        name.style.cssText = 'font-size:0.85rem;font-weight:500;text-transform:capitalize;';
        name.textContent = coin;
        const right = document.createElement('div');
        right.style.cssText = 'display:flex;align-items:center;gap:0.75rem;';
        if (info) {
          const price = document.createElement('span');
          price.style.cssText = 'font-size:0.85rem;font-weight:600;';
          price.textContent = `$${Number(info.usd).toLocaleString()}`;
          const change = document.createElement('span');
          const ch = info.usd_24h_change || 0;
          change.style.cssText = `font-size:0.75rem;color:${ch >= 0 ? 'var(--success)' : 'var(--danger)'};`;
          change.textContent = `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`;
          right.append(price, change);
        } else {
          const err = document.createElement('span');
          err.style.cssText = 'font-size:0.75rem;color:var(--text-secondary);';
          err.textContent = 'N/A';
          right.appendChild(err);
        }
        const del = document.createElement('button');
        del.className = 'widget-close-btn';
        del.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        del.addEventListener('click', () => {
          data.coins = data.coins.filter((c) => c !== coin);
          updateWidgetData(widgetId, data);
          fetchPrices();
        });
        right.appendChild(del);
        row.append(name, right);
        listEl.appendChild(row);
      });
    } catch {
      if (listEl) listEl.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:0.85rem;">Failed to fetch prices</div>';
    }
  }

  const addBtn = document.getElementById(`crypto-add-btn-${widgetId}`);
  const addInput = document.getElementById(`crypto-add-${widgetId}`);
  const addCoin = () => {
    const val = addInput.value.trim().toLowerCase();
    if (!val || data.coins.includes(val)) return;
    data.coins.push(val);
    updateWidgetData(widgetId, data);
    addInput.value = '';
    fetchPrices();
  };
  addBtn.addEventListener('click', addCoin);
  addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCoin(); });

  fetchPrices();
  intervals[widgetId] = setInterval(fetchPrices, 60000);
}
