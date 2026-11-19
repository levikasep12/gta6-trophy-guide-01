// filters.js — owns the filter state (kind, grade, search, show earned/missing) and the spoiler rule.
import { isEarned } from './tracker.js';

const KIND_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'activity', label: 'Activities' },
  { id: 'crime', label: 'Crime' },
];

let state = {
  kinds: new Set(['all']),
  grade: 'all',
  search: '',
  showEarned: true,
  showMissing: true,
  spoilerMode: false,
};

export function getFilterState() {
  return state;
}

export function kindFilters() {
  return KIND_FILTERS;
}

export function activeKinds() {
  return state.kinds;
}

// Kind chips compose: picking Story then Missable shows both groups, and All clears the rest.
export function toggleKind(kind) {
  const next = new Set(state.kinds);
  if (kind === 'all') {
    state = { ...state, kinds: new Set(['all']) };
    return;
  }
  next.delete('all');
  if (next.has(kind)) next.delete(kind);
  else next.add(kind);
  state = { ...state, kinds: next.size ? next : new Set(['all']) };
}

export function setSingleKind(kind) {
  state = { ...state, kinds: kind === 'all' ? new Set(['all']) : new Set([kind]) };
}

export function clearFilters() {
  state = { ...state, kinds: new Set(['all']), grade: 'all', search: '', showEarned: true, showMissing: true };
}

export function hasActiveFilters() {
  return (
    !state.kinds.has('all') ||
    state.grade !== 'all' ||
    Boolean(state.search) ||
    !state.showEarned ||
    !state.showMissing
  );
}

export function setGrade(grade) {
  state = { ...state, grade };
}

export function setSearch(search) {
  state = { ...state, search: search.trim().toLowerCase() };
}

export function setShowEarned(show) {
  state = { ...state, showEarned: show };
}

export function setShowMissing(show) {
  state = { ...state, showMissing: show };
}

export function setSpoilerMode(on) {
  state = { ...state, spoilerMode: Boolean(on) };
}

export function countForKind(kind, trophies) {
  if (kind === 'all') return trophies.length;
  if (kind === 'missable') return trophies.filter((t) => t.missable).length;
  return trophies.filter((t) => t.kind === kind).length;
}

function matchesKind(trophy, kinds) {
  if (kinds.has('all')) return true;
  for (const kind of kinds) {
    if (kind === 'missable' && trophy.missable === true) return true;
    if (kind === trophy.kind) return true;
  }
  return false;
}

function matchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

function matchesSearch(trophy, search) {
  if (!search) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind, trophy.grade, trophy.count ?? '']
    .join(' ')
    .toLowerCase();
  return haystack.includes(search);
}

function matchesEarnedToggle(trophy) {
  const earned = isEarned(trophy.name);
  if (earned && !state.showEarned) return false;
  if (!earned && !state.showMissing) return false;
  return true;
}

export function visibleTrophies(trophies) {
  return trophies.filter(
    (trophy) =>
      matchesKind(trophy, state.kinds) &&
      matchesGrade(trophy, state.grade) &&
      matchesSearch(trophy, state.search) &&
      matchesEarnedToggle(trophy),
  );
}

// A story trophy is masked in spoiler mode until it is earned; every other trophy always shows its text.
export function isSpoilerMasked(trophy) {
  return state.spoilerMode && trophy.kind === 'story' && !isEarned(trophy.name);
}

export function activeFilterNote() {
  const notes = [];
  if (!state.kinds.has('all')) notes.push(`kind: ${[...state.kinds].join(' + ')}`);
  if (state.grade !== 'all') notes.push(`grade: ${state.grade}`);
  if (state.search) notes.push(`search: “${state.search}”`);
  if (!state.showEarned) notes.push('earned hidden');
  if (!state.showMissing) notes.push('missing hidden');
  if (state.spoilerMode) notes.push('spoiler mode');
  return notes.join(' · ');
}
