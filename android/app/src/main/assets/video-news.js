(()=>{
'use strict';
const REMOTE='https://raw.githubusercontent.com/chekento/Ainews/main/';
const PREF_KEY='aiNewsVideoPrefsV1';
const LANGUAGE_CATALOG=[
  ['de','Deutsch'],['en','English'],['fr','Français'],['es','Español'],['it','Italiano'],
  ['pt','Português'],['nl','Nederlands'],['pl','Polski'],['tr','Türkçe'],['sv','Svenska'],
  ['da','Dansk'],['no','Norsk'],['fi','Suomi'],['cs','Čeština'],['uk','Українська'],
  ['ru','Русский'],['ar','العربية'],['he','עברית'],['hi','हिन्दी'],['id','Bahasa Indonesia'],
  ['vi','Tiếng Việt'],['th','ไทย'],['ja','日本語'],['ko','한국어'],['zh','中文']
];
const LANG_HINT={de:'Deutsch',en:'English',fr:'français',es:'español',it:'italiano',pt:'português',nl:'Nederlands',pl:'polski',tr:'Türkçe',sv:'svenska',da:'dansk',no:'norsk',fi:'suomi',cs:'čeština',uk:'українською',ru:'на русском',ar:'العربية',he:'עברית',hi:'हिन्दी',id:'Bahasa Indonesia',vi:'Tiếng Việt',th:'ภาษาไทย',ja:'日本語',ko:'한국어',zh:'中文'};
const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
const read=(k,f)=>{try{const x=JSON.parse(localStorage.getItem(k)||'');return x??f}catch{return f}};
const systemLang=()=>((navigator.languages&&navigator.languages[0])||navigator.language||'en').toLowerCase().split('-')[0];
const initial=read(PREF_KEY,null);
const prefs=initial&&Array.isArray(initial.languages)?initial:{languages:[systemLang()],active:systemLang(),mode:'related',query:''};
if(!prefs.languages.length)prefs.languages=[systemLang()];
if(!prefs.languages.includes(prefs.active))prefs.active=prefs.languages[0];
const state={news:[],providers:[],social:new Map(),radar:{matches:[]},ready:false};
const save=()=>localStorage.setItem(PREF_KEY,JSON.stringify(prefs));
const youtubeSearch=(q,lang)=>'https://www.youtube.com/results?search_query='+encodeURIComponent([q,LANG_HINT[lang]||lang].filter(Boolean).join(' '));
const cleanTitle=t=>String(t||'').replace(/\s+/g,' ').replace(/[|•·]+.*$/,'').trim();
const articleQuery=i=>{
  const providerNames=(i.providers||[]).map(id=>state.providers.find(p=>p.id===id)?.name).filter(Boolean);
  return [...providerNames.slice(0,2),cleanTitle(i.title)].filter(Boolean).join(' ');
};
const openButton=(url,label,cls='')=>'<button '+(cls?'class="'+cls+'" ':'')+'data-open="'+esc(url)+'">'+label+'</button>';

async function getJson(remote,local){
  try{const r=await fetch(remote+'?v='+Date.now(),{cache:'no-store'});if(r.ok)return await r.json()}catch{}
  try{const r=await fetch(local,{cache:'no-store'});if(r.ok)return await r.json()}catch{}
  return {};
}
async function load(){
  const [news,core,extra,social,radar]=await Promise.all([
    getJson(REMOTE+'data/news.json','news.json'),
    getJson(REMOTE+'config/providers.json','providers.json'),
    getJson(REMOTE+'config/providers-extra.json','providers-extra.json'),
    getJson(REMOTE+'config/social-directory.json','social-directory.json'),
    getJson(REMOTE+'data/video-news.json','video-news.json')
  ]);
  state.news=Array.isArray(news.items)?news.items:[];
  const merged=[...(core.providers||[]),...(extra.providers||[])];
  state.providers=[...new Map(merged.map(p=>[p.id,p])).values()];
  state.social=new Map((social.providers||[]).map(x=>[x.id,x.social||{}]));
  state.radar=radar&&typeof radar==='object'?radar:{matches:[]};
  state.ready=true;
  render();
  decorateNewsCards();
}

function installUI(){
  const tabs=document.querySelector('#swipeTabs');
  const pages=document.querySelector('#pages');
  if(!tabs||!pages||document.querySelector('[data-page="7"]'))return;
  tabs.insertAdjacentHTML('beforeend','<button data-page="7">Video</button>');
  const launcher=document.querySelector('.topic-launcher');
  if(launcher)launcher.insertAdjacentHTML('beforeend','<button data-page="7">▶ Video</button>');
  pages.insertAdjacentHTML('beforeend',`
    <section class="page video-page" data-index="7"><div class="page-inner">
      <div class="page-heading"><span class="eyebrow">YOUTUBE // AI VIDEO RADAR</span><h1>Video News</h1><p>Every scanned AI story gets a YouTube discovery query. Cached web matches, official provider channels and direct YouTube search work together without requiring a YouTube API key.</p></div>
      <section class="video-control-card">
        <div class="video-control-head"><div><small>MULTI-LANGUAGE DISCOVERY</small><strong>Languages</strong></div><button id="videoLangReset">System language</button></div>
        <div id="videoLanguages" class="video-language-grid"></div>
        <div class="video-custom-language"><input id="videoCustomLang" maxlength="12" placeholder="BCP-47 code, e.g. el or ro"><button id="videoAddLang">+ Add</button></div>
        <div class="video-filter-row">
          <label>View<select id="videoMode"><option value="related">Matched to news</option><option value="official">Official providers</option><option value="all">Combined radar</option></select></label>
          <label>Active language<select id="videoActiveLang"></select></label>
        </div>
        <div class="video-search"><span>⌕</span><input id="videoQuery" type="search" placeholder="Filter video topics, providers or sources"><button id="videoQueryClear">×</button></div>
      </section>
      <div id="videoStatus" class="video-status">Loading video radar…</div>
      <section id="videoRelatedSection">
        <div class="section-title"><div><small>NEWS → VIDEO</small><h2>Videos for scanned stories</h2></div><span id="videoMatchCount" class="section-note"></span></div>
        <div id="videoRelated" class="video-news-list"></div>
      </section>
      <section id="videoOfficialSection">
        <div class="section-title"><div><small>ALL PROVIDERS</small><h2>Official & discoverable channels</h2></div><span class="section-note">No fixed shortlist</span></div>
        <div id="videoProviders" class="video-provider-grid"></div>
      </section>
    </div></section>`);
  bindControls();
}
function bindControls(){
  document.querySelector('#videoLangReset')?.addEventListener('click',()=>{prefs.languages=[systemLang()];prefs.active=systemLang();save();render()});
  document.querySelector('#videoAddLang')?.addEventListener('click',()=>{
    const input=document.querySelector('#videoCustomLang');const code=String(input?.value||'').trim().toLowerCase().split('-')[0].replace(/[^a-z]/g,'').slice(0,3);
    if(!code)return;if(!prefs.languages.includes(code))prefs.languages.push(code);prefs.active=code;if(input)input.value='';save();render();
  });
  document.querySelector('#videoMode')?.addEventListener('change',e=>{prefs.mode=e.target.value;save();render()});
  document.querySelector('#videoActiveLang')?.addEventListener('change',e=>{prefs.active=e.target.value;save();render()});
  document.querySelector('#videoQuery')?.addEventListener('input',e=>{prefs.query=e.target.value.trim();save();render()});
  document.querySelector('#videoQueryClear')?.addEventListener('click',()=>{prefs.query='';save();render()});
  document.querySelector('#videoLanguages')?.addEventListener('change',e=>{
    const c=e.target.closest('input[data-video-lang]');if(!c)return;const lang=c.dataset.videoLang;
    if(c.checked){if(!prefs.languages.includes(lang))prefs.languages.push(lang)}else{prefs.languages=prefs.languages.filter(x=>x!==lang);if(!prefs.languages.length)prefs.languages=[systemLang()]}
    if(!prefs.languages.includes(prefs.active))prefs.active=prefs.languages[0];save();render();
  });
}
function renderLanguageControls(){
  const host=document.querySelector('#videoLanguages');if(!host)return;
  const all=[...LANGUAGE_CATALOG];
  prefs.languages.filter(x=>!all.some(y=>y[0]===x)).forEach(x=>all.push([x,x.toUpperCase()]));
  host.innerHTML=all.map(([code,label])=>'<label class="video-lang-chip"><input data-video-lang="'+esc(code)+'" type="checkbox" '+(prefs.languages.includes(code)?'checked':'')+'><span>'+esc(label)+'</span></label>').join('');
  const active=document.querySelector('#videoActiveLang');if(active){active.innerHTML=prefs.languages.map(code=>'<option value="'+esc(code)+'">'+esc((all.find(x=>x[0]===code)||[code,code.toUpperCase()])[1])+'</option>').join('');active.value=prefs.active}
  const mode=document.querySelector('#videoMode');if(mode)mode.value=prefs.mode;
  const q=document.querySelector('#videoQuery');if(q&&q.value!==prefs.query)q.value=prefs.query;
}
function radarMap(){
  const arr=Array.isArray(state.radar.matches)?state.radar.matches:[];
  return new Map(arr.map(x=>[x.articleId,x]));
}
function renderRelated(){
  const host=document.querySelector('#videoRelated');if(!host)return;
  const map=radarMap(),term=prefs.query.toLowerCase();
  let list=state.news.filter(i=>!term||([i.title,i.source,i.category,...(i.providers||[])].join(' ').toLowerCase().includes(term))).slice(0,160);
  const rows=list.map(i=>{
    const match=map.get(i.id),q=articleQuery(i),providers=(i.providers||[]).map(id=>state.providers.find(p=>p.id===id)).filter(Boolean);
    const cached=(match?.results||[]).filter(r=>!r.language||prefs.languages.includes(r.language)||r.language==='und').slice(0,3);
    const official=providers.map(p=>({p,s:state.social.get(p.id)||{}})).filter(x=>x.s.youtube);
    return `<article class="video-story-card">
      <div class="video-story-meta"><span>${esc(i.source)}</span><span>${esc(i.category||'AI')}</span><span>${match?.searchedAt?'INDEXED':'ON-DEMAND'}</span></div>
      <h3>${esc(i.title)}</h3>
      <div class="video-story-actions">
        ${prefs.languages.map(lang=>openButton(youtubeSearch(q,lang),'▶ '+esc(lang.toUpperCase()),lang===prefs.active?'primary':'')).join('')}
        ${official.slice(0,2).map(x=>openButton(x.s.youtube,'◎ '+esc(x.p.name))).join('')}
      </div>
      ${cached.length?'<div class="video-cached-results">'+cached.map(r=>'<button data-open="'+esc(r.url)+'"><small>WEB MATCH · '+esc((r.language||'und').toUpperCase())+'</small><strong>'+esc(r.title||'YouTube video')+'</strong><span>Open on YouTube ↗</span></button>').join('')+'</div>':'<div class="video-no-match">No cached video match yet. Direct YouTube search is ready for every selected language.</div>'}
    </article>`;
  }).join('');
  host.innerHTML=rows||'<div class="empty">No matching AI stories.</div>';
  const c=document.querySelector('#videoMatchCount');if(c)c.textContent=list.length+' stories';
}
function renderProviders(){
  const host=document.querySelector('#videoProviders');if(!host)return;
  const term=prefs.query.toLowerCase();
  const list=state.providers.filter(p=>!term||([p.name,p.models,p.region,...(p.aliases||[])].join(' ').toLowerCase().includes(term)));
  host.innerHTML=list.map(p=>{
    const social=state.social.get(p.id)||{},q=(p.name+' AI official');
    return '<article class="video-provider-card"><div><span class="video-provider-mark">▶</span><div><small>'+esc(p.region||'Global')+'</small><strong>'+esc(p.name)+'</strong><span>'+esc(p.models||'AI provider')+'</span></div></div><div class="video-provider-actions">'+
      (social.youtube?openButton(social.youtube,'Official YouTube','primary'):'')+
      openButton(youtubeSearch(q,prefs.active),social.youtube?'Search videos':'Find channel / videos',social.youtube?'':'primary')+
      '</div></article>';
  }).join('')||'<div class="empty">No providers match.</div>';
}
function render(){
  if(!document.querySelector('.video-page'))installUI();
  renderLanguageControls();
  if(!state.ready)return;
  const related=document.querySelector('#videoRelatedSection'),official=document.querySelector('#videoOfficialSection');
  if(related)related.hidden=prefs.mode==='official';
  if(official)official.hidden=prefs.mode==='related';
  renderRelated();renderProviders();
  const s=document.querySelector('#videoStatus');
  if(s){
    const m=Array.isArray(state.radar.matches)?state.radar.matches:[];
    const matched=m.filter(x=>(x.results||[]).length).length;
    s.textContent='Video radar: '+matched+' cached article matches · '+state.providers.length+' provider ecosystems · '+prefs.languages.map(x=>x.toUpperCase()).join(' + ');
  }
}
function decorateNewsCards(){
  document.querySelectorAll('.news-card').forEach(card=>{
    if(card.dataset.videoDecorated)return;
    const title=card.querySelector('h3')?.textContent?.trim();if(!title)return;
    const item=state.news.find(i=>i.title===title);if(!item)return;
    const actions=card.querySelector('.actions');if(!actions)return;
    const q=articleQuery(item);
    const b=document.createElement('button');b.className='video-card-btn';b.dataset.open=youtubeSearch(q,prefs.active);b.textContent='▶ Video';b.title='Search YouTube for this news story';actions.insertBefore(b,actions.children[1]||null);card.dataset.videoDecorated='1';
  });
}
installUI();
new MutationObserver(()=>{if(state.ready)decorateNewsCards()}).observe(document.documentElement,{childList:true,subtree:true});
load();
})();