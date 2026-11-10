/* V21 — Strategy pathways: fine editorial grid, connecting trajectories, slow
   pulses. Canvas 2D only, no WebGL dependency, external assets, or network. */
(()=>{
  'use strict';
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=window.matchMedia('(pointer: coarse)');
  let sweeping=false;
  window.runThemeReveal=(apply,button)=>{
    if(typeof apply!=='function'||sweeping)return;
    if(reduce.matches){apply();return;}
    const rect=button?.getBoundingClientRect?.();
    const x=rect?rect.left+rect.width/2:innerWidth/2;
    const y=rect?rect.top+rect.height/2:innerHeight/2;
    root.style.setProperty('--theme-x',`${x}px`);
    root.style.setProperty('--theme-y',`${y}px`);
    root.style.setProperty('--theme-r',`${Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+16}px`);
    sweeping=true;
    button?.setAttribute('aria-busy','true');
    const done=()=>{root.removeAttribute('data-theme-sweep');root.classList.remove('v12-theme-fallback');button?.removeAttribute('aria-busy');sweeping=false;};
    if(typeof document.startViewTransition!=='function'){
      root.classList.add('v12-theme-fallback');apply();setTimeout(done,1450);return;
    }
    root.dataset.themeSweep='on';
    try{document.startViewTransition(()=>apply()).finished.then(done,done)}
    catch{root.classList.add('v12-theme-fallback');apply();setTimeout(done,1450)}
  };

  const sections='.hero,.page-hero,.inner-hero,.closing-section';
  const entries=[];
  const visibility=('IntersectionObserver' in window)?new IntersectionObserver((events)=>{
    for(const event of events){const o=entries.find(x=>x.host===event.target);if(o)o.visible=event.isIntersecting;}
  },{rootMargin:'100px'}):null;
  const observer=('ResizeObserver' in window)?new ResizeObserver((events)=>{
    for(const event of events){const o=entries.find(x=>x.host===event.target);if(o)o.dirty=true;}
  }):null;
  function mount(host){
    if(host.querySelector(':scope > .strategy-field-v21'))return;
    const canvas=document.createElement('canvas');
    canvas.className='strategy-field-v21';canvas.setAttribute('aria-hidden','true');
    host.insertBefore(canvas,host.firstChild);
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx){canvas.remove();return;}
    const item={host,canvas,ctx,w:0,h:0,dirty:true,visible:true,dark:root.dataset.theme==='dark'?1:0,phase:entries.length*1.9};
    entries.push(item);visibility?.observe(host);observer?.observe(host);
  }
  function mountAll(){document.querySelectorAll(sections).forEach(mount)}
  const cubic=(a,b,c,d,t)=>{const k=1-t;return k*k*k*a+3*k*k*t*b+3*k*t*t*c+t*t*t*d};
  function draw(it,seconds,dt){
    const r=it.host.getBoundingClientRect();
    if(r.bottom<-100||r.top>innerHeight+100||r.width<10||r.height<10)return;
    const w=r.width,h=r.height;
    const scale=coarse.matches?1:Math.min(devicePixelRatio||1,1.45);
    const cw=Math.round(w*scale),ch=Math.round(h*scale);
    if(it.dirty||it.canvas.width!==cw||it.canvas.height!==ch){
      it.canvas.width=cw;it.canvas.height=ch;it.ctx.setTransform(scale,0,0,scale,0,0);it.dirty=false;
    }
    const c=it.ctx;
    c.clearRect(0,0,w,h);
    const isDark=root.dataset.theme==='dark'?1:0;
    it.dark+=(isDark-it.dark)*Math.min(1,dt*2.5);
    const dark=it.dark;
    // Wide, low-contrast light: concentrates visual energy away from the copy.
    const x=w*.82+Math.sin(seconds*.13+it.phase)*w*.025;
    const y=h*.50+Math.cos(seconds*.095+it.phase)*h*.035;
    const glow=c.createRadialGradient(x,y,0,x,y,Math.max(w*.63,h*.90));
    glow.addColorStop(0,`rgba(66,124,208,${(.042+dark*.045).toFixed(3)})`);
    glow.addColorStop(.6,`rgba(84,140,204,${(.014+dark*.015).toFixed(3)})`);
    glow.addColorStop(1,'rgba(76,132,204,0)');
    c.fillStyle=glow;c.fillRect(0,0,w,h);
    // On phones reserve the upper reading area for text; animate behind the portrait.
    c.save();
    if(w<680){c.beginPath();c.rect(0,h*.53,w,h*.47);c.clip();}
    // A deliberately sparse modular grid, more like a strategy map than art.
    const ink=dark?`rgba(163,195,239,${(.058+.018*dark).toFixed(3)})`:'rgba(50,91,153,.058)';
    c.strokeStyle=ink;c.lineWidth=1;
    const step=w<680?95:128;
    c.beginPath();
    for(let i=0;i<=Math.ceil(w/step);i++){
      const xx=i*step+((w*.07)%step);
      if(xx<w*.38)continue;
      c.moveTo(xx,0);c.lineTo(xx,h);
    }
    for(let j=0;j<=Math.ceil(h/step);j++){
      const yy=j*step+((h*.17)%step);
      c.moveTo(w*.41,yy);c.lineTo(w,yy);
    }
    c.stroke();
    // Four broad strategic routes, one focused series of signal pulses.
    const lines=[
      [[.39,.79],[.57,.70],[.68,.34],[1.08,.23]],
      [[.51,1.10],[.62,.77],[.86,.86],[1.10,.52]],
      [[.65,-.18],[.65,.28],[.85,.30],[1.05,.76]],
      [[.58,.20],[.78,.12],[.78,.60],[1.05,.65]]
    ];
    lines.forEach((pts,i)=>{
      const q=pts.map(([px,py])=>[px*w,py*h]);
      c.beginPath();c.moveTo(q[0][0],q[0][1]);c.bezierCurveTo(...q[1],...q[2],...q[3]);
      c.strokeStyle=dark?`rgba(151,188,240,${i===0?.23:.115})`:`rgba(47,104,190,${i===0?.19:.095})`;
      c.lineWidth=i===0?1.65:1.1;c.stroke();
      if(i===0||i===2){
        const pct=((seconds/(i===0?17:25)+i*.39+it.phase*.09)%1);
        const p=[cubic(q[0][0],q[1][0],q[2][0],q[3][0],pct),cubic(q[0][1],q[1][1],q[2][1],q[3][1],pct)];
        const halo=c.createRadialGradient(p[0],p[1],0,p[0],p[1],15);
        halo.addColorStop(0,`rgba(74,139,234,${dark?.48:.38})`);
        halo.addColorStop(1,'rgba(74,139,234,0)');
        c.fillStyle=halo;c.beginPath();c.arc(p[0],p[1],15,0,Math.PI*2);c.fill();
        c.fillStyle=dark?'#9fc7ff':'#4d90dd';c.beginPath();c.arc(p[0],p[1],2.1,0,Math.PI*2);c.fill();
      }
    });
    const nodes=[[.68,.34],[.79,.49],[.58,.20],[.85,.66]];
    for(const [a,b] of nodes){
      const px=a*w,py=b*h;
      c.strokeStyle=dark?'rgba(163,197,241,.40)':'rgba(49,108,179,.30)';
      c.lineWidth=1;c.beginPath();c.arc(px,py,5.1,0,Math.PI*2);c.stroke();
      c.fillStyle=dark?'rgba(163,197,241,.65)':'rgba(49,108,179,.45)';
      c.beginPath();c.arc(px,py,1.2,0,Math.PI*2);c.fill();
    }
    c.restore();
  }
  mountAll();
  let clock=0,last=0;
  function tick(now){
    requestAnimationFrame(tick);
    if(document.hidden)return;
    if(now-last<(reduce.matches?1400:(coarse.matches?1000/15:1000/25)))return;
    const dt=Math.min(.065,last?(now-last)/1000:.03);last=now;
    if(!reduce.matches)clock+=dt;
    for(const it of entries){if(it.canvas.isConnected&&it.visible)draw(it,clock+it.phase,dt)}
  }
  requestAnimationFrame(tick);
  document.addEventListener('visibilitychange',()=>{last=0});
  const main=document.querySelector('main#main');
  if(main&&'MutationObserver' in window){let queued=false;new MutationObserver(()=>{
    if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mountAll()});
  }).observe(main,{childList:true});}
})();
