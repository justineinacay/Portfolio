/* V10 editorial archive, controls and accessible original-image navigation */
(()=>{'use strict';
let expanded=false;const previewLimit=9;
const archive=()=>document.getElementById('v10Archive');
function available(){return Array.from(document.querySelectorAll('#portfolioArtGrid .v10-archive-item')).filter(x=>!x.hidden)}
function refresh(){const grid=document.getElementById('portfolioArtGrid');if(!grid)return;let all=Array.from(grid.querySelectorAll('.v10-archive-item'));
const active=document.querySelector('#behind-the-work .gallery-filter.is-active');const category=active?.dataset.galleryFilter||'all';
let shown=0;all.forEach(el=>{const matches=category==='all'||el.dataset.artCategory===category;el.hidden=!matches;el.classList.remove('v10-truncated');if(matches){shown++;if(!expanded&&shown>previewLimit)el.classList.add('v10-truncated')}});
const info=document.getElementById('v10Showing');if(info)info.textContent=expanded?`Showing ${shown} ${shown===1?'sample':'samples'}`:`Showing ${Math.min(previewLimit,shown)} of ${shown} ${shown===1?'sample':'samples'}`;
const more=document.getElementById('v10ArchiveMore');if(more){more.hidden=expanded||shown<=previewLimit;more.textContent=`Show all ${shown} ${shown===1?'work':'works'} ↓`}
}
document.addEventListener('click',e=>{
 if(e.target.closest('#v10ArchiveMore')){expanded=true;refresh();return}
 if(e.target.closest('#behind-the-work [data-gallery-filter]')){expanded=false;queueMicrotask(refresh);return}
 const open=e.target.closest('[data-open-archive]');if(open){const box=archive();if(box){box.open=true;requestAnimationFrame(()=>{box.scrollIntoView({block:'start',behavior:'smooth'});refresh();})}}
});
// Each route may insert a fresh main in offline mode, so observe archive appearances only when needed.
new MutationObserver(()=>{if(document.getElementById('portfolioArtGrid')&&!document.getElementById('portfolioArtGrid').dataset.v10Ready){document.getElementById('portfolioArtGrid').dataset.v10Ready='true';expanded=false;refresh();}}).observe(document.body,{childList:true,subtree:false});
function entries(){return window.JI_ARTWORK_ENTRIES||[]}
function currentList(){const dlg=document.getElementById('portfolioLightbox');const context=dlg?.dataset.v10Context||'';
 const buttons=Array.from(document.querySelectorAll('[data-art-open]')).filter(el=>{const rect=el.getClientRects();return rect.length>0&&!el.hidden&&!el.classList.contains('v10-truncated')});
 const ids=buttons.map(x=>x.dataset.artOpen);return [...new Set(ids)];}
function navigate(direction){const dlg=document.getElementById('portfolioLightbox');if(!dlg?.open)return;const current=dlg.dataset.v10Current||'';const ids=currentList();if(!ids.length)return;let pos=ids.indexOf(current);if(pos<0)pos=0;pos=(pos+direction+ids.length)%ids.length;const e=entries().find(x=>x.id===ids[pos]);if(!e)return;
 const img=document.getElementById('artDialogImage');img.src=e.original||e.src;img.alt=e.title;
 document.getElementById('artDialogTitle').textContent=e.title;
 document.getElementById('artDialogDescription').textContent=e.description+' · '+e.source;
 document.getElementById('artDialogOpen').href=e.original||e.src;
 dlg.dataset.v10Current=e.id;
}
document.addEventListener('click',e=>{const item=e.target.closest('[data-art-open]');if(item){const dlg=document.getElementById('portfolioLightbox');if(dlg)dlg.dataset.v10Current=item.dataset.artOpen;return}
 if(e.target.closest('#v10Previous'))navigate(-1);
 if(e.target.closest('#v10Next'))navigate(1);
});
document.addEventListener('keydown',e=>{const dlg=document.getElementById('portfolioLightbox');if(!dlg?.open)return;if(e.key==='ArrowRight'){e.preventDefault();navigate(1)}if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1)}});
window.addEventListener('hashchange',()=>requestAnimationFrame(refresh));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();
