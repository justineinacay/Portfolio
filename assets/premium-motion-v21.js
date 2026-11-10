/* V21 — Non-destructive animation enhancement. Preserves all links, content,
   original word order, accessibility labels, lightboxes, and page layouts. */
(()=>{
  'use strict';
  const root=document.documentElement;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const titles=[
    '.section-head h2','.section-side h2','.v16-section-head h2',
    '.v10-heading h2','.inner-hero h1','.v16-tool-copy h3',
    '.v16-project-content h3','.proof-card h3','.case-tile-info h3',
    '.note-card h3','.about-preview-copy h2','.beyond-copy h2',
    '.invitation-head h2','.closing-copy h2','.journal-line h2',
    '.v10-story-card h3','.v13-exp-body h3'
  ].join(',');
  const copies=[
    '.section-head>p','.section-side>p','.v16-section-head>p',
    '.about-preview-copy>p','.beyond-copy>p','.invitation-head>p',
    '.closing-copy>p','.v16-tool-copy>p'
  ].join(',');
  const cards=[
    '.proof-card','.case-tile','.note-card','.v16-tool-card','.v16-project-card',
    '.v10-selected-item','.v10-auto-item','.v10-story-card','.v10-archive-item',
    '.principle','.v16-extra-card','.journal-line','.invitation-option'
  ].join(',');
  const observer=('IntersectionObserver' in window && !reduced.matches)?
    new IntersectionObserver(events=>{
      for(const ent of events)if(ent.isIntersecting){ent.target.classList.add('v21-in');observer.unobserve(ent.target)}
    },{threshold:.08,rootMargin:'0px 0px -5% 0px'}):null;
  function activate(el){el.classList.add('v21-in')}
  function watch(el){
    if(!observer){activate(el);return}
    const rect=el.getBoundingClientRect();
    if(rect.bottom<0){activate(el);return}
    // Honor the visible-on-load state and don't conceal a focused control.
    if(rect.top<innerHeight*.90 && rect.bottom>0){requestAnimationFrame(()=>activate(el));return}
    observer.observe(el);
  }
  function splitWords(el){
    if(el.children.length||el.dataset.v21Split)return;
    const original=el.textContent;
    if(!original || !original.trim() || original.length>150)return;
    el.setAttribute('aria-label',original.trim());
    const fragment=document.createDocumentFragment();
    const tokens=original.match(/\S+|\s+/g)||[];
    let index=0;
    for(const word of tokens){
      if(/^\s+$/.test(word)){fragment.appendChild(document.createTextNode(word));continue}
      const span=document.createElement('span');span.className='v21-word';
      span.textContent=word;span.setAttribute('aria-hidden','true');
      span.style.setProperty('--v21-word',String(Math.min(index++,11)));
      fragment.appendChild(span);
    }
    el.replaceChildren(fragment);el.dataset.v21Split='1';
  }
  function decorate(){
    const main=document.querySelector('main');if(!main)return;
    main.querySelectorAll(titles).forEach(el=>{
      if(el.closest('dialog')||el.dataset.v21Enhanced)return;
      el.dataset.v21Enhanced='1';splitWords(el);el.classList.add('v21-motion-title');watch(el);
    });
    main.querySelectorAll(copies).forEach(el=>{
      if(el.closest('dialog')||el.dataset.v21Enhanced)return;
      el.dataset.v21Enhanced='1';el.classList.add('v21-motion-copy');
      el.style.setProperty('--v21-delay','125ms');watch(el);
    });
    main.querySelectorAll(cards).forEach(el=>{
      if(el.closest('dialog')||el.dataset.v21Enhanced)return;
      el.dataset.v21Enhanced='1';el.classList.add('v21-motion-card');
      const peers=el.parentElement?[...el.parentElement.children].filter(c=>c.matches(cards)):[];
      const n=Math.max(0,peers.indexOf(el));
      el.style.setProperty('--v21-delay',`${Math.min(n%4,3)*(innerWidth<760?60:95)}ms`);
      watch(el);
    });
    root.classList.add('v21-motion-ready');
  }
  function init(){
    decorate();
    const main=document.querySelector('main');
    if(main&&'MutationObserver' in window){let pending=false;
      new MutationObserver(events=>{
        if(!events.some(e=>e.addedNodes.length)||pending)return;
        pending=true;requestAnimationFrame(()=>{pending=false;decorate()});
      }).observe(main,{childList:true,subtree:false});
    }
    reduced.addEventListener?.('change',()=>{
      if(reduced.matches)document.querySelectorAll('.v21-motion-card,.v21-motion-title,.v21-motion-copy').forEach(activate)
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
