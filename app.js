const DATA_URL='data/news.json';
const SOURCES_URL='config/sources.json';
const PROVIDERS_URL='config/providers.json';
const PRODUCTS_URL='config/products.json';
const AUTO_REFRESH_MS=5*60*1000;
const WEB_SESSION_KEY='aiNewsWebSessionV1';
const PAGE_SIZE=18;
const categories=['All','Frontier Models','Products & Agents','Research','Infrastructure','Open Source','Industry','Safety & Security','Compliance & Ethics'];
const trustRank={official:0,primary:1,research:2,governance:2,journalism:3,community:4};
const readStored=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||'');return value==null?fallback:value}catch{return fallback}};
const savedSession=readStored(WEB_SESSION_KEY,{});

const state={
  items:[],sources:[],providers:[],products:[],generatedAt:null,providerCoverage:{},
  category:savedSession.category||'All',provider:savedSession.provider||'all',source:savedSession.source||'all',query:savedSession.query||'',sort:savedSession.sort||'newest',savedOnly:!!savedSession.savedOnly,visible:PAGE_SIZE,
  compact:!!savedSession.compact,bookmarks:new Set(readStored('aiNewsBookmarks',[])),
  nextRefresh:Date.now()+AUTO_REFRESH_MS
};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
const fmtDate=d=>{const x=new Date(d);if(Number.isNaN(x.getTime()))return'Undated';const diff=Date.now()-x.getTime(),h=Math.floor(diff/36e5);if(h<1)return'Just now';if(h<24)return`${h}h ago`;const days=Math.floor(h/24);if(days<7)return`${days}d ago`;return new Intl.DateTimeFormat('en',{day:'2-digit',month:'short',year:'numeric'}).format(x)};
const hueFor=s=>[...String(s||'AI')].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
const providerFor=id=>state.providers.find(p=>p.id===id)||{};
const sourceFor=name=>state.sources.find(s=>s.name===name)||{};
const providerNames=item=>(item.providers||[]).map(id=>providerFor(id).name).filter(Boolean);
window.AINewsWebState=state;
window.AINewsWebRender=()=>renderAll();

function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}
function saveBookmarks(){localStorage.setItem('aiNewsBookmarks',JSON.stringify([...state.bookmarks]))}
function saveWebSession(){try{localStorage.setItem(WEB_SESSION_KEY,JSON.stringify({category:state.category,provider:state.provider,source:state.source,query:state.query,sort:state.sort,savedOnly:state.savedOnly,compact:state.compact}))}catch{}}
async function jsonFetch(url){const r=await fetch(`${url}?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(`${url} unavailable`);return r.json()}

async function loadSources(){const data=await jsonFetch(SOURCES_URL);state.sources=data.sources||[]}
async function loadProviders(){const data=await jsonFetch(PROVIDERS_URL);state.providers=data.providers||[]}
async function loadProducts(){try{const data=await jsonFetch(PRODUCTS_URL);state.products=data.products||[]}catch{state.products=[]}}
async function loadNewsRaw(){const data=await jsonFetch(DATA_URL);state.items=Array.isArray(data.items)?data.items:[];state.generatedAt=data.generatedAt||null;state.providerCoverage=data.providerCoverage||{};state.nextRefresh=Date.now()+AUTO_REFRESH_MS}
async function refreshNews({manual=false}={}){const btn=$('#refreshBtn');btn.classList.add('loading');try{await loadNewsRaw();state.visible=PAGE_SIZE;renderAll();if(manual)toast(`Updated · ${state.items.length} AI stories`)}catch(err){console.error(err);toast('Refresh failed — keeping the current dataset')}finally{btn.classList.remove('loading')}}

function parseNewsQuery(q){
  const parsed={terms:[],neg:[],phrases:[],source:[],provider:[],cat:[],tag:[],type:[],after:null,before:null,is:[]};
  const re=/"([^"]+)"|(\S+)/g;let m;
  while((m=re.exec(q||''))){
    if(m[1]){parsed.phrases.push(m[1].toLowerCase());continue}
    const token=m[2],negative=token.startsWith('-')&&token.length>1,raw=negative?token.slice(1):token;
    const match=raw.match(/^([a-z]+):(.*)$/i);
    if(match){
      const key=match[1].toLowerCase(),value=match[2].trim().toLowerCase();
      if(['source','provider','cat','tag','type','is'].includes(key)&&value)parsed[key].push(value);
      else if(key==='after')parsed.after=value;
      else if(key==='before')parsed.before=value;
      else parsed.terms.push((negative?'-':'')+raw.toLowerCase());
    }else if(negative)parsed.neg.push(raw.toLowerCase());else parsed.terms.push(raw.toLowerCase());
  }
  return parsed;
}
function filteredItems(limit=true){
  const parsed=parseNewsQuery(state.query);
  let arr=[...state.items];
  if(state.category!=='All')arr=arr.filter(i=>i.category===state.category);
  if(state.provider!=='all')arr=arr.filter(i=>(i.providers||[]).includes(state.provider));
  if(state.source!=='all')arr=arr.filter(i=>i.source===state.source);
  if(state.savedOnly)arr=arr.filter(i=>state.bookmarks.has(i.id));
  const textFor=i=>String(i.title||'')+' '+String(i.summary||'')+' '+String(i.source||'')+' '+(i.tags||[]).join(' ')+' '+providerNames(i).join(' ')+' '+String(i.category||'')+' '+String(i.provenance||'');
  if(parsed.neg.length)arr=arr.filter(i=>{const hay=textFor(i).toLowerCase();return !parsed.neg.some(term=>hay.includes(term))});
  if(parsed.phrases.length)arr=arr.filter(i=>{const hay=textFor(i).toLowerCase();return parsed.phrases.every(term=>hay.includes(term))});
  if(parsed.terms.length)arr=arr.filter(i=>{const hay=textFor(i).toLowerCase();return parsed.terms.every(term=>hay.includes(term))});
  if(parsed.source.length)arr=arr.filter(i=>parsed.source.every(term=>String(i.source||'').toLowerCase().includes(term)));
  if(parsed.provider.length)arr=arr.filter(i=>parsed.provider.every(term=>(String((i.providers||[]).join(' '))+' '+providerNames(i).join(' ')).toLowerCase().includes(term)));
  if(parsed.cat.length)arr=arr.filter(i=>parsed.cat.every(term=>String(i.category||'').toLowerCase().includes(term)));
  if(parsed.tag.length)arr=arr.filter(i=>parsed.tag.every(term=>(i.tags||[]).join(' ').toLowerCase().includes(term)));
  if(parsed.type.length)arr=arr.filter(i=>parsed.type.includes(String(sourceFor(i.source).class||i.provenance||'').toLowerCase()));
  if(parsed.is.includes('saved'))arr=arr.filter(i=>state.bookmarks.has(i.id));
  if(parsed.is.includes('primary'))arr=arr.filter(i=>['primary','official'].includes(sourceFor(i.source).class||i.provenance));
  if(parsed.after){const t=Date.parse(parsed.after);if(!Number.isNaN(t))arr=arr.filter(i=>new Date(i.publishedAt).getTime()>=t)}
  if(parsed.before){const t=Date.parse(parsed.before+'T23:59:59');if(!Number.isNaN(t))arr=arr.filter(i=>new Date(i.publishedAt).getTime()<=t)}
  if(state.sort==='source')arr.sort((a,b)=>a.source.localeCompare(b.source)||new Date(b.publishedAt)-new Date(a.publishedAt));
  else if(state.sort==='trust')arr.sort((a,b)=>(trustRank[sourceFor(a.source).class]??9)-(trustRank[sourceFor(b.source).class]??9)||new Date(b.publishedAt)-new Date(a.publishedAt));
  else arr.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
  return limit?arr.slice(0,state.visible):arr;
}

function renderAll(){renderMetrics();renderTicker();renderProviderRail();renderProductWire();renderTrends();renderFeatured();renderControls();renderNews();renderGovernanceNews();renderSocialGrid();renderSourceMatrix();saveWebSession();const d=state.generatedAt?new Date(state.generatedAt):null;$('#syncLabel').textContent=d&&!Number.isNaN(d)?`Dataset ${fmtDate(d)}`:'Dataset ready'}
function renderMetrics(){
  const compliance=state.items.filter(i=>i.category==='Compliance & Ethics').length;
  const primary=state.sources.filter(s=>['primary','official'].includes(s.class)).length;
  $('#metricStories').textContent=state.items.length.toLocaleString();
  $('#metricProviders').textContent=state.providers.length.toLocaleString();
  $('#metricSources').textContent=state.sources.length.toLocaleString();
  $('#metricCompliance').textContent=compliance.toLocaleString();
  $('#metricPrimary').textContent=primary.toLocaleString();
  if($('#metricProducts'))$('#metricProducts').textContent=state.products.length.toLocaleString();
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

function renderProductWire(){
  const host=$('#productGrid');if(!host)return;
  host.innerHTML=state.products.map(p=>{
    const matches=state.items.filter(i=>i.productId===p.id),latest=matches[0],provider=p.providerId?providerFor(p.providerId).name:'Independent product';
    return '<article class="product-card" style="--product-hue:'+hueFor(p.id)+'"><div class="product-card-top"><span>'+esc(p.region||'Global')+'</span><b>'+matches.length+' news</b></div><h3>'+esc(p.name)+'</h3><p>'+esc((p.tags||[]).slice(0,3).join(' · '))+'</p><strong>'+esc(latest?latest.title:'Official product watch enabled')+'</strong><div><span>'+esc(provider)+'</span><a href="'+esc(p.homepage)+'" target="_blank" rel="noopener noreferrer">Official page ↗</a></div></article>';
  }).join('')||'<p class="muted">No product catalog loaded.</p>';
}
function renderGovernanceNews(){
  const host=$('#governanceNewsGrid');if(!host)return;
  const re=/AI czar|AI force|AI task force|special unit|AI Act|AI Office|WAICO|regulat|governance|compliance|ethic|policy|law|standard|rights|NIST|OECD|UNESCO|FTC|Copyright Office|AI safety|AI security/i;
  const list=state.items.filter(i=>i.category==='Compliance & Ethics'||i.category==='Safety & Security'||re.test((i.title||'')+' '+(i.summary||'')+' '+(i.source||'')+' '+(i.tags||[]).join(' '))).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,12);
  host.innerHTML=list.map(i=>'<article class="news-card governance-news-card"><div class="card-body"><div class="card-top"><span class="source-badge">'+esc(i.source)+'</span><time>'+esc(fmtDate(i.publishedAt))+'</time></div><span class="category">'+esc(i.category||'Compliance & Ethics')+'</span><h3>'+esc(i.title)+'</h3><p class="summary">'+esc(i.summary||'Open the original source for full context.')+'</p><div class="provider-tags">'+(i.tags||[]).slice(0,4).map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="card-bottom"><span class="provenance">'+esc(i.provenance||'source')+'</span><div><a href="'+esc(i.url)+'" target="_blank" rel="noopener noreferrer">Original ↗</a></div></div></div></article>').join('')||'<div class="empty-state">No governance signals in the current dataset.</div>';
  if($('#governanceCount'))$('#governanceCount').textContent=list.length+' signals';
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
  el.dataset.storyId=i.id;el.dataset.originalUrl=i.url;
  el.innerHTML=`<div class="feature-visual"><span>TOP SIGNAL</span><strong>${esc((providers[0]||i.source).slice(0,22))}</strong><div class="feature-lines"></div></div>
    <div class="feature-content"><div class="feature-top"><span class="feature-source">${esc(i.source)}</span><span class="feature-index">${esc(i.category)} · ${esc(fmtDate(i.publishedAt))}</span></div>
    <h2>${esc(i.title)}</h2><p>${esc(i.summary||'Open the original source for full context.')}</p>
    <div class="feature-meta">${providers.slice(0,3).map(p=>`<span>${esc(p)}</span>`).join('')}<span>${esc((src.class||i.provenance||'source').replaceAll('_',' '))}</span><div class="feature-actions"><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">Open original ↗</a></div></div></div>`;
}

function renderControls(){
  const chips=$('#categoryChips');
  chips.innerHTML=categories.map(c=>`<button type="button" class="chip ${state.category===c?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
  const providerSel=$('#providerSelect');providerSel.innerHTML='<option value="all">All providers</option>'+state.providers.map(p=>`<option value="${esc(p.id)}" ${state.provider===p.id?'selected':''}>${esc(p.name)}</option>`).join('');
  const sourceSel=$('#sourceSelect');const names=[...state.sources].sort((a,b)=>a.name.localeCompare(b.name));sourceSel.innerHTML='<option value="all">All sources</option>'+names.map(s=>`<option value="${esc(s.name)}" ${state.source===s.name?'selected':''}>${esc(s.name)}</option>`).join('');
  if($('#searchInput'))$('#searchInput').value=state.query;
  if($('#sortSelect'))$('#sortSelect').value=state.sort;
  if($('#bookmarksOnly'))$('#bookmarksOnly').checked=state.savedOnly;
  if($('#viewBtn'))$('#viewBtn').textContent=state.compact?'☷':'▦';
}

function renderNews(){
  const all=filteredItems(false),items=all.slice(0,state.visible),grid=$('#newsGrid'),tpl=$('#newsCardTemplate');grid.innerHTML='';
  document.body.classList.toggle('compact-view',state.compact);
  if(!items.length)grid.innerHTML='<div class="empty-state"><strong>No matching AI stories.</strong><br>Try another provider, category, source or search term.</div>';
  else items.forEach(item=>{
    const node=tpl.content.cloneNode(true),card=node.querySelector('.news-card'),src=sourceFor(item.source),save=node.querySelector('.save-btn'),providers=providerNames(item);
    card.dataset.storyId=item.id;card.dataset.originalUrl=item.url;
    card.style.setProperty('--card-hue',hueFor(providers[0]||item.source));
    node.querySelector('.preview-category').textContent=item.category;
    node.querySelector('.preview-mark').textContent=(providers[0]||item.source).split(/\s|\//).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase().slice(0,3)||'AI';
    node.querySelector('.source-badge').textContent=item.source;node.querySelector('.category').textContent=item.category;node.querySelector('time').textContent=fmtDate(item.publishedAt);node.querySelector('h3').textContent=item.title;node.querySelector('.summary').textContent=item.summary||'Open the original source for the complete article.';node.querySelector('.provenance').textContent=(src.class||item.provenance||'source').replaceAll('_',' ');
    node.querySelector('.provider-tags').innerHTML=providers.slice(0,3).map(p=>`<span>${esc(p)}</span>`).join('');
    const link=node.querySelector('.card-bottom a');link.href=item.url;
    save.textContent=state.bookmarks.has(item.id)?'★':'☆';save.classList.toggle('saved',state.bookmarks.has(item.id));
    save.addEventListener('click',()=>{state.bookmarks.has(item.id)?state.bookmarks.delete(item.id):state.bookmarks.add(item.id);saveBookmarks();renderNews();toast(state.bookmarks.has(item.id)?'Saved locally':'Removed from saved stories')});
    grid.appendChild(node);
  });
  $('#resultsLabel').textContent=`${all.length} MATCHING · SHOWING ${Math.min(items.length,all.length)}`;
  $('#activeFilterLabel').textContent=[state.provider!=='all'?providerFor(state.provider).name:null,state.category!=='All'?state.category:null,state.source!=='all'?state.source:null,state.query?`“${state.query}”`:null].filter(Boolean).join(' · ')||'All AI signals';
  $('#loadMoreBtn').hidden=items.length>=all.length;
}

function renderSocialGrid(){
  const cards=[];
  state.providers.forEach(p=>Object.entries(p.social||{}).forEach(([platform,url])=>cards.push({p,platform,url})));
  const labels={x:'X / TWITTER',linkedin:'LINKEDIN',youtube:'YOUTUBE',instagram:'INSTAGRAM',facebook:'FACEBOOK'};
  const icons={x:'𝕏',linkedin:'in',youtube:'▶',instagram:'◎',facebook:'f'};
  $('#socialGrid').innerHTML=cards.map(({p,platform,url})=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="social-card ${esc(platform)}"><span class="social-icon">${icons[platform]||'↗'}</span><div><small>${esc(labels[platform]||platform.toUpperCase())}</small><strong>${esc(p.name)}</strong><span>Open official profile ↗</span></div></a>`).join('');
}
function renderSourceMatrix(){
  const groups=[['Primary Labs','primary'],['Research','research'],['Journalism','journalism'],['Governance & Standards','official','governance']];
  $('#sourceMatrix').innerHTML=groups.map(([label,...classes])=>{const list=state.sources.filter(s=>classes.includes(s.class));return`<div class="source-group"><h3>${esc(label)} <span>${list.length}</span></h3>${list.map(s=>`<a href="${esc(s.homepage)}" target="_blank" rel="noopener noreferrer"><strong>${esc(s.name)}</strong><span class="${s.feed?'live':'watch'}">${s.feed?'LIVE FEED':'WATCH'}</span></a>`).join('')}</div>`}).join('');
}

function setProvider(id,{scroll=true}={}){state.provider=id||'all';state.visible=PAGE_SIZE;renderProviderRail();renderControls();renderFeatured();renderNews();if(scroll)$('#stream').scrollIntoView({behavior:'smooth',block:'center'})}
function setCategory(category){state.category=category;state.visible=PAGE_SIZE;renderControls();renderFeatured();renderNews();$('#stream').scrollIntoView({behavior:'smooth',block:'center'})}


$('#providerRail').addEventListener('click',e=>{if(e.target.closest('a'))return;const card=e.target.closest('[data-provider-card]');if(card)setProvider(card.dataset.providerCard)});
$('#clearProviderBtn').addEventListener('click',()=>setProvider('all', {scroll:false}));
$('#categoryChips').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)setCategory(b.dataset.category)});
$('#providerSelect').addEventListener('change',e=>setProvider(e.target.value,{scroll:false}));
$('#sourceSelect').addEventListener('change',e=>{state.source=e.target.value;state.visible=PAGE_SIZE;renderFeatured();renderNews();saveWebSession()});
$('#sortSelect').addEventListener('change',e=>{state.sort=e.target.value;renderNews();saveWebSession()});
$('#bookmarksOnly').addEventListener('change',e=>{state.savedOnly=e.target.checked;state.visible=PAGE_SIZE;renderNews();saveWebSession()});
$('#searchInput').addEventListener('input',e=>{state.query=e.target.value.trim();state.visible=PAGE_SIZE;renderFeatured();renderNews();saveWebSession()});
$('#loadMoreBtn').addEventListener('click',()=>{state.visible+=PAGE_SIZE;renderNews()});
$('#refreshBtn').addEventListener('click',()=>refreshNews({manual:true}));
$('#viewBtn').addEventListener('click',()=>{state.compact=!state.compact;$('#viewBtn').textContent=state.compact?'☷':'▦';renderNews();saveWebSession()});
$('#themeBtn').addEventListener('click',()=>{document.documentElement.classList.toggle('light');localStorage.setItem('aiNewsTheme',document.documentElement.classList.contains('light')?'light':'dark');saveWebSession()});
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.filter)));
$('#trendList').addEventListener('click',e=>{const b=e.target.closest('[data-trend]');if(!b)return;$('#searchInput').value=b.dataset.trend;state.query=b.dataset.trend;state.visible=PAGE_SIZE;renderFeatured();renderNews();$('#stream').scrollIntoView({behavior:'smooth'})});
$('#randomSignalBtn').addEventListener('click',()=>{const pool=filteredItems(false),item=pool[Math.floor(Math.random()*pool.length)];if(item)window.open(item.url,'_blank','noopener,noreferrer')});
$('#commandBtn').addEventListener('click',()=>{$('#searchInput').focus();$('#searchInput').select()});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchInput').focus();$('#searchInput').select()}});

if(localStorage.getItem('aiNewsTheme')==='light')document.documentElement.classList.add('light');
setInterval(()=>{const remaining=Math.max(0,state.nextRefresh-Date.now()),m=Math.floor(remaining/60000),s=Math.floor((remaining%60000)/1000);$('#refreshCountdown').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;if(remaining<=1000)refreshNews()},1000);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

(async function init(){
  try{await Promise.all([loadSources(),loadProviders(),loadProducts(),loadNewsRaw()]);renderAll()}
  catch(err){console.error(err);toast('Some newsroom data could not be loaded');renderAll()}
})();

window.addEventListener('beforeunload',saveWebSession);
