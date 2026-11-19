// trophy-list.js — renders one trophy card: checkbox, official text, tags, grade, and the expandable cited guide.
import { isEarned, toggleEarned } from './tracker.js';
import { isSpoilerMasked } from './filters.js';

const KIND_LABELS = {
  story: 'Story',
  collectible: 'Collectible',
  activity: 'Activity',
  crime: 'Crime',
  challenge: 'Challenge',
  platinum: 'Platinum',
};

const openGuides = new Set();

function tag(text, extraClass) {
  const span = document.createElement('span');
  span.className = extraClass ? `tag ${extraClass}` : 'tag';
  span.textContent = text;
  return span;
}

function sourceList(sources) {
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

function maskedBody(trophy) {
  const wrap = document.createElement('div');
  const note = document.createElement('p');
  note.className = 'mask-note';
  note.textContent = 'Hidden story trophy — the name, description and guide stay masked until you tick it. Switch spoiler mode off to read it.';
  wrap.append(note);
  return wrap;
}

function guideBody(trophy) {
  const wrap = document.createElement('div');
  const text = document.createElement('p');
  text.className = 'guide-text';
  text.textContent = trophy.guide;
  wrap.append(text, sourceList(trophy.sources));
  return wrap;
}

function buildCard(trophy, rerender) {
  const card = document.createElement('article');
  card.className = `trophy grade-${trophy.grade}`;
  card.dataset.id = String(trophy.id);
  const masked = isSpoilerMasked(trophy);
  if (isEarned(trophy.name)) card.classList.add('is-earned');
  if (masked) card.classList.add('is-masked');

  const head = document.createElement('div');
  head.className = 'trophy-head';

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'check';
  check.checked = isEarned(trophy.name);
  check.setAttribute('aria-label', `Mark ${masked ? 'hidden story trophy' : trophy.name} as earned`);
  check.addEventListener('change', () => {
    toggleEarned(trophy.name);
    rerender();
  });

  const title = document.createElement('div');
  title.className = 'trophy-title';

  const nameRow = document.createElement('div');
  nameRow.className = 'trophy-name-row';
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = masked ? 'Hidden story trophy' : trophy.name;
  nameRow.append(name);
  title.append(nameRow);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = masked ? 'Description hidden until earned.' : trophy.description;
  title.append(desc);

  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  tags.append(tag(KIND_LABELS[trophy.kind] ?? trophy.kind, `kind-${trophy.kind}`));
  if (trophy.missable) tags.append(tag('Missable', 'flag-missable'));
  if (trophy.count) tags.append(tag(trophy.count, 'flag-count'));
  if (trophy.hidden) tags.append(tag('Hidden on PS5', 'flag-hidden'));
  title.append(tags);

  const side = document.createElement('div');
  side.className = 'trophy-side';
  const grade = document.createElement('span');
  grade.className = `grade-badge ${trophy.grade}`;
  grade.textContent = trophy.grade;
  side.append(grade);

  const isOpen = openGuides.has(trophy.id) && !masked;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'disclose';
  toggle.textContent = masked ? 'Guide masked' : isOpen ? 'Hide guide' : 'Guide';
  toggle.disabled = masked;
  toggle.setAttribute('aria-expanded', String(isOpen));
  side.append(toggle);

  head.append(check, title, side);

  const body = document.createElement('div');
  body.className = 'trophy-body';
  body.hidden = !isOpen;
  body.append(masked ? maskedBody(trophy) : guideBody(trophy));

  toggle.addEventListener('click', () => {
    if (openGuides.has(trophy.id)) openGuides.delete(trophy.id);
    else openGuides.add(trophy.id);
    rerender();
  });

  card.append(head, body);
  return card;
}

export function renderTrophyList(trophies, container, rerender) {
  container.replaceChildren(...trophies.map((trophy) => buildCard(trophy, rerender)));
}

export function openGuide(id) {
  openGuides.add(id);
}

export function closeAllGuides() {
  openGuides.clear();
}
