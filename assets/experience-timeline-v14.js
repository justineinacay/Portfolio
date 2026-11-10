(()=>{'use strict';
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
function setup(){
 const lists=document.querySelectorAll('.experience-detail .v13-exp-list');
 if(!lists.length)return;
 lists.forEach(list=>{
  if(list.dataset.v14Timeline==='ready')return;
  list.dataset.v14Timeline='ready';
  const section=list.closest('.experience-detail');
  const cards=[...list.querySelectorAll('.v13-exp-card')];
  const buttons=[...section.querySelectorAll('[data-experience-filter]')];
  const status=document.createElement('p');status.className='v14-timeline-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  list.before(status);
  let intersection=null;let scheduled=false;
  const observe=()=>{
   if(intersection)intersection.disconnect();
   if(motion.matches||!('IntersectionObserver' in window)){cards.forEach(card=>card.classList.add('v14-in-view'));return;}
   intersection=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('v14-in-view');intersection.unobserve(entry.target);}})
   },{threshold:0.09,rootMargin:'0px 0px -25px 0px'});
   cards.forEach(card=>{if(!card.hidden){card.classList.remove('v14-in-view');intersection.observe(card);}});
  };
  const paint=()=>{
   scheduled=false;
   if(motion.matches){list.style.setProperty('--v14-progress','100%');return;}
   const r=list.getBoundingClientRect();
   if(r.height<=0)return;
   const travel=Math.max(0,Math.min(r.height,window.innerHeight*0.58-r.top));
   list.style.setProperty('--v14-progress',`${(travel/r.height*100).toFixed(2)}%`);
  };
  const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(paint)}};
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
   requestAnimationFrame(()=>{
    const visible=cards.filter(card=>!card.hidden);
    status.textContent=`Showing ${visible.length} experience ${visible.length===1?'entry':'entries'}.`;
    observe();schedule();
   });
  }));
  observe();paint();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  motion.addEventListener?.('change',()=>{observe();paint()});
 });
 document.documentElement.classList.add('v14-timeline-ready');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
// The standalone site swaps page views without a full reload.
window.addEventListener('popstate',()=>requestAnimationFrame(setup));
const watch=new MutationObserver(()=>{if(document.querySelector('.experience-detail .v13-exp-list:not([data-v14-timeline="ready"])'))setup();});
watch.observe(document.documentElement,{childList:true,subtree:true});
})();
