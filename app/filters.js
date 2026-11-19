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
  kind: 'all',
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

export function setKind(kind) {
  state = { ...state, kind };
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

function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kind === kind;
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
      matchesKind(trophy, state.kind) &&
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
  if (state.kind !== 'all') notes.push(`kind: ${state.kind}`);
  if (state.grade !== 'all') notes.push(`grade: ${state.grade}`);
  if (state.search) notes.push(`search: “${state.search}”`);
  if (!state.showEarned) notes.push('earned hidden');
  if (!state.showMissing) notes.push('missing hidden');
  if (state.spoilerMode) notes.push('spoiler mode');
  return notes.join(' · ');
}
