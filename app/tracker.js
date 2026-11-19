// tracker.js — owns the earned set: loads and saves it in localStorage, and exports/imports it as JSON.
const STORAGE_KEY = 'leonida-ledger-progress-v1';
const EXPORT_VERSION = 1;

let earnedNames = new Set();
let onChange = () => {};

function readStoredNames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((v) => typeof v === 'string');
    if (parsed && Array.isArray(parsed.earned)) return parsed.earned.filter((v) => typeof v === 'string');
    return [];
  } catch {
    return [];
  }
}

function writeStoredNames() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: EXPORT_VERSION, earned: [...earnedNames] }));
  } catch {
    // Private-mode storage can refuse writes; the checklist still works for this visit.
  }
}

export function initTracker(validNames, changeHandler) {
  const valid = new Set(validNames);
  earnedNames = new Set(readStoredNames().filter((name) => valid.has(name)));
  onChange = typeof changeHandler === 'function' ? changeHandler : () => {};
  return earnedNames;
}

export function isEarned(name) {
  return earnedNames.has(name);
}

export function earnedNamesList() {
  return [...earnedNames];
}

export function earnedCount() {
  return earnedNames.size;
}

export function setEarned(name, value) {
  if (value) earnedNames.add(name);
  else earnedNames.delete(name);
  writeStoredNames();
  onChange();
}

export function toggleEarned(name) {
  setEarned(name, !earnedNames.has(name));
}

export function exportProgress(trophies) {
  const payload = {
    app: 'leonida-ledger',
    game: 'Grand Theft Auto VI',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    earned: trophies.filter((t) => earnedNames.has(t.name)).map((t) => t.name),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function namesFromImport(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.earned)) return parsed.earned;
  return null;
}

export async function importProgress(file, validNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = namesFromImport(parsed);
  if (!names) throw new Error('That file has no "earned" list.');
  const valid = new Set(validNames);
  const accepted = names.filter((name) => typeof name === 'string' && valid.has(name));
  earnedNames = new Set(accepted);
  writeStoredNames();
  onChange();
  return accepted.length;
}

export function clearProgress() {
  earnedNames = new Set();
  writeStoredNames();
  onChange();
}
