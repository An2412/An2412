import { showToast } from './toast.js';

export async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) {
        showToast(`Network error: ${err.message}`, 'error');
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
