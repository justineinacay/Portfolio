'use strict';

const assetPath = 'assets/jl-game/';
const get = (id) => document.getElementById(id);
const modal = get('chapterModal');
const player = get('player');
const sprite = get('playerSprite');
const viewport = get('worldViewport');
const visit = get('visitLocation');
const nameInput = get('playerName');

const chapters = {
  about: {
    name: 'About me',
    symbol: '◆',
    building: 'JL Headquarters',
    intro: 'I’m Justine Inacay, a marketing and growth strategist based in Metro Manila.',
    points: [
      'My work spans corporate marketing leadership and independent consulting for local and international clients.',
      'I bring performance marketing, brand strategy, and creative execution into the same plan.',
    ],
    links: [['About Justine', 'about.html'], ['View résumé', 'assets/Justine_Inacay_Resume.pdf']],
  },
  skills: {
    name: 'Skills',
    symbol: '⚙',
    building: 'Strategy Workshop',
    intro: 'See how I connect audience research and creative strategy with the work of acquiring and converting leads.',
    points: [
      'For international B2B clients, I worked on audience targeting, ad creative, landing-page messaging, and sales follow-up.',
      'My practice includes brand positioning, campaign planning, performance reporting, and CRM workflows.',
    ],
    links: [['View marketing expertise', 'index.html#expertise'], ['Read the lead generation case', 'case-studies/lead-generation.html']],
    expression: 'thinking',
  },
  experience: {
    name: 'Experience',
    symbol: '▤',
    building: 'Experience Library',
    intro: 'See the marketing teams I led and the work I owned across automotive, recruitment, and consulting.',
    points: [
      'At Autohub Group, I coordinated dealership campaigns, regional activations, and vendors for Suzuki and MG.',
      'At W. Bridges Manpower, I led recruitment marketing, employer branding, and creative work.',
    ],
    links: [['View career timeline', 'experience.html'], ['View résumé', 'assets/Justine_Inacay_Resume.pdf']],
  },
  projects: {
    name: 'Projects',
    symbol: '▣',
    building: 'Creative Gallery',
    intro: 'Browse the marketing campaigns and creative projects I’ve worked on, from international acquisition to local restaurant promotions.',
    points: [
      'For Chainsmoker BBQ and Sweet Heart Café, I worked on menu positioning, delivery-platform discovery, and local campaigns.',
      'The creative gallery includes selected campaign assets, social content, event materials, and branding work.',
    ],
    links: [['Browse campaign work', 'work.html#selected-cases'], ['See the creative gallery', 'work.html#featured-creative'], ['View independent projects', 'products.html']],
  },
  tools: {
    name: 'Tools',
    symbol: '⚒',
    building: 'Tools Lab',
    intro: 'The tools I use for campaigns, measurement, lead follow-up, and creative production.',
    points: [
      'I work with Meta Ads Manager, Google Ads, GA4, and Search Console for campaign delivery and measurement.',
      'I use HubSpot and Zapier for lead routing, plus Canva and WordPress for creative and landing-page production.',
    ],
    links: [['View the tool kit', 'index.html#toolkit'], ['See a CRM workflow in context', 'case-studies/lead-generation.html']],
    expression: 'thinking',
  },
  achievements: {
    name: 'Achievements',
    symbol: '★',
    building: 'Achievement Hall',
    intro: 'These outcomes are reported in my résumé. Each case study explains my contribution and the context for its figures.',
    points: [
      'International lead generation: 40–60% growth in qualified leads and cost per lead moving from about $20 to $6–$8.',
      'Hospitality: 48% growth in delivery-platform revenue. Recruitment: 75% growth in verified applications and walk-ins during peak periods.',
    ],
    links: [
      ['Lead generation case', 'case-studies/lead-generation.html'],
      ['Hospitality case', 'case-studies/hospitality.html'],
      ['Recruitment case', 'case-studies/recruitment.html'],
    ],
  },
  contact: {
    name: 'Contact',
    symbol: '✉',
    building: 'Post Office',
    intro: 'Get in touch about a marketing leadership role, a growth project, or a creative collaboration.',
    points: [],
    links: [['Contact Justine', 'contact.html'], ['View résumé', 'assets/Justine_Inacay_Resume.pdf']],
  },
};

const destinations = Array.from(document.querySelectorAll('[data-spot]'), (button) => ({
  key: button.dataset.spot,
  x: parseFloat(button.style.getPropertyValue('--x')),
  y: parseFloat(button.style.getPropertyValue('--y')),
  button,
}));
const shortcuts = document.querySelectorAll('[data-goto]');
const avatars = [...document.querySelectorAll('[data-avatar]')];
const scenes = ['title', 'avatar', 'name', 'town'];
const directions = {
  arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
  arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
};
const hints = [
  'Walk up to a building and use Enter or Visit to open it.',
  'Stop by the Achievement Hall for reported results and links to the case studies.',
  'Tap a building label or select a destination in the map list to visit it directly.',
];

const state = {
  scene: 'title', avatar: 'boy', name: 'Explorer', x: 50, y: 93,
  keys: new Set(), visited: new Set(), near: null, started: false,
  frame: -1, elapsed: 0, previousTime: 0,
};
let hintIndex = 0;
let lastFocus = null;

function showScene(scene, focusTarget) {
  state.scene = scene;
  state.keys.clear();
  for (const name of scenes) {
    get('scene-' + name).classList.toggle('hidden', name !== scene);
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  focusTarget.focus({ preventScroll: true });
  if (scene === 'town') {
    centerViewport();
  }
}

function centerViewport() {
  if (viewport.scrollWidth > viewport.clientWidth) {
    viewport.scrollLeft = viewport.scrollWidth * state.x / 100 - viewport.clientWidth / 2;
  }
}

function setDialogue(message, expression = 'happy') {
  get('dialogueText').textContent = message;
  get('guideFace').src = assetPath + 'justine/' + expression + '.webp';
}

function chooseAvatar(avatar) {
  state.avatar = avatar;
  for (const button of avatars) {
    button.setAttribute('aria-pressed', String(button.dataset.avatar === avatar));
  }
  get('nameAvatar').src = assetPath + avatar + '/sprite.png';
}

function syncPlayer() {
  player.style.left = state.x + '%';
  player.style.top = state.y + '%';
}

function stopWalking() {
  if (state.frame !== -1) {
    state.frame = -1;
    sprite.src = assetPath + state.avatar + '/sprite.png';
    player.classList.remove('is-moving');
  }
}

function updateProgress() {
  const progress = state.visited.size + '/' + destinations.length;
  get('progressText').textContent = progress + ' PLACES VISITED';
  get('sideProgress').textContent = progress;
  for (const { key, button } of destinations) {
    button.classList.toggle('visited', state.visited.has(key));
  }
  for (const button of shortcuts) {
    button.querySelector('em').textContent = state.visited.has(button.dataset.goto) ? '✓' : '↗';
  }
}

function startTown() {
  state.name = nameInput.value.replace(/[<>]/g, '').trim().slice(0, 18) || 'Explorer';
  state.started = true;
  state.x = 50;
  state.y = 93;
  state.near = null;
  state.visited.clear();
  get('topPlayerName').textContent = 'Player: ' + state.name;
  get('spriteName').textContent = state.name;
  sprite.src = assetPath + state.avatar + '/sprite.png';
  sprite.style.scale = '1 1';
  visit.disabled = true;
  syncPlayer();
  updateProgress();
  showScene('town', viewport);
  setDialogue(`Hi, ${state.name}! I’m Justine. Walk to a building or tap its label to see what I worked on there.`);
  try {
    localStorage.setItem('jl-town-preference', JSON.stringify({ avatar: state.avatar, name: state.name }));
  } catch {
    // The town still works when storage is unavailable.
  }
}

function openChapter(key) {
  const chapter = chapters[key];
  lastFocus = document.activeElement;
  state.keys.clear();
  stopWalking();
  state.visited.add(key);
  updateProgress();

  get('chapterMeta').textContent = chapter.building;
  get('chapterTitle').textContent = chapter.name;
  get('chapterSymbol').textContent = chapter.symbol;
  get('chapterIntro').textContent = chapter.intro;
  const bullets = get('chapterBullets');
  bullets.hidden = chapter.points.length === 0;
  bullets.replaceChildren(...chapter.points.map((point) => {
    const item = document.createElement('li');
    item.textContent = point;
    return item;
  }));
  get('chapterLinks').replaceChildren(...chapter.links.map(([label, url], index) => {
    const link = document.createElement('a');
    link.className = index === 0 ? 'primary' : 'secondary';
    link.href = url;
    link.textContent = label;
    return link;
  }));
  modal.scrollTop = 0;
  modal.showModal();

  const message = state.visited.size === destinations.length
    ? `You’ve visited every location, ${state.name}. Thanks for exploring my work!`
    : `You discovered the ${chapter.building}.`;
  setDialogue(message, chapter.expression);
}

function updateNearby() {
  let nearest = null;
  let distance = 10.5;
  for (const destination of destinations) {
    const delta = Math.hypot((state.x - destination.x) * 1.25, state.y - destination.y);
    if (delta < distance) {
      distance = delta;
      nearest = destination.key;
    }
  }
  if (nearest === state.near) return;
  state.near = nearest;
  visit.disabled = !nearest;
  if (nearest) {
    setDialogue(`You’re near the ${chapters[nearest].building}. Use Enter or Visit to go inside.`, 'thinking');
  }
}

function walk(dt) {
  const active = new Set([...state.keys].map((key) => directions[key]));
  const dx = Number(active.has('right')) - Number(active.has('left'));
  const dy = Number(active.has('down')) - Number(active.has('up'));
  const distance = Math.hypot(dx, dy);
  if (!distance) {
    stopWalking();
    return;
  }

  state.x = Math.max(5, Math.min(95, state.x + dx / distance * dt * 26));
  state.y = Math.max(12, Math.min(93, state.y + dy / distance * dt * 28));
  if (dx) sprite.style.scale = `${Math.sign(dx)} 1`;
  state.elapsed += dt;
  if (state.frame === -1 || state.elapsed >= 0.17) {
    state.frame = state.frame === 0 ? 1 : 0;
    state.elapsed = 0;
    sprite.src = assetPath + state.avatar + '/' + (state.frame === 0 ? 'walk-a' : 'walk-b') + '.png';
    player.classList.add('is-moving');
  }
  syncPlayer();
  if (dx) centerViewport();
  updateNearby();
}

function tick(time) {
  const dt = Math.min((time - state.previousTime) / 1000, 0.065);
  state.previousTime = time;
  if (state.scene === 'town' && !modal.open) walk(dt);
  requestAnimationFrame(tick);
}

get('startGame').addEventListener('click', () => {
  if (state.started) {
    showScene('town', viewport);
  } else {
    showScene('avatar', avatars.find((button) => button.dataset.avatar === state.avatar));
  }
});
get('homeNav').addEventListener('click', (event) => {
  event.preventDefault();
  showScene('title', get('startGame'));
});
get('backToTitle').addEventListener('click', () => showScene('title', get('startGame')));
get('confirmAvatar').addEventListener('click', () => showScene('name', nameInput));
get('backToAvatar').addEventListener('click', () => showScene('avatar', get('confirmAvatar')));
get('resetGame').addEventListener('click', () => {
  state.started = false;
  showScene('avatar', avatars.find((button) => button.dataset.avatar === state.avatar));
});
get('enterAdventure').addEventListener('click', startTown);
nameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') startTown();
});
for (const button of avatars) {
  button.addEventListener('click', () => chooseAvatar(button.dataset.avatar));
}
for (const { key, button } of destinations) {
  button.addEventListener('click', () => openChapter(key));
}
for (const button of shortcuts) {
  button.addEventListener('click', () => openChapter(button.dataset.goto));
}
get('nextDialogue').addEventListener('click', () => {
  setDialogue(hints[hintIndex]);
  hintIndex = (hintIndex + 1) % hints.length;
});
visit.addEventListener('click', () => {
  if (state.near) openChapter(state.near);
});
modal.addEventListener('close', () => lastFocus?.focus({ preventScroll: true }));
modal.addEventListener('click', (event) => {
  if (event.target !== modal) return;
  const { left, right, top, bottom } = modal.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
    modal.close();
  }
});

const movementControls = document.querySelector('.dpad');
function clearKeys() {
  state.keys.clear();
}

window.addEventListener('keydown', (event) => {
  if (state.scene !== 'town' || modal.open || event.altKey || event.ctrlKey || event.metaKey) return;
  const key = event.key.toLowerCase();
  if (directions[key] && (viewport.contains(event.target) || movementControls.contains(event.target))) {
    event.preventDefault();
    state.keys.add(key);
  }
  if ((key === 'enter' || key === ' ') && event.target === viewport) {
    event.preventDefault();
    if (state.near && !event.repeat) openChapter(state.near);
  }
});
window.addEventListener('keyup', (event) => state.keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', clearKeys);
viewport.addEventListener('focusout', (event) => {
  if (!viewport.contains(event.relatedTarget)) clearKeys();
});
for (const button of document.querySelectorAll('[data-move]')) {
  const key = 'arrow' + button.dataset.move;
  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    button.setPointerCapture(event.pointerId);
    state.keys.add(key);
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(eventName, () => state.keys.delete(key));
  }
  button.addEventListener('click', (event) => {
    if (event.detail === 0) {
      state.keys.add(key);
      walk(0.13);
      state.keys.delete(key);
    }
  });
}

try {
  const stored = JSON.parse(localStorage.getItem('jl-town-preference'));
  if (stored && avatars.some((button) => button.dataset.avatar === stored.avatar)) chooseAvatar(stored.avatar);
  if (typeof stored?.name === 'string') nameInput.value = stored.name.slice(0, 18);
} catch {
  // An unavailable or malformed preference leaves the default explorer selected.
}
get('startGame').hidden = false;
requestAnimationFrame(tick);
