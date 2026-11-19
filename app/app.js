// app.js — boots the guide: loads trophies.json, wires the controls, and re-renders the checklist and roadmap.
import { initTracker, isEarned, exportProgress, importProgress } from './tracker.js';
import {
  kindFilters,
  countForKind,
  getFilterState,
  setKind,
  setGrade,
  setSearch,
  setShowEarned,
  setShowMissing,
  setSpoilerMode,
  visibleTrophies,
  activeFilterNote,
} from './filters.js';
import { renderRoadmap } from './roadmap.js';
import { renderTrophyList, openGuide } from './trophy-list.js';

const els = {
  earnedCount: document.getElementById('earned-count'),
  platinumPct: document.getElementById('platinum-pct'),
  progressBar: document.getElementById('progress-bar'),
  progressFill: document.getElementById('progress-fill'),
  gradeTally: document.getElementById('grade-tally'),
  kindFilters: document.getElementById('kind-filters'),
  gradeFilter: document.getElementById('grade-filter'),
  search: document.getElementById('search-input'),
  showEarned: document.getElementById('show-earned'),
  showMissing: document.getElementById('show-missing'),
  spoiler: document.getElementById('spoiler-toggle'),
  resultCount: document.getElementById('result-count'),
  filterNote: document.getElementById('filter-note'),
  list: document.getElementById('trophy-list'),
  empty: document.getElementById('empty-state'),
  roadmapStages: document.getElementById('roadmap-stages'),
  platinumTips: document.getElementById('platinum-tips'),
  exportButton: document.getElementById('export-button'),
  importInput: document.getElementById('import-input'),
  checklistView: document.getElementById('checklist-view'),
  roadmapView: document.getElementById('roadmap-view'),
};

const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
let data = { trophies: [], roadmap: [], meta: { tips: [] } };

function renderTally() {
  const total = data.trophies.length;
  const earned = data.trophies.filter((t) => isTicked(t)).length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  els.earnedCount.textContent = `${earned} / ${total}`;
  els.platinumPct.textContent = `${pct}% to platinum`;
  els.progressFill.style.width = `${pct}%`;
  els.progressBar.setAttribute('aria-valuenow', String(earned));

  els.gradeTally.replaceChildren(
    ...GRADES.map((grade) => {
      const all = data.trophies.filter((t) => t.grade === grade);
      const done = all.filter((t) => isTicked(t)).length;
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = `dot ${grade}`;
      const label = document.createElement('span');
      label.textContent = `${grade} ${done}/${all.length}`;
      li.append(dot, label);
      return li;
    }),
  );
}

function isTicked(trophy) {
  return isEarned(trophy.name);
}

function renderKindChips() {
  const current = getFilterState().kind;
  els.kindFilters.replaceChildren(
    ...kindFilters().map((filter) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.setAttribute('aria-pressed', String(filter.id === current));
      button.append(document.createTextNode(filter.label));
      const count = document.createElement('span');
      count.className = 'chip-count';
      count.textContent = String(countForKind(filter.id, data.trophies));
      button.append(count);
      button.addEventListener('click', () => {
        setKind(filter.id);
        render();
      });
      return button;
    }),
  );
}

function render() {
  renderTally();
  renderKindChips();

  const visible = visibleTrophies(data.trophies);
  renderTrophyList(visible, els.list, render);
  els.resultCount.textContent = `${visible.length} of ${data.trophies.length} trophies`;
  els.filterNote.textContent = activeFilterNote();
  els.empty.hidden = visible.length > 0;

  renderRoadmap({
    stages: data.roadmap,
    tips: data.meta?.tips ?? [],
    trophies: data.trophies,
    container: els.roadmapStages,
    tipsContainer: els.platinumTips,
    onPickTrophy: (trophy) => {
      showView('checklist');
      openGuide(trophy.id);
      setKind('all');
      setSearch('');
      els.search.value = '';
      render();
      const card = els.list.querySelector(`[data-id="${trophy.id}"]`);
      if (card) card.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
  });
}

function showView(view) {
  const isRoadmap = view === 'roadmap';
  els.checklistView.hidden = isRoadmap;
  els.roadmapView.hidden = !isRoadmap;
  for (const tab of document.querySelectorAll('.tab')) {
    const active = tab.dataset.view === view;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-pressed', String(active));
  }
}

function wireControls() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }

  els.gradeFilter.addEventListener('change', () => {
    setGrade(els.gradeFilter.value);
    render();
  });

  let searchTimer = 0;
  els.search.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      setSearch(els.search.value);
      render();
    }, 120);
  });

  els.showEarned.addEventListener('change', () => {
    setShowEarned(els.showEarned.checked);
    render();
  });
  els.showMissing.addEventListener('change', () => {
    setShowMissing(els.showMissing.checked);
    render();
  });
  els.spoiler.addEventListener('change', () => {
    setSpoilerMode(els.spoiler.checked);
    render();
  });

  els.exportButton.addEventListener('click', () => exportProgress(data.trophies));

  els.importInput.addEventListener('change', async () => {
    const file = els.importInput.files?.[0];
    if (!file) return;
    try {
      await importProgress(file, data.trophies.map((t) => t.name));
      render();
    } catch (error) {
      window.alert(`Import failed: ${error.message}`);
    } finally {
      els.importInput.value = '';
    }
  });
}

async function boot() {
  const response = await fetch('data/trophies.json');
  data = await response.json();
  initTracker(data.trophies.map((t) => t.name), render);
  wireControls();
  render();
}

boot().catch((error) => {
  els.list.textContent = `Could not load the trophy data: ${error.message}`;
});
