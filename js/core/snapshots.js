// B5: Save favorite layouts (snapshots)
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';
import { getLayout, getWidgetData } from './state.js';
import { showToast } from '../utils/toast.js';

const SNAPSHOTS_KEY = 'spd_snapshots';

export function getSnapshots() {
  return loadFromLocalStorage(SNAPSHOTS_KEY, []);
}

export function saveSnapshot(name) {
  const snapshots = getSnapshots();
  const snapshot = {
    id: 's_' + Date.now().toString(36),
    name,
    layout: JSON.parse(JSON.stringify(getLayout())),
    widgetData: JSON.parse(JSON.stringify(getWidgetData())),
    createdAt: Date.now(),
  };
  snapshots.push(snapshot);
  saveToLocalStorage(SNAPSHOTS_KEY, snapshots);
  showToast(`Layout "${name}" saved`, 'success');
  return snapshot;
}

export function deleteSnapshot(id) {
  let snapshots = getSnapshots();
  snapshots = snapshots.filter((s) => s.id !== id);
  saveToLocalStorage(SNAPSHOTS_KEY, snapshots);
}

export function getSnapshotById(id) {
  return getSnapshots().find((s) => s.id === id) || null;
}
