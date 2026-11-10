/* V18 owner dashboard: never renders statistics until signed in and authorized by server. */
const config = window.JUSTINE_ANALYTICS_CONFIG || {};
const $ = id => document.getElementById(id);
const endpoint = String(config.endpoint || '').trim().replace(/\/$/, '');
const ready = /^https:\/\/[a-z0-9.-]+\/functions\/v1\/portfolio-analytics$/i.test(endpoint) &&
  /^https:\/\/[a-z0-9.-]+$/i.test(String(config.supabaseUrl || '').trim()) &&
  /^(sb_publishable_|eyJ)/.test(String(config.publishableKey || ''));
const formatter = new Intl.NumberFormat('en-PH');
let authClient;
const status = msg => { $('dataStatus').textContent = msg; };
function show(which) { ['setupPanel','authPanel','statsPanel'].forEach(id => { $(id).hidden = id !== which; }); }
function renderList(id, records, label, countKey) {
  const root = $(id); root.replaceChildren();
  if (!Array.isArray(records) || !records.length) {
    const p = document.createElement('p'); p.className='empty';p.textContent='No recorded activity in this period.';root.append(p);return;
  }
  records.forEach(item => {
    const row = document.createElement('div');row.className='ranked-row';
    const l=document.createElement('span');l.className='ranked-label';l.textContent=String(item[label]??'Unknown');
    const v=document.createElement('span');v.className='ranked-number';v.textContent=formatter.format(Number(item[countKey])||0);
    row.append(l,v);root.append(row);
  });
}
function renderChart(daily) {
  const root = $('dailyChart');root.replaceChildren();
  if (!Array.isArray(daily) || !daily.length) {
    const p = document.createElement('p');p.className='empty';p.textContent='No recorded page views in this period.';root.append(p);return;
  }
  const max=Math.max(1,...daily.map(d => Number(d.views)||0));
  daily.forEach((d,i)=>{
    const item=document.createElement('div');item.className='bar-item';
    const bar=document.createElement('div');bar.className='bar';bar.style.height=`${Math.max(2,(Number(d.views)||0)/max*155)}px`;
    bar.title=`${d.day}: ${d.views} page views`;
    const caption=document.createElement('span');caption.textContent=(i%Math.max(1,Math.ceil(daily.length/7))===0) ? String(d.day).slice(5) : '';
    item.append(bar,caption);root.append(item);
  });
}
async function loadStats() {
  const { data: { session } } = await authClient.auth.getSession();
  if (!session?.access_token) { show('authPanel');return; }
  const days=Number($('days').value)||30;
  show('statsPanel');status('Loading verified analytics…');
  try {
    const res=await fetch(`${endpoint}?mode=stats&days=${days}`, {headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});
    if (res.status===401 || res.status===403) {show('authPanel');$('authMessage').textContent='This account is not authorized to view portfolio insights.';return;}
    if (!res.ok) throw new Error('The analytics service is unavailable.');
    const data=await res.json();
    ['pageViews','uniqueSessions','profileViews','resumeDownloads','contactClicks','projectOpens'].forEach(id => {
      const key = id.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      $(id).textContent=formatter.format(Number(data[key])||0);
    });
    renderChart(data.daily);renderList('topPages',data.pages,'path','views');renderList('trafficSources',data.sources,'source','views');
    status(`Actual recorded events · Last ${days} days · Refreshed ${new Intl.DateTimeFormat('en-PH',{dateStyle:'medium',timeStyle:'short'}).format(new Date())}`);
  } catch(e) { status(e.message||'Unable to load verified data.'); }
}
async function init() {
  if (!ready || !location.protocol.startsWith('http')) {show('setupPanel');return;}
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.95.0/+esm');
    authClient=createClient(config.supabaseUrl,config.publishableKey, {auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
    $('email').value=config.ownerEmail||'';
    const {data:{session}}=await authClient.auth.getSession();
    if (session) {$('logout').hidden=false;await loadStats();} else show('authPanel');
    authClient.auth.onAuthStateChange((event,session)=>{
      if (event==='SIGNED_IN' && session) { $('logout').hidden=false;setTimeout(loadStats, 0); }
      if (event==='SIGNED_OUT') { $('logout').hidden=true;show('authPanel'); }
    });
    $('authForm').addEventListener('submit',async ev=>{
      ev.preventDefault();$('authMessage').textContent='Sending sign-in link…';
      const email=$('email').value.trim();
      if (email.toLowerCase() !== String(config.ownerEmail||'').toLowerCase()) {
        $('authMessage').textContent='Use the configured owner email.';return;
      }
      const {error}=await authClient.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.href.split('#')[0].split('?')[0]}});
      $('authMessage').textContent=error ? error.message : 'Sign-in link sent. Check your email.';
    });
    $('logout').addEventListener('click',async()=>{await authClient.auth.signOut();});
    $('days').addEventListener('change',loadStats);$('refresh').addEventListener('click',loadStats);
  } catch {show('authPanel');$('authMessage').textContent='Could not load secure sign-in. Check your internet connection and analytics configuration.';}
}
init();
