import { loadFromLocalStorage, saveToLocalStorage } from './storage.js';
import { showToast } from '../utils/toast.js';

const AUTH_KEY = 'spd_auth';
const API_URL_KEY = 'spd_api_url';

export function getApiUrl() {
  return loadFromLocalStorage(API_URL_KEY, '');
}

export function setApiUrl(url) {
  saveToLocalStorage(API_URL_KEY, url);
}

export function getAuth() {
  return loadFromLocalStorage(AUTH_KEY, null);
}

export function setAuth(auth) {
  saveToLocalStorage(AUTH_KEY, auth);
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn() {
  return !!getAuth()?.token;
}

function apiHeaders() {
  const auth = getAuth();
  const headers = { 'Content-Type': 'application/json' };
  if (auth?.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }
  return headers;
}

export async function apiRegister(email, password) {
  const base = getApiUrl();
  if (!base) throw new Error('API URL not configured');
  const res = await fetch(`${base}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function apiLogin(email, password) {
  const base = getApiUrl();
  if (!base) throw new Error('API URL not configured');
  const res = await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setAuth(data);
  return data;
}

export async function apiGetSync() {
  const base = getApiUrl();
  if (!base || !isLoggedIn()) return null;
  try {
    const res = await fetch(`${base}/api/sync`, { headers: apiHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiPostSync(layout, widgetData) {
  const base = getApiUrl();
  if (!base || !isLoggedIn()) return;
  try {
    await fetch(`${base}/api/sync`, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ layout, widgetData }),
    });
  } catch (e) {
    console.warn('Sync failed:', e.message);
  }
}

export async function apiDeleteUser() {
  const base = getApiUrl();
  if (!base || !isLoggedIn()) return;
  const res = await fetch(`${base}/api/user`, {
    method: 'DELETE',
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error('Delete failed');
  clearAuth();
}

let ws = null;

export function connectWebSocket(onSyncReceived) {
  const base = getApiUrl();
  const auth = getAuth();
  if (!base || !auth?.token) return;

  const wsUrl = base.replace(/^http/, 'ws') + `/ws?token=${auth.token}`;
  ws = new WebSocket(wsUrl);

  ws.onopen = () => console.log('WebSocket connected');
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onSyncReceived) onSyncReceived(data);
    } catch {}
  };
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    setTimeout(() => connectWebSocket(onSyncReceived), 5000);
  };
  ws.onerror = () => ws.close();
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
