/* V18 privacy-conscious first-party analytics — actual data only. */
(() => {
  'use strict';
  const settings = window.JUSTINE_ANALYTICS_CONFIG || {};
  const endpoint = (settings.endpoint || '').trim().replace(/\/$/, '');
  const validEndpoint = /^https:\/\/[a-z0-9.-]+\/functions\/v1\/portfolio-analytics$/i.test(endpoint) ||
    /^http:\/\/(?:localhost|127\.0\.0\.1):\d+\/analytics$/i.test(endpoint);
  const isWeb = /^https?:$/.test(location.protocol);
  const doc = document.documentElement;
  const path = (doc.dataset.analyticsPage || 'index.html').slice(0, 140);
  const optedOut = () => { try { return localStorage.getItem('portfolio_analytics_optout') === '1'; } catch { return false; } };
  const prefersPrivacy = () => navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  const canTrack = validEndpoint && isWeb && !optedOut() && !prefersPrivacy() && !navigator.webdriver && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const makeId = () => crypto.randomUUID?.() || ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
  }));
  let sessionId = null;
  try {
    sessionId = sessionStorage.getItem('justine_portfolio_session_v18');
    if (!sessionId) { sessionId = makeId(); sessionStorage.setItem('justine_portfolio_session_v18', sessionId); }
  } catch { sessionId = makeId(); }
  const referrerDomain = (() => { try { return new URL(document.referrer).hostname.slice(0, 100); } catch { return ''; } })();
  const trafficSource = (new URLSearchParams(location.search).get('utm_source') || '').replace(/[^a-z0-9._-]/gi, '').slice(0, 48);

  function sendEvent(kind, extra = {}) {
    if (!canTrack) return;
    const body = {
      event_id: makeId(), event_name: kind, path, session: sessionId,
      referrer_domain: referrerDomain, utm_source: trafficSource, ...extra
    };
    try {
      fetch(endpoint, {
        method: 'POST', mode: 'cors', keepalive: true,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      }).catch(() => { /* Analytics must never interrupt the portfolio. */ });
    } catch { /* Browser may block tracking. */ }
  }

  function mountCounters() {
    const footer = document.querySelector('.site-footer .footer-layout');
    if (footer && !footer.querySelector('.footer-analytics')) {
      const panel = document.createElement('div');
      panel.className = 'footer-analytics';
      panel.innerHTML = `<span data-public-counter hidden><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12S5.5 5.8 12 5.8 22 12 22 12 18.5 18.2 12 18.2 2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><strong data-portfolio-views></strong> portfolio page views</span>${isWeb ? `<a href="${path.includes('/')?'../':''}privacy.html">Privacy &amp; analytics</a>` : ''}`;
      footer.append(panel);
    }
    if (path === 'about.html') {
      const destination = document.querySelector('.about-preview-copy, .about-intro-copy, .about-hero-copy, .about-body, main');
      if (destination && !destination.querySelector('.profile-counter')) {
        const panel = document.createElement('div');panel.className='profile-counter';
        panel.innerHTML='<span data-public-counter hidden><strong data-profile-views></strong> About-page views</span>';
        destination.append(panel);
      }
    }
  }
  mountCounters();

  async function showPublicCounters() {
    if (!validEndpoint || !isWeb) return;
    try {
      const reply = await fetch(endpoint + '?mode=count', {cache: 'no-store', mode:'cors'});
      if (!reply.ok) { document.dispatchEvent(new Event('portfolio-count-error')); return; }
      const result = await reply.json();
      const total = Number(result?.total_views);
      const profile = Number(result?.profile_views);
      if (!Number.isFinite(total) || total < 0) { document.dispatchEvent(new Event('portfolio-count-error')); return; }
      document.querySelectorAll('[data-portfolio-views]').forEach(node => {
        node.textContent = new Intl.NumberFormat('en-PH').format(total);
        node.closest('[data-public-counter]')?.removeAttribute('hidden');
      });
      if (Number.isFinite(profile) && profile >= 0) {
        document.querySelectorAll('[data-profile-views]').forEach(node => {
          node.textContent = new Intl.NumberFormat('en-PH').format(profile);
          node.closest('[data-public-counter]')?.removeAttribute('hidden');
        });
      }
      window.PORTFOLIO_PUBLIC_COUNT = {total_views: total, profile_views: profile};
      document.dispatchEvent(new CustomEvent('portfolio-count-ready', {detail: window.PORTFOLIO_PUBLIC_COUNT}));
    } catch { document.dispatchEvent(new Event('portfolio-count-error')); }
  }

  document.addEventListener('click', evt => {
    const element = evt.target?.closest?.('a,button');
    if (!element) return;
    const href = element.getAttribute('href') || '';
    if (href.startsWith('mailto:') || /linkedin\.com\/in\/justine/i.test(href)) sendEvent('contact_click');
    else if (/Justine_Inacay_Resume\.pdf/i.test(href) || element.hasAttribute('download') && /resume|résumé/i.test(href)) sendEvent('resume_download');
    else if (element.matches('[data-open-project]')) sendEvent('project_open');
    else if (/case-studies\//.test(href)) sendEvent('case_study_open');
  }, true);

  if (canTrack) sendEvent('page_view');
  showPublicCounters();

  // Optional independent aggregate performance analytics. No token = no external request.
  const cfToken = String(settings.cloudflareBeaconToken || '').trim();
  if (isWeb && /^[a-f0-9]{32}$/i.test(cfToken) && !optedOut() && !prefersPrivacy()) {
    const beacon = document.createElement('script');
    beacon.defer = true;
    beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    beacon.setAttribute('data-cf-beacon', JSON.stringify({token: cfToken}));
    document.head.appendChild(beacon);
  }
})();
