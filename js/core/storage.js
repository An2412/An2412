import { showToast } from '../utils/toast.js';
import { encryptData, decryptData } from '../utils/crypto.js';

let encryptionPassword = null;

export function setEncryptionPassword(pw) { encryptionPassword = pw; }
export function getEncryptionPassword() { return encryptionPassword; }
export function isEncryptionEnabled() { return localStorage.getItem('spd_encrypted') === 'true'; }
export function setEncryptionEnabled(v) { localStorage.setItem('spd_encrypted', v ? 'true' : 'false'); }

export function saveToLocalStorage(key, value) {
  try {
    const json = JSON.stringify(value);
    const quota = estimateQuota();
    if (quota && json.length > quota * 0.9) {
      showToast('Storage nearly full!', 'warning');
    }
    localStorage.setItem(key, json);
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showToast('Storage full! Data not saved.', 'error');
    } else {
      showToast('Save error: ' + e.message, 'error');
    }
  }
}

export function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export async function saveEncrypted(key, value) {
  if (!encryptionPassword) return saveToLocalStorage(key, value);
  try {
    const json = JSON.stringify(value);
    const enc = await encryptData(json, encryptionPassword);
    localStorage.setItem(key, enc);
  } catch (e) {
    showToast('Encryption save error: ' + e.message, 'error');
  }
}

export async function loadEncrypted(key, defaultValue = null) {
  if (!encryptionPassword) return loadFromLocalStorage(key, defaultValue);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    const json = await decryptData(raw, encryptionPassword);
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

function estimateQuota() {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      total += k.length + localStorage.getItem(k).length;
    }
    return 5 * 1024 * 1024 - total;
  } catch {
    return null;
  }
}
