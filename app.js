const DATA_URL='data/news.json';
const SOURCES_URL='config/sources.json';
const PROVIDERS_URL='config/providers.json';
const AUTO_REFRESH_MS=5*60*1000;
const PAGE_SIZE=18;
const categories=['All','Frontier Models','Products & Agents','Research','Infrastructure','Open Source','Industry','Safety & Security','Compliance & Ethics'];
const trustRank={official:0,primary:1,research:2,governance:2,journalism:3,community:4};

const state={
  items:[],sources:[],providers:[],generatedAt:null,providerCoverage:{},
  category:'All',provider:'all',source:'all',query:'',sort:'newest',savedOnly:false,visible:PAGE_SIZE,
  compact:false,bookmarks:new Set(JSON.parse(localStorage.getItem('aiNewsBookmarks')||'[]')),
  nextRefresh:Date.now()+AUTO_REFRESH_MS,chatArticle:null
};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
const fmtDate=d=>{const x=new Date(d);if(Number.isNaN(x.getTime()))return'Undated';const diff=Date.now()-x.getTime(),h=Math.floor(diff/36e5);if(h<1)return'Just now';if(h<24)return`${h}h ago`;const days=Math.floor(h/24);if(days<7)return`${days}d ago`;return new Intl.DateTimeFormat('en',{day:'2-digit',month:'short',year:'numeric'}).format(x)};
const hueFor=s=>[...String(s||'AI')].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
const providerFor=id=>state.providers.find(p=>p.id===id)||{};
const sourceFor=name=>state.sources.find(s=>s.name===name)||{};
const providerNames=item=>(item.providers||[]).map(id=>providerFor(id).name).filter(Boolean);

function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}
function saveBookmarks(){localStorage.setItem('aiNewsBookmarks',JSON.stringify([...state.bookmarks]))}
async function jsonFetch(url){const r=await fetch(`${url}?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(`${url} unavailable`);return r.json()}

async function loadSources(){const data=await jsonFetch(SOURCES_URL);state.sources=data.sources||[]}
async function loadProviders(){const data=await jsonFetch(PROVIDERS_URL);state.providers=data.providers||[]}
async function loadNewsRaw(){const data=await jsonFetch(DATA_URL);state.items=Array.isArray(data.items)?data.items:[];state.generatedAt=data.generatedAt||null;state.providerCoverage=data.providerCoverage||{};state.nextRefresh=Date.now()+AUTO_REFRESH_MS}
async function refreshNews({manual=false}={}){const btn=$('#refreshBtn');btn.classList.add('loading');try{await loadNewsRaw();state.visible=PAGE_SIZE;renderAll();if(manual)toast(`Updated · ${state.items.length} AI stories`)}catch(err){console.error(err);toast('Refresh failed — keeping the current dataset')}finally{btn.classList.remove('loading')}}

function filteredItems(limit=true){
  let arr=[...state.items];
  if(state.category!=='All')arr=arr.filter(i=>i.category===state.category);
  if(state.provider!=='all')arr=arr.filter(i=>(i.providers||[]).includes(state.provider));
  if(state.source!=='all')arr=arr.filter(i=>i.source===state.source);
  if(state.savedOnly)arr=arr.filter(i=>state.bookmarks.has(i.id));
  if(state.query){const q=state.query.toLowerCase();arr=arr.filter(i=>`${i.title} ${i.summary} ${i.source} ${(i.tags||[]).join(' ')} ${providerNames(i).join(' ')}`.toLowerCase().includes(q))}
  if(state.sort==='source')arr.sort((a,b)=>a.source.localeCompare(b.source)||new Date(b.publishedAt)-new Date(a.publishedAt));
  else if(state.sort==='trust')arr.sort((a,b)=>(trustRank[sourceFor(a.source).class]??9)-(trustRank[sourceFor(b.source).class]??9)||new Date(b.publishedAt)-new Date(a.publishedAt));
  else arr.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
  return limit?arr.slice(0,state.visible):arr;
}

function renderAll(){renderMetrics();renderTicker();renderProviderRail();renderTrends();renderFeatured();renderControls();renderNews();renderSocialGrid();renderSourceMatrix();const d=state.generatedAt?new Date(state.generatedAt):null;$('#syncLabel').textContent=d&&!Number.isNaN(d)?`Dataset ${fmtDate(d)}`:'Dataset ready'}
function renderMetrics(){
  const compliance=state.items.filter(i=>i.category==='Compliance & Ethics').length;
  const primary=state.sources.filter(s=>['primary','official'].includes(s.class)).length;
  $('#metricStories').textContent=state.items.length.toLocaleString();
  $('#metricProviders').textContent=state.providers.length.toLocaleString();
  $('#metricSources').textContent=state.sources.length.toLocaleString();
  $('#metricCompliance').textContent=compliance.toLocaleString();
  $('#metricPrimary').textContent=primary.toLocaleString();
  $('#sourceCountLabel').textContent=`${state.sources.length} CURATED SOURCES`;
}
function renderTicker(){const items=state.items.slice(0,14);const one=items.map(i=>`<a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(i.source)}</strong><span>${esc(i.title)}</span></a>`).join('');$('#ticker').innerHTML=one+one}

function renderProviderRail(){
  const rail=$('#providerRail');
  rail.innerHTML=state.providers.map(p=>{
    const matched=state.items.filter(i=>(i.providers||[]).includes(p.id));
    const latest=matched[0];
    const official=matched.filter(i=>(p.sources||[]).includes(i.source)).length;
    const socialCount=Object.keys(p.social||{}).length;
    return `<article class="provider-card ${state.provider===p.id?'active':''}" data-provider-card="${esc(p.id)}" style="--provider-hue:${hueFor(p.id)}">
      <div class="provider-head"><span class="provider-logo">${esc(p.name.split(/\s|\//).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase())}</span><span class="provider-region">${esc(p.region)}</span></div>
      <h3>${esc(p.name)}</h3><p>${esc(p.models)}</p>
      <div class="provider-stats"><span><strong>${matched.length}</strong> stories</span><span><strong>${official}</strong> first-party</span></div>
      <div class="provider-latest">${latest?`<span>${esc(fmtDate(latest.publishedAt))}</span><strong>${esc(latest.title)}</strong>`:'<span>WATCH</span><strong>Official newsroom tracked</strong>'}</div>
      <div class="provider-actions"><a href="${esc(p.newsroom)}" target="_blank" rel="noopener noreferrer">Newsroom ↗</a><span>${socialCount?`${socialCount} social channel${socialCount>1?'s':''}`:'Official web only'}</span></div>
    </article>`;
  }).join('');
}

function renderTrends(){
  const counts=new Map();
  state.items.slice(0,160).forEach(i=>{(i.tags||[]).forEach(t=>counts.set(t,(counts.get(t)||0)+1));(i.providers||[]).forEach(id=>{const p=providerFor(id);if(p.name)counts.set(p.name,(counts.get(p.name)||0)+1)})});
  const trends=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
  $('#trendList').innerHTML=trends.map(([name,count],idx)=>`<button type="button" data-trend="${esc(name)}"><span>${String(idx+1).padStart(2,'0')}</span><strong>${esc(name)}</strong><i style="--w:${Math.min(100,28+count*4)}%"></i><b>${count}</b></button>`).join('')||'<p class="muted">No trend data yet.</p>';
}

function renderFeatured(){
  const pool=filteredItems(false),i=pool[0]||state.items[0],el=$('#featured');
  if(!i){el.innerHTML='<div class="empty-state">No current item.</div>';return}
  const src=sourceFor(i.source),providers=providerNames(i);
  el.style.setProperty('--feature-hue',hueFor(providers[0]||i.source));
  el.innerHTML=`<div class="feature-visual"><span>TOP SIGNAL</span><strong>${esc((providers[0]||i.source).slice(0,22))}</strong><div class="feature-lines"></div></div>
    <div class="feature-content"><div class="feature-top"><span class="feature-source">${esc(i.source)}</span><span class="feature-index">${esc(i.category)} · ${esc(fmtDate(i.publishedAt))}</span></div>
    <h2>${esc(i.title)}</h2><p>${esc(i.summary||'Open the original source for full context.')}</p>
    <div class="feature-meta">${providers.slice(0,3).map(p=>`<span>${esc(p)}</span>`).join('')}<span>${esc((src.class||i.provenance||'source').replaceAll('_',' '))}</span><div class="feature-actions"><button type="button" data-feature-chat="${esc(i.id)}">✦ Ask AI</button><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">Open original ↗</a></div></div></div>`;
}

function renderControls(){
  const chips=$('#categoryChips');
  chips.innerHTML=categories.map(c=>`<button type="button" class="chip ${state.category===c?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
  const providerSel=$('#providerSelect');providerSel.innerHTML='<option value="all">All providers</option>'+state.providers.map(p=>`<option value="${esc(p.id)}" ${state.provider===p.id?'selected':''}>${esc(p.name)}</option>`).join('');
  const sourceSel=$('#sourceSelect');const names=[...state.sources].sort((a,b)=>a.name.localeCompare(b.name));sourceSel.innerHTML='<option value="all">All sources</option>'+names.map(s=>`<option value="${esc(s.name)}" ${state.source===s.name?'selected':''}>${esc(s.name)}</option>`).join('');
}

function renderNews(){
  const all=filteredItems(false),items=all.slice(0,state.visible),grid=$('#newsGrid'),tpl=$('#newsCardTemplate');grid.innerHTML='';
  document.body.classList.toggle('compact-view',state.compact);
  if(!items.length)grid.innerHTML='<div class="empty-state"><strong>No matching AI stories.</strong><br>Try another provider, category, source or search term.</div>';
  else items.forEach(item=>{
    const node=tpl.content.cloneNode(true),card=node.querySelector('.news-card'),src=sourceFor(item.source),save=node.querySelector('.save-btn'),ask=node.querySelector('.ask-btn'),providers=providerNames(item);
    card.style.setProperty('--card-hue',hueFor(providers[0]||item.source));
    node.querySelector('.preview-category').textContent=item.category;
    node.querySelector('.preview-mark').textContent=(providers[0]||item.source).split(/\s|\//).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase().slice(0,3)||'AI';
    node.querySelector('.source-badge').textContent=item.source;node.querySelector('.category').textContent=item.category;node.querySelector('time').textContent=fmtDate(item.publishedAt);node.querySelector('h3').textContent=item.title;node.querySelector('.summary').textContent=item.summary||'Open the original source for the complete article.';node.querySelector('.provenance').textContent=(src.class||item.provenance||'source').replaceAll('_',' ');
    node.querySelector('.provider-tags').innerHTML=providers.slice(0,3).map(p=>`<span>${esc(p)}</span>`).join('');
    const link=node.querySelector('.card-bottom a');link.href=item.url;
    save.textContent=state.bookmarks.has(item.id)?'★':'☆';save.classList.toggle('saved',state.bookmarks.has(item.id));
    save.addEventListener('click',()=>{state.bookmarks.has(item.id)?state.bookmarks.delete(item.id):state.bookmarks.add(item.id);saveBookmarks();renderNews();toast(state.bookmarks.has(item.id)?'Saved locally':'Removed from saved stories')});
    ask.addEventListener('click',()=>openChat(item));
    grid.appendChild(node);
  });
  $('#resultsLabel').textContent=`${all.length} MATCHING · SHOWING ${Math.min(items.length,all.length)}`;
  $('#activeFilterLabel').textContent=[state.provider!=='all'?providerFor(state.provider).name:null,state.category!=='All'?state.category:null,state.source!=='all'?state.source:null,state.query?`“${state.query}”`:null].filter(Boolean).join(' · ')||'All AI signals';
  $('#loadMoreBtn').hidden=items.length>=all.length;
}

function renderSocialGrid(){
  const cards=[];
  state.providers.forEach(p=>Object.entries(p.social||{}).forEach(([platform,url])=>cards.push({p,platform,url})));
  $('#socialGrid').innerHTML=cards.map(({p,platform,url})=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="social-card ${esc(platform)}"><span class="social-icon">${platform==='linkedin'?'in':platform==='instagram'?'◎':'f'}</span><div><small>${esc(platform.toUpperCase())}</small><strong>${esc(p.name)}</strong><span>Open official profile ↗</span></div></a>`).join('');
}
function renderSourceMatrix(){
  const groups=[['Primary Labs','primary'],['Research','research'],['Journalism','journalism'],['Governance & Standards','official','governance']];
  $('#sourceMatrix').innerHTML=groups.map(([label,...classes])=>{const list=state.sources.filter(s=>classes.includes(s.class));return`<div class="source-group"><h3>${esc(label)} <span>${list.length}</span></h3>${list.map(s=>`<a href="${esc(s.homepage)}" target="_blank" rel="noopener noreferrer"><strong>${esc(s.name)}</strong><span class="${s.feed?'live':'watch'}">${s.feed?'LIVE FEED':'WATCH'}</span></a>`).join('')}</div>`}).join('');
}

function setProvider(id,{scroll=true}={}){state.provider=id||'all';state.visible=PAGE_SIZE;renderProviderRail();renderControls();renderFeatured();renderNews();if(scroll)$('#stream').scrollIntoView({behavior:'smooth',block:'center'})}
function setCategory(category){state.category=category;state.visible=PAGE_SIZE;renderControls();renderFeatured();renderNews();$('#stream').scrollIntoView({behavior:'smooth',block:'center'})}

function openChat(item=null){
  state.chatArticle=item||null;const drawer=$('#chatDrawer');drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('chat-open');
  const ctx=$('#chatContext');
  if(item){ctx.innerHTML=`<span>${esc(item.source)} · ${esc(item.category)}</span><strong>${esc(item.title)}</strong><p>${esc(item.summary||'No excerpt available.')}</p>`}
  else ctx.innerHTML='<span>GLOBAL FEED</span><strong>Ask across the current AI news dataset</strong><p>The built-in research mode works from loaded headlines, excerpts and provider tags.</p>';
  $('#chatMessages').innerHTML='';
  addChat('assistant',item?'Article context loaded. Ask for a summary, related coverage, provider comparisons, or governance implications.':'Current feed loaded. Ask about providers, trends, models, safety, compliance or related coverage.');
  setTimeout(()=>$('#chatInput').focus(),120);
}
function closeChat(){const drawer=$('#chatDrawer');drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('chat-open')}
function addChat(role,text){const wrap=$('#chatMessages'),el=document.createElement('div');el.className=`chat-message ${role}`;const label=document.createElement('span');label.textContent=role==='user'?'YOU':'COPILOT';const p=document.createElement('p');p.textContent=text;el.append(label,p);wrap.appendChild(el);wrap.scrollTop=wrap.scrollHeight}
function tokens(s){return[...new Set(String(s||'').toLowerCase().replace(/[^a-z0-9äöüß.-]+/gi,' ').split(/\s+/).filter(x=>x.length>2&&!['the','and','for','with','this','that','what','about','from','into','und','der','die','das','ein','eine','mit','von','wie','was'].includes(x)))]}
function scoreItem(item,queryTokens){const hay=`${item.title} ${item.summary} ${item.source} ${providerNames(item).join(' ')} ${(item.tags||[]).join(' ')}`.toLowerCase();return queryTokens.reduce((n,t)=>n+(hay.includes(t)?1:0),0)+(state.chatArticle&&item.id===state.chatArticle.id?4:0)}
function localAnswer(question){
  const q=question.toLowerCase(),qTokens=tokens(question);let pool=[...state.items].sort((a,b)=>scoreItem(b,qTokens)-scoreItem(a,qTokens)||new Date(b.publishedAt)-new Date(a.publishedAt));
  if(state.chatArticle)pool=[state.chatArticle,...pool.filter(i=>i.id!==state.chatArticle.id)];
  const related=pool.filter(i=>scoreItem(i,qTokens)>0||i.id===state.chatArticle?.id).slice(0,5);
  if(!related.length)return'I could not find a strong match in the currently loaded headlines and excerpts. Try a provider name, model, policy topic, or select a specific article first.';
  if(/compliance|ethic|risk|safety|regulat|ai act|governance|waico|recht|risiko/.test(q)){
    const gov=state.items.filter(i=>i.category==='Compliance & Ethics'||i.category==='Safety & Security').filter(i=>{const hay=`${i.title} ${i.summary}`.toLowerCase();return qTokens.some(t=>hay.includes(t))||(state.chatArticle?.providers||[]).some(p=>(i.providers||[]).includes(p))}).slice(0,4);
    const base=state.chatArticle?`For “${state.chatArticle.title}”, the excerpt alone does not establish legal compliance. Relevant risk themes should be checked against the original source and applicable rules.`:'The feed treats governance separately from product news; headlines alone are not a legal conclusion.';
    return `${base}${gov.length?` Related governance/safety coverage: ${gov.map(i=>`${i.source}: ${i.title}`).join(' · ')}`:' I found no closely matched governance story in the current dataset.'}`;
  }
  if(/compare|compet|versus|vs|anbieter|provider/.test(q)){
    const byProvider=new Map();related.concat(state.items.slice(0,120)).forEach(i=>(i.providers||[]).forEach(id=>{if(!byProvider.has(id))byProvider.set(id,i)}));
    const picks=[...byProvider.entries()].slice(0,5).map(([id,i])=>`${providerFor(id).name}: ${i.title}`);
    return picks.length?`Current provider signals: ${picks.join(' · ')}. Open the originals before drawing conclusions because this view uses only headlines and brief excerpts.`:'No multi-provider comparison is available in the loaded excerpt set.';
  }
  if(/related|coverage|ähnlich|weitere/.test(q))return`Related coverage in the current feed: ${related.map(i=>`${i.source}: ${i.title}`).join(' · ')}.`;
  const lead=state.chatArticle||related[0];const providers=providerNames(lead);
  return `${lead.title} — ${lead.summary||'No excerpt available.'}${providers.length?` Provider tags: ${providers.join(', ')}.`:''} Related signals: ${related.slice(1,4).map(i=>`${i.source}: ${i.title}`).join(' · ')||'none in the current dataset'}. This answer is based only on the dashboard's loaded headlines and excerpts.`;
}
async function connectedAnswer(question){
  const endpoint=$('#llmEndpoint').value.trim(),model=$('#llmModel').value.trim(),token=$('#llmToken').value;
  if(!endpoint||!model)throw new Error('Add endpoint and model first');
  const context=(state.chatArticle?[state.chatArticle]:filteredItems(false).slice(0,10)).map(i=>`- ${i.title}\n  Source: ${i.source}\n  Excerpt: ${i.summary}\n  URL: ${i.url}`).join('\n');
  const headers={'content-type':'application/json'};if(token)headers.authorization=`Bearer ${token}`;
  const r=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({model,messages:[{role:'system',content:'You are an AI-news research assistant. Answer only from the supplied news context, clearly distinguish facts from inference, do not invent article contents, and encourage checking original sources for high-stakes claims.'},{role:'user',content:`NEWS CONTEXT:\n${context}\n\nQUESTION:\n${question}`}],temperature:0.2})});
  if(!r.ok)throw new Error(`Endpoint returned ${r.status}`);const data=await r.json();return data?.choices?.[0]?.message?.content||data?.output_text||'The endpoint returned no readable answer.';
}
async function submitChat(question){addChat('user',question);const input=$('#chatInput');input.value='';addChat('assistant','Thinking from the current news context…');const pending=$('#chatMessages .chat-message.assistant:last-child p');try{const answer=$('#llmEnabled').checked?await connectedAnswer(question):localAnswer(question);pending.textContent=answer}catch(err){pending.textContent=`Connected LLM unavailable: ${err.message}. Falling back to local research mode. ${localAnswer(question)}`}}

$('#providerRail').addEventListener('click',e=>{if(e.target.closest('a'))return;const card=e.target.closest('[data-provider-card]');if(card)setProvider(card.dataset.providerCard)});
$('#clearProviderBtn').addEventListener('click',()=>setProvider('all', {scroll:false}));
$('#categoryChips').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)setCategory(b.dataset.category)});
$('#providerSelect').addEventListener('change',e=>setProvider(e.target.value,{scroll:false}));
$('#sourceSelect').addEventListener('change',e=>{state.source=e.target.value;state.visible=PAGE_SIZE;renderFeatured();renderNews()});
$('#sortSelect').addEventListener('change',e=>{state.sort=e.target.value;renderNews()});
$('#bookmarksOnly').addEventListener('change',e=>{state.savedOnly=e.target.checked;state.visible=PAGE_SIZE;renderNews()});
$('#searchInput').addEventListener('input',e=>{state.query=e.target.value.trim();state.visible=PAGE_SIZE;renderFeatured();renderNews()});
$('#loadMoreBtn').addEventListener('click',()=>{state.visible+=PAGE_SIZE;renderNews()});
$('#refreshBtn').addEventListener('click',()=>refreshNews({manual:true}));
$('#viewBtn').addEventListener('click',()=>{state.compact=!state.compact;$('#viewBtn').textContent=state.compact?'☷':'▦';renderNews()});
$('#themeBtn').addEventListener('click',()=>{document.documentElement.classList.toggle('light');localStorage.setItem('aiNewsTheme',document.documentElement.classList.contains('light')?'light':'dark')});
$('#chatBtn').addEventListener('click',()=>openChat());$('#heroChatBtn').addEventListener('click',()=>openChat());
$$('[data-close-chat]').forEach(x=>x.addEventListener('click',closeChat));
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.filter)));
$('#featured').addEventListener('click',e=>{const b=e.target.closest('[data-feature-chat]');if(b){const item=state.items.find(i=>i.id===b.dataset.featureChat);if(item)openChat(item)}});
$('#trendList').addEventListener('click',e=>{const b=e.target.closest('[data-trend]');if(!b)return;$('#searchInput').value=b.dataset.trend;state.query=b.dataset.trend;state.visible=PAGE_SIZE;renderFeatured();renderNews();$('#stream').scrollIntoView({behavior:'smooth'})});
$('#randomSignalBtn').addEventListener('click',()=>{const pool=filteredItems(false);if(pool.length)openChat(pool[Math.floor(Math.random()*pool.length)])});
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#chatInput').value.trim();if(q)submitChat(q)});
$('.quick-prompts').addEventListener('click',e=>{const b=e.target.closest('[data-prompt]');if(b)submitChat(b.dataset.prompt)});
$('#commandBtn').addEventListener('click',()=>{$('#searchInput').focus();$('#searchInput').select()});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchInput').focus();$('#searchInput').select()}if(e.key==='Escape'&&$('#chatDrawer').classList.contains('open'))closeChat()});

if(localStorage.getItem('aiNewsTheme')==='light')document.documentElement.classList.add('light');
setInterval(()=>{const remaining=Math.max(0,state.nextRefresh-Date.now()),m=Math.floor(remaining/60000),s=Math.floor((remaining%60000)/1000);$('#refreshCountdown').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;if(remaining<=1000)refreshNews()},1000);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

(async function init(){
  try{await Promise.all([loadSources(),loadProviders(),loadNewsRaw()]);renderAll()}
  catch(err){console.error(err);toast('Some newsroom data could not be loaded');renderAll()}
})();
