(() => {
  const root = document.documentElement;
  try { history.scrollRestoration = 'manual'; } catch {}

  const makeFilter = (label, options, onSelect) => {
    const nav = document.createElement('nav');
    nav.className = 'portfolio-filter';
    nav.setAttribute('aria-label', label);
    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option.label;
      button.dataset.filter = option.value;
      button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => {
        nav.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        onSelect(option.value);
      });
      nav.append(button);
    });
    return nav;
  };

  function enhanceRail() {
    const rail = document.querySelector('.persistent-profile');
    if (!rail || rail.querySelector('.rail-collapse')) return;
    let collapsed = false;
    try { collapsed = localStorage.getItem('justine-portfolio-rail') === 'collapsed'; } catch {}
    root.dataset.railCollapsed = String(collapsed);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rail-collapse';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/><path d="M20 4v16"/></svg>';
    const sync = () => {
      const isCollapsed = root.dataset.railCollapsed === 'true';
      root.style.setProperty('--rail', isCollapsed ? '76px' : 'var(--rail-open)', 'important');
      button.setAttribute('aria-label', isCollapsed ? 'Expand profile sidebar' : 'Collapse profile sidebar');
      button.setAttribute('aria-expanded', String(!isCollapsed));
      button.title = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
    };
    button.addEventListener('click', () => {
      const next = root.dataset.railCollapsed !== 'true';
      root.dataset.railCollapsed = String(next);
      try { localStorage.setItem('justine-portfolio-rail', next ? 'collapsed' : 'open'); } catch {}
      sync();
      window.dispatchEvent(new Event('resize'));
    });
    rail.prepend(button);
    sync();
  }

  function enhanceAbout() {
    const panel = document.querySelector('[data-view-panel="about"]');
    const layout = panel?.querySelector('.about-layout');
    const grid = layout?.querySelector('.company-portfolio-grid');
    if (!panel || !layout || !grid || panel.querySelector('.about-overview')) return;

    const overview = document.createElement('section');
    overview.className = 'about-overview';
    overview.setAttribute('aria-label', 'Professional overview');
    overview.innerHTML = `
      <article class="about-overview__intro">
        <h2>Marketing leadership across the full growth system.</h2>
        <p>I lead customer acquisition, performance media, brand systems, and CRM automation across Philippine and international markets. My work connects strategy with hands-on delivery—from creative direction and analytics to cross-functional coordination.</p>
      </article>
      <article class="about-overview__metric"><strong>40–60%</strong><span>qualified-lead growth across a consulting portfolio</span></article>
      <article class="about-overview__metric"><strong>$6–$8</strong><span>cost per lead after campaign optimization</span></article>
      <article class="about-overview__metric"><strong>6 sectors</strong><span>food & beverage, franchising, retail, medical, automotive, and manpower</span></article>`;
    panel.querySelector('.view-heading').after(overview);

    const filter = makeFilter('Filter professional experience', [
      { label: 'All experience', value: 'all' },
      { label: 'Brand leadership', value: 'Brand portfolio' },
      { label: 'Consulting', value: 'Consulting client' },
      { label: 'Corporate roles', value: 'Corporate role' }
    ], value => {
      grid.querySelectorAll('.company-card').forEach(card => card.classList.toggle('is-filtered-out', value !== 'all' && card.dataset.engagement !== value));
      document.querySelector('#experience-reveal')?.setAttribute('hidden', '');
      layout.classList.remove('experience-selected');
    });
    layout.before(filter);
  }

  const projectMeta = {
    naknak: { category: 'Digital product', status: 'Working product', image: 'Portfolio-assets/official-naknak-web.png' },
    'job-collectives': { category: 'Business venture', status: 'Active brand', image: 'Portfolio-assets/official-job-collectives.png' },
    'diskart-e': { category: 'Digital product', status: 'Product concept', image: 'Portfolio-assets/official-diskart-e.png' },
    'creative-collectives': { category: 'Branding & creative', status: 'Active studio', image: 'Portfolio-assets/official-creative-collectives.png' },
    'code-collectives': { category: 'Business venture', status: 'Product studio', image: 'Portfolio-assets/official-code-collectives.png' },
    getsemane: { category: 'Branding & creative', status: 'Developing brand', image: 'Portfolio-assets/official-getsemane-web.png' }
  };

  function addProjectCard(grid, project) {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.dataset.projectKey = project.key;
    article.dataset.category = project.category;
    article.style.setProperty('--project-fill', project.fill);
    article.style.setProperty('--project-edge', project.edge);
    article.innerHTML = `
      <div class="project-visual"><img src="${project.image}" alt="${project.name} official logo" loading="eager" decoding="async"></div>
      <div class="project-copy">
        <span class="project-category">${project.category}</span>
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <span class="project-role">${project.role}</span>
        <span class="project-status">${project.status}</span>
        <div class="project-actions">${project.url ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer">View project ↗</a>` : ''}</div>
      </div>`;
    grid.append(article);
  }

  function enhanceProjects() {
    const panel = document.querySelector('[data-view-panel="projects"]');
    const grid = panel?.querySelector('.project-grid');
    if (!panel || !grid || panel.querySelector('.portfolio-filter')) return;

    grid.querySelectorAll('.project-card').forEach(card => {
      const meta = projectMeta[card.dataset.projectKey];
      if (!meta) return;
      card.dataset.category = meta.category;
      const copy = card.querySelector('.project-copy');
      const title = copy?.querySelector('h3');
      if (copy && title) {
        const category = document.createElement('span');
        category.className = 'project-category';
        category.textContent = meta.category;
        copy.insertBefore(category, title);
        const status = document.createElement('span');
        status.className = 'project-status';
        status.textContent = meta.status;
        copy.querySelector('.project-actions')?.before(status);
      }
      if (meta.image) {
        const image = card.querySelector('.project-visual img');
        if (image) {
          image.loading = 'eager';
          image.decoding = 'async';
          image.src = meta.image;
        }
      }
    });

    addProjectCard(grid, {
      key: 'pallo', name: 'Pallo', category: 'Digital product', status: 'Product concept',
      image: 'Portfolio-assets/official-pallo.png', fill: '#050505', edge: '#d8ff00',
      description: 'A mobile community concept for finding courts, joining games, and connecting pickleball players.',
      role: 'Product strategy + UI/UX', url: 'https://www.facebook.com/pallo.io/'
    });
    addProjectCard(grid, {
      key: 'dingo', name: 'DINGO!', category: 'Digital product', status: 'Product concept',
      image: 'Portfolio-assets/official-dingo-transparent.png', fill: '#ffcf16', edge: '#ffc721',
      description: 'A playful macOS soundboard concept built around fast access, custom collections, and keyboard shortcuts.',
      role: 'Product direction + UI/UX', url: 'https://www.facebook.com/getdingo.io/'
    });
    addProjectCard(grid, {
      key: 'melo', name: 'MELO', category: 'Branding & creative', status: 'Portfolio concept',
      image: 'Portfolio-assets/official-melo.png', fill: '#050505', edge: '#39f4e1',
      description: 'A brand identity exploration included in Justine’s selected creative portfolio.',
      role: 'Brand concept'
    });

    const count = panel.querySelector('.view-heading>span');
    if (count) count.textContent = 'Nine brands & products';
    const filter = makeFilter('Filter selected projects', [
      { label: 'All projects', value: 'all' },
      { label: 'Digital products', value: 'Digital product' },
      { label: 'Branding & creative', value: 'Branding & creative' },
      { label: 'Business ventures', value: 'Business venture' }
    ], value => {
      grid.querySelectorAll('.project-card').forEach(card => card.classList.toggle('is-filtered-out', value !== 'all' && card.dataset.category !== value));
    });
    grid.before(filter);
    syncProjectLayout();
  }

  function syncProjectLayout() {
    const grid = document.querySelector('[data-view-panel="projects"] .project-grid');
    if (!grid) return;
    const availableWidth = grid.clientWidth || innerWidth;
    const desktopGallery = innerWidth > 820;
    const columns = desktopGallery ? 3 : availableWidth < 680 ? 1 : 2;
    grid.style.setProperty('grid-template-columns', `repeat(${columns},minmax(0,1fr))`, 'important');
    grid.style.setProperty('grid-template-rows', desktopGallery ? 'repeat(3,minmax(0,1fr))' : 'none', 'important');
    grid.style.setProperty('grid-auto-rows', desktopGallery ? 'unset' : 'auto', 'important');
    grid.querySelectorAll('.project-card').forEach(card => {
      card.style.setProperty('height', 'auto', 'important');
      card.style.setProperty('min-height', '0', 'important');
    });
  }

  function resetRouteScroll() {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    setTimeout(() => window.scrollTo(0, 0), 80);
  }

  function init() {
    enhanceRail();
    enhanceAbout();
    enhanceProjects();
    resetRouteScroll();
  }

  init();
  document.addEventListener('click', event => {
    if (event.target.closest('[data-view-link]')) resetRouteScroll();
  }, true);
  window.addEventListener('hashchange', resetRouteScroll);
  window.addEventListener('popstate', resetRouteScroll);
  window.addEventListener('pageshow', resetRouteScroll);
  window.addEventListener('resize', syncProjectLayout);
  window.addEventListener('load', () => { enhanceRail(); syncProjectLayout(); });
})();
