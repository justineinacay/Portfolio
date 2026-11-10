/* V19 — floating reader-facing counter, no fabricated numbers. */
(() => {
  'use strict';
  if (document.querySelector('.visitor-float')) return;
  const config = window.JUSTINE_ANALYTICS_CONFIG || {};
  const endpoint = String(config.endpoint || '').trim().replace(/\/$/, '');
  const connected = /^https:\/\/[a-z0-9.-]+\/functions\/v1\/portfolio-analytics$/i.test(endpoint) && /^https?:$/.test(location.protocol);
  const isOffline = document.body?.dataset.v10Offline === 'true';
  const page = document.documentElement.dataset.analyticsPage || 'index.html';
  const privacyHref = isOffline ? 'privacy.html' : page.includes('/') ? '../privacy.html' : 'privacy.html';
  const eye = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.3 12c2.5-4.3 5.8-6.5 9.7-6.5s7.2 2.2 9.7 6.5c-2.5 4.3-5.8 6.5-9.7 6.5S4.8 16.3 2.3 12Z"/><circle cx="12" cy="12" r="2.8"/></svg>';
  const chevron='<svg class="visitor-float-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>';
  const close='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const root=document.createElement('aside');
  root.className='visitor-float';
  root.setAttribute('aria-label','Portfolio visitor counter');
  root.innerHTML=`<section class="visitor-float-panel" id="visitor-count-popover" data-state="pending" aria-label="Public portfolio statistics" hidden>
      <div class="visitor-float-top"><div><span class="visitor-float-overline">PORTFOLIO ACTIVITY</span><h2 class="visitor-float-title">Visitor counter</h2></div>
        <button class="visitor-float-close" type="button" aria-label="Close visitor statistics">${close}</button></div>
      <div class="visitor-float-metrics">
        <div class="visitor-float-metric"><strong class="visitor-float-number" data-float-total>—</strong><span class="visitor-float-metric-label">Total page views</span></div>
        <div class="visitor-float-metric"><strong class="visitor-float-number" data-float-about>—</strong><span class="visitor-float-metric-label">About-page views</span></div>
      </div>
      <p class="visitor-float-status" role="status"><span class="visitor-float-dot" aria-hidden="true"></span><span data-float-status>${connected ? 'Connecting to live analytics…' : 'Analytics is not connected yet. Counts will appear after activation.'}</span></p>
      <div class="visitor-float-bottom"><span class="visitor-float-note">Page views are not unique people.</span><a href="${privacyHref}">Privacy &amp; analytics ↗</a></div>
    </section>
    <button class="visitor-float-trigger" type="button" aria-controls="visitor-count-popover" aria-expanded="false" aria-label="Show visitor statistics">
      <span class="visitor-float-eye">${eye}</span><span class="visitor-float-label">Views</span><strong class="visitor-float-value" data-float-pill>—</strong>${chevron}
    </button>`;
  document.body.appendChild(root);
  const panel=root.querySelector('.visitor-float-panel');
  const trigger=root.querySelector('.visitor-float-trigger');
  const dismiss=root.querySelector('.visitor-float-close');
  const pill=root.querySelector('[data-float-pill]');
  const totalNode=root.querySelector('[data-float-total]');
  const aboutNode=root.querySelector('[data-float-about]');
  const statusNode=root.querySelector('[data-float-status]');
  function toggle(open) {
    panel.hidden=!open;
    trigger.setAttribute('aria-expanded',String(open));
    trigger.setAttribute('aria-label',open?'Hide visitor statistics':'Show visitor statistics');
  }
  trigger.addEventListener('click',()=>toggle(panel.hidden));
  dismiss.addEventListener('click',()=>{toggle(false);trigger.focus();});
  document.addEventListener('pointerdown',e=>{
    if(!panel.hidden && !root.contains(e.target))toggle(false);
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!panel.hidden){toggle(false);trigger.focus();}
  });
  function setData(detail){
    const total=Number(detail?.total_views), about=Number(detail?.profile_views);
    if(!Number.isFinite(total)||total<0)return;
    const fmt=new Intl.NumberFormat('en-PH');
    pill.textContent=fmt.format(total);
    totalNode.textContent=fmt.format(total);
    aboutNode.textContent=Number.isFinite(about)&&about>=0?fmt.format(about):'—';
    statusNode.textContent='Live counts from recorded portfolio visits.';
    panel.dataset.state='live';
  }
  function setUnavailable(){
    if(panel.dataset.state!=='live' && connected){
      statusNode.textContent='Could not reach the analytics service. No count is being shown.';
      panel.dataset.state='error';
    }
  }
  document.addEventListener('portfolio-count-ready',e=>setData(e.detail));
  document.addEventListener('portfolio-count-error',setUnavailable);
  if(window.PORTFOLIO_PUBLIC_COUNT)setData(window.PORTFOLIO_PUBLIC_COUNT);
})();
