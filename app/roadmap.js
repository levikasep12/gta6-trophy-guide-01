// roadmap.js — renders the platinum roadmap stages and the cited platinum tips.
import { isEarned } from './tracker.js';

function sourceLinks(sources) {
  const list = document.createElement('ul');
  list.className = 'source-list';
  const label = document.createElement('li');
  label.className = 'source-label';
  label.textContent = 'Sources';
  list.append(label);
  for (const source of sources ?? []) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.rel = 'noreferrer';
    item.append(link);
    list.append(item);
  }
  return list;
}

function stageProgress(stage, byId) {
  const members = stage.trophies.map((id) => byId.get(id)).filter(Boolean);
  const done = members.filter((trophy) => isEarned(trophy.name)).length;
  return { done, total: members.length };
}

function buildStage(stage, byId, onPickTrophy) {
  const card = document.createElement('article');
  card.className = 'stage';

  const head = document.createElement('div');
  head.className = 'stage-head';

  const num = document.createElement('span');
  num.className = 'stage-num';
  num.textContent = String(stage.stage);

  const titleWrap = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'stage-title';
  title.textContent = stage.title;
  titleWrap.append(title);

  const progress = stageProgress(stage, byId);
  const window = document.createElement('span');
  window.className = 'stage-window';
  window.textContent = `${stage.window} · ${progress.done}/${progress.total}`;

  head.append(num, titleWrap, window);

  const summary = document.createElement('p');
  summary.className = 'stage-summary';
  summary.textContent = stage.summary;

  const pills = document.createElement('div');
  pills.className = 'stage-trophies';
  for (const id of stage.trophies) {
    const trophy = byId.get(id);
    if (!trophy) continue;
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'stage-pill';
    if (isEarned(trophy.name)) pill.classList.add('is-earned');

    const dot = document.createElement('span');
    dot.className = `pill-dot ${trophy.grade}`;
    pill.append(dot);

    const name = document.createElement('span');
    name.textContent = trophy.name;
    pill.append(name);

    if (trophy.missable) {
      const flag = document.createElement('span');
      flag.className = 'pill-missable';
      flag.textContent = '!';
      flag.title = 'Potentially missable';
      pill.append(flag);
    }

    pill.addEventListener('click', () => onPickTrophy(trophy));
    pills.append(pill);
  }

  const bar = document.createElement('div');
  bar.className = 'stage-progress';
  const fill = document.createElement('span');
  fill.style.width = progress.total ? `${Math.round((progress.done / progress.total) * 100)}%` : '0%';
  bar.append(fill);

  card.append(head, summary, pills, bar);
  return card;
}

export function renderRoadmap({ stages, tips, trophies, container, tipsContainer, onPickTrophy }) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  container.replaceChildren(...stages.map((stage) => buildStage(stage, byId, onPickTrophy)));

  tipsContainer.replaceChildren(
    ...tips.map((tip) => {
      const card = document.createElement('article');
      card.className = 'tip';
      const title = document.createElement('h3');
      title.textContent = tip.title;
      const text = document.createElement('p');
      text.textContent = tip.text;
      card.append(title, text, sourceLinks(tip.sources));
      return card;
    }),
  );
}
