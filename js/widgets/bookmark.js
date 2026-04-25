import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';
import { sanitize } from '../utils/sanitize.js';

registerWidget('bookmark', {
  name: 'Bookmarks',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>',
  description: 'Save useful links',
  defaultData: { items: [] },
  create: createBookmark,
  destroy: () => {},
});

function createBookmark(container, widgetId) {
  const data = getWidgetDataById(widgetId) || { items: [] };

  function save() { updateWidgetData(widgetId, { items: data.items }); }

  function render() {
    container.innerHTML = '';
    const list = document.createElement('div');

    data.items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'bookmark-item';

      const favicon = document.createElement('img');
      favicon.width = 16;
      favicon.height = 16;
      favicon.style.flexShrink = '0';
      try {
        const urlObj = new URL(item.url);
        favicon.src = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
      } catch {
        favicon.src = '';
      }
      favicon.onerror = () => { favicon.style.display = 'none'; };

      const link = document.createElement('a');
      link.className = 'bookmark-link';
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = item.title || item.url;

      const del = document.createElement('button');
      del.className = 'widget-close-btn';
      del.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      del.addEventListener('click', () => {
        data.items.splice(idx, 1);
        save();
        render();
      });

      row.append(favicon, link, del);
      list.appendChild(row);
    });
    container.appendChild(list);

    const form = document.createElement('div');
    form.style.cssText = 'display:flex;flex-direction:column;gap:0.4rem;margin-top:0.5rem;';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'input';
    titleInput.placeholder = 'Title';
    titleInput.style.fontSize = '0.85rem';
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'input';
    urlInput.placeholder = 'https://...';
    urlInput.style.fontSize = '0.85rem';
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-sm';
    btn.textContent = 'Add Bookmark';

    const addItem = () => {
      const url = urlInput.value.trim();
      if (!url) return;
      let finalUrl = url;
      if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
      data.items.push({ title: titleInput.value.trim() || finalUrl, url: finalUrl });
      save();
      render();
    };

    btn.addEventListener('click', addItem);
    urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem(); });
    form.append(titleInput, urlInput, btn);
    container.appendChild(form);
  }

  render();
}
