import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';
import { sanitize } from '../utils/sanitize.js';
import { showToast } from '../utils/toast.js';
import { loadFromLocalStorage, saveToLocalStorage } from '../core/storage.js';

registerWidget('aichat', {
  name: 'AI Chat',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  description: 'Chat with AI assistant',
  defaultData: { messages: [] },
  create: createAIChat,
  destroy: () => {},
});

function createAIChat(container, widgetId) {
  const data = getWidgetDataById(widgetId) || { messages: [] };
  const API_KEY_STORAGE = 'spd_openai_key';

  container.innerHTML = `
    <div class="chat-messages" id="chat-msgs-${widgetId}"></div>
    <div style="display:flex;gap:0.5rem;">
      <input type="text" class="input" id="chat-input-${widgetId}" placeholder="Type a message..." style="font-size:0.85rem;">
      <button class="btn btn-primary btn-sm" id="chat-send-${widgetId}">Send</button>
    </div>
    <div style="margin-top:0.5rem;">
      <button class="btn btn-sm" id="chat-settings-${widgetId}" style="font-size:0.75rem;">API Key Settings</button>
      <button class="btn btn-sm btn-danger" id="chat-clear-${widgetId}" style="font-size:0.75rem;">Clear Chat</button>
    </div>`;

  const msgsEl = document.getElementById(`chat-msgs-${widgetId}`);
  const inputEl = document.getElementById(`chat-input-${widgetId}`);
  const sendBtn = document.getElementById(`chat-send-${widgetId}`);
  const settingsBtn = document.getElementById(`chat-settings-${widgetId}`);
  const clearBtn = document.getElementById(`chat-clear-${widgetId}`);

  function renderMessages() {
    msgsEl.innerHTML = '';
    if (data.messages.length === 0) {
      msgsEl.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:0.8rem;padding:1rem;">No messages yet. Set your OpenAI API key and start chatting!</div>';
      return;
    }
    data.messages.forEach((msg) => {
      const div = document.createElement('div');
      div.className = `chat-msg ${msg.role === 'user' ? 'user' : 'assistant'}`;
      div.textContent = msg.content;
      msgsEl.appendChild(div);
    });
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    const apiKey = loadFromLocalStorage(API_KEY_STORAGE, '');
    if (!apiKey) {
      showToast('Please set your OpenAI API key first', 'warning');
      return;
    }

    data.messages.push({ role: 'user', content: text });
    updateWidgetData(widgetId, data);
    inputEl.value = '';
    renderMessages();

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 500,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const reply = json.choices?.[0]?.message?.content || 'No response';
      data.messages.push({ role: 'assistant', content: reply });
      updateWidgetData(widgetId, data);
      renderMessages();
    } catch (e) {
      showToast(`AI error: ${e.message}`, 'error');
      data.messages.push({ role: 'assistant', content: `Error: ${e.message}` });
      updateWidgetData(widgetId, data);
      renderMessages();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  settingsBtn.addEventListener('click', () => {
    const currentKey = loadFromLocalStorage(API_KEY_STORAGE, '');
    const newKey = prompt('Enter your OpenAI API key:', currentKey);
    if (newKey !== null) {
      saveToLocalStorage(API_KEY_STORAGE, newKey);
      showToast('API key saved', 'success');
    }
  });

  clearBtn.addEventListener('click', () => {
    data.messages = [];
    updateWidgetData(widgetId, data);
    renderMessages();
  });

  renderMessages();
}
