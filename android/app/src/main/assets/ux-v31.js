(()=>{
  const PRIVACY_URL='https://github.com/chekento/Ainews/blob/main/PRIVACY.md';
  const PRIVACY_SOURCES_URL='https://github.com/chekento/Ainews/blob/main/PRIVACY-SOURCES.md';
  const IMPRESSUM_URL='https://kosch.cloud';
  const CORE_SOURCES_URL='https://github.com/chekento/Ainews/blob/main/config/sources.json';
  const EXTRA_SOURCES_URL='https://github.com/chekento/Ainews/blob/main/config/sources-extra.json';
  const RAW='https://raw.githubusercontent.com/chekento/Ainews/main/';
  const VERSION='3.8.0';
  document.title='AI News 3.8.0 · UX Command Center';

  function ext(url){
    try{if(window.AndroidBridge&&typeof AndroidBridge.openExternal==='function'){AndroidBridge.openExternal(url);return;}}catch{}
    try{window.open(url,'_blank','noopener,noreferrer')}catch{}
  }

  // Discover is navigation, not an implicit request to type. Search receives focus only after an explicit user tap.
  try{
    goPage=function(i){
      const pages=$('#pages');
      pages.scrollTo({left:i*pages.clientWidth,behavior:'smooth'});
      setActive(i);native('haptic');
    };
  }catch{}

  async function readExtra(remote,local){
    try{const r=await fetch(RAW+remote+'?v='+Date.now(),{cache:'no-store'});if(r.ok)return await r.json();}catch{}
    try{const r=await fetch(local,{cache:'no-store'});if(r.ok)return await r.json();}catch{}
    return{};
  }
  function mergeUnique(base,extra,key){const map=new Map();[...(base||[]),...(extra||[])].forEach(x=>{if(x&&x[key]&&!map.has(x[key]))map.set(x[key],x)});return[...map.values()]}
  let extraLoaded=false;
  async function mergeExtendedRegistry(force=false){
    if(extraLoaded&&!force)return;
    const [sd,pd]=await Promise.all([readExtra('config/sources-extra.json','sources-extra.json'),readExtra('config/providers-extra.json','providers-extra.json')]);
    if(sd.sources?.length)S.sources=mergeUnique(S.sources,sd.sources,'name');
    if(pd.providers?.length)S.providers=mergeUnique(S.providers,pd.providers,'id');
    extraLoaded=!!(sd.sources?.length||pd.providers?.length);
    try{render();syncControls();}catch{}
    const pill=document.querySelector('#catalogStatus32');if(pill)pill.textContent=`${S.sources.length} sources · ${S.providers.length} providers`;
  }

  // Keep refresh/auto-refresh on the expanded catalog too.
  try{
    const baseLoad=load;
    load=async function(){await baseLoad();extraLoaded=false;await mergeExtendedRegistry(true)};
    const oldRefresh=document.querySelector('#refreshBtn');
    if(oldRefresh){const fresh=oldRefresh.cloneNode(true);oldRefresh.replaceWith(fresh);fresh.addEventListener('click',()=>load())}
    try{scheduleAutoRefresh()}catch{}
  }catch{}

  const previousVisit=localStorage.getItem('lastVisit32')||'';
  setTimeout(()=>localStorage.setItem('lastVisit32',new Date().toISOString()),2500);

  function addLegalSettings(){
    const page=document.querySelector('.settings-page');
    if(!page||document.querySelector('#legalSettings31'))return;
    const reset=page.querySelector('.danger-lite');
    const html=`<section id="legalSettings31" class="settings-card legal-settings"><header><span>04</span><div><small>PRIVACY · SOURCES · LEGAL</small><h2>Privacy & legal</h2></div></header>
      <div class="privacy-summary"><strong>Local-first by default</strong><span>No account · no in-app analytics · no ad SDK · bookmarks and personalization stay on this device.</span></div>
      <div id="catalogStatus32" class="catalog-status">${S.sources?.length||0} sources · ${S.providers?.length||0} providers</div>
      <div class="legal-actions">
        <button data-legal-open="privacy"><b>Datenschutz / Privacy</b><small>Data flows, permissions, widgets and monitoring</small><em>↗</em></button>
        <button data-legal-open="catalog"><b>All sources & providers</b><small>Full core + extended transparency register</small><em>↗</em></button>
        <button data-legal-open="impressum"><b>Impressum / Anbieter</b><small>kosch.cloud</small><em>↗</em></button>
        <button data-legal-open="core"><b>Core source registry</b><small>Stable machine-readable core matrix</small><em>↗</em></button>
        <button data-legal-open="extra"><b>Extended source registry</b><small>Open-ended international AI source matrix</small><em>↗</em></button>
      </div>
      <div class="local-data-actions"><button data-clear-ai-local>Clear personalization & recent searches</button><button data-clear-saved-local>Clear saved stories</button></div>
      <p class="legal-note">Smart-watch rules and personalization stay on this device; no generative model runtime is bundled.</p>
      <div class="app-identity"><span>AI News ${VERSION} Beta</span><span>cloud.kosch.ainews</span></div>
    </section>`;
    if(reset)reset.insertAdjacentHTML('beforebegin',html);else page.insertAdjacentHTML('beforeend',html);
  }

  const ALL_WIDGETS=['BreakingWidget','TopStoryWidget','ProviderWireWidget','GovernanceWidget','ResearchWidget','CompactStackWidget','NeonMatrixWidget','SignalClockWidget','LiveRadarWidget'];
  function addWidgetStudio(){
    const host=document.querySelector('#widgetModes');if(!host||document.querySelector('#widgetPresets32'))return;
    host.insertAdjacentHTML('beforebegin',`<div id="widgetPresets32" class="studio-presets"><div><strong>Widget Studio presets</strong><small>One tap configures all installed widgets; per-widget modes remain editable below.</small></div><div class="preset-grid"><button data-widget-preset="balanced">Balanced</button><button data-widget-preset="minimal">Minimal</button><button data-widget-preset="dense">Dense</button><button data-widget-preset="models">Models</button><button data-widget-preset="agents">Agents</button><button data-widget-preset="policy">Governance</button><button data-widget-preset="research">Research</button><button data-widget-preset="safety">Safety</button><button data-widget-preset="robotics">Robotics</button></div></div>`);
  }
  function applyWidgetPreset(name){
    const desk=['models','agents','policy','research','safety','robotics'].includes(name)?name:null;
    if(name==='minimal'){S.widget.showSummary=false;S.widget.showMeta=false;S.widget.density='compact';S.widget.textScale=.9}
    else if(name==='dense'){S.widget.showSummary=true;S.widget.showMeta=true;S.widget.density='compact';S.widget.textScale=.9}
    else if(name==='balanced'){S.widget.showSummary=true;S.widget.showMeta=true;S.widget.density='comfortable';S.widget.textScale=1;S.widget.modes={...WIDGET_DEFAULTS.modes,LiveRadarWidget:'latest'}}
    if(desk){S.widget.showSummary=true;S.widget.showMeta=true;S.widget.modes={...(S.widget.modes||{})};ALL_WIDGETS.forEach(k=>S.widget.modes[k]=desk)}
    persistWidget();native('refreshWidgets');
    try{syncControls();renderWidgetModes()}catch{}
    document.querySelectorAll('[data-widget-mode]').forEach(el=>{const v=S.widget.modes?.[el.dataset.widgetMode];if(v)el.value=v});
    toast(`Widget preset: ${name}`);
  }

  function addWatchTemplates(){
    const card=document.querySelector('#watchSettings');if(!card||document.querySelector('#watchTemplates32'))return;
    const create=card.querySelector('.watch-create');
    create?.insertAdjacentHTML('beforebegin',`<div id="watchTemplates32" class="watch-templates"><small>QUICK WATCH TEMPLATES</small><div><button data-watch-template="Frontier release|cat:Frontier Models">Frontier release</button><button data-watch-template="Agent launches|cat:Products & Agents agent">Agents</button><button data-watch-template="EU AI Act|tag:EU AI Act">EU AI Act</button><button data-watch-template="AI safety|cat:Safety & Security">Safety</button><button data-watch-template="Robotics|cat:Robotics & Embodied AI">Robotics</button></div></div>`);
  }

  function addBriefVariants(){
    const card=document.querySelector('#dailyBriefHome');if(!card||document.querySelector('#briefVariants32'))return;
    card.insertAdjacentHTML('afterend',`<div id="briefVariants32" class="brief-variants"><span>SMART BRIEF</span><button data-brief-variant="morning">☀ Morning</button><button data-brief-variant="evening">☾ Evening</button><button data-brief-variant="delta">Δ Since last visit</button></div>`);
  }
  function runBrief(kind){
    localStorage.setItem('briefVariant32',kind);
    window.AINewsIntelligence?.mode('brief');
    goPage(1);
    toast(`Smart brief: ${kind}`);
  }

  function addPersonalizationControls(){
    const page=document.querySelector('.settings-page');if(!page||document.querySelector('#personalize32'))return;
    const intelligence=page.querySelectorAll('.settings-card')[1];
    intelligence?.insertAdjacentHTML('beforeend',`<div id="personalize32" class="personalize32"><button data-open-foryou>✦ Open For You</button><button data-reset-interests>Reset learned interests</button><small>For You learns locally from opened/saved categories, tags, providers and sources. Nothing is uploaded.</small></div>`);
  }

  function improveLabels(){
    const brand=document.querySelector('.brand small');if(brand)brand.textContent=`HYPERINTELLIGENCE · ${VERSION} BETA`;
    const heading=document.querySelector('.settings-page .page-heading p');if(heading)heading.textContent='Shape the interface, intelligence feed, watchlists, briefings and all nine home-screen widgets.';
    const source=document.querySelector('#sourceBtn');if(source)source.setAttribute('aria-label','Manage AI news sources');
    const search=document.querySelector('#searchInput');if(search){search.setAttribute('inputmode','search');search.setAttribute('aria-label','Search AI news');}
    const watch=document.querySelector('#watchQuery');if(watch){watch.setAttribute('autocomplete','off');watch.setAttribute('spellcheck','false');watch.title='Examples: provider:openai agent · cat:Safety DeepSeek · tag:Robotics';}
  }

  function enhance(){addLegalSettings();addWidgetStudio();addWatchTemplates();addBriefVariants();addPersonalizationControls();improveLabels()}

  document.addEventListener('click',e=>{
    const legal=e.target.closest('[data-legal-open]');if(legal){e.preventDefault();e.stopPropagation();const k=legal.dataset.legalOpen;ext(k==='privacy'?PRIVACY_URL:k==='catalog'?PRIVACY_SOURCES_URL:k==='impressum'?IMPRESSUM_URL:k==='extra'?'https://github.com/chekento/Ainews/blob/main/config/sources-extra.json':CORE_SOURCES_URL);return}
    const preset=e.target.closest('[data-widget-preset]');if(preset){e.preventDefault();e.stopPropagation();applyWidgetPreset(preset.dataset.widgetPreset);return}
    const wt=e.target.closest('[data-watch-template]');if(wt){e.preventDefault();e.stopPropagation();const [name,query]=wt.dataset.watchTemplate.split('|');const n=document.querySelector('#watchName'),q=document.querySelector('#watchQuery');if(n)n.value=name;if(q)q.value=query;toast('Watch template loaded');return}
    const brief=e.target.closest('[data-brief-variant]');if(brief){e.preventDefault();e.stopPropagation();runBrief(brief.dataset.briefVariant);return}
    if(e.target.closest('[data-open-foryou]')){e.preventDefault();e.stopPropagation();window.AINewsIntelligence?.mode('foryou');goPage(1);return}
    if(e.target.closest('[data-reset-interests]')){e.preventDefault();e.stopPropagation();if(confirm('Reset the locally learned For You interests on this device?')){localStorage.removeItem('interestProfile3');toast('For You interests reset');setTimeout(()=>location.reload(),350)}return}

    const providerCard=e.target.closest('#providerGrid [data-provider]');if(providerCard){e.stopPropagation();return}
    const disable=e.target.closest('#disableAllSources');if(disable){e.preventDefault();e.stopPropagation();if(!confirm('Disable every source? The feed will be empty until you re-enable sources.')){toast('No sources changed');return}S.sources.forEach(s=>S.disabledSources.add(s.name));syncSourcePrefs();render();toast('All sources disabled');return}
    const reset=e.target.closest('#resetSettingsBtn');if(reset&&!confirm('Reset interface and widget settings to defaults?')){e.preventDefault();e.stopPropagation();toast('Reset cancelled');return}
    if(e.target.closest('[data-clear-ai-local]')){e.preventDefault();e.stopPropagation();if(!confirm('Clear local personalization and recent searches on this device?'))return;localStorage.removeItem('interestProfile3');localStorage.removeItem('recentSearches');toast('Local personalization cleared');setTimeout(()=>location.reload(),450);return}
    if(e.target.closest('[data-clear-saved-local]')){e.preventDefault();e.stopPropagation();if(!confirm('Remove all saved stories from this device?'))return;localStorage.removeItem('saved');try{S.bookmarks.clear();render()}catch{}toast('Saved stories cleared');return}
  },true);

  window.AINewsHandleBack=function(){
    const intel=document.querySelector('#intelModal.open');if(intel){intel.classList.remove('open');return true}
    const sheet=document.querySelector('.sheet.open');if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');return true}
    try{const pages=document.querySelector('#pages');if(pages&&pages.clientWidth&&Math.round(pages.scrollLeft/pages.clientWidth)!==0){goPage(0);return true}}catch{}
    return false;
  };
  window.AINewsOpenWatch=function(query,storyId){try{S.query=String(query||'').trim();S.time='30d';const input=document.querySelector('#searchInput');if(input)input.value=S.query;renderFilters();renderNews();goPage(1);const story=S.items.find(x=>x.id===storyId);toast(story?`Smart Watch · ${story.source}`:'Smart Watch results');return true}catch{return false}};

  const mo=new MutationObserver(()=>{clearTimeout(mo._t);mo._t=setTimeout(enhance,70)});mo.observe(document.body,{childList:true,subtree:true});
  setTimeout(async()=>{await mergeExtendedRegistry();enhance();try{scheduleAutoRefresh()}catch{}},180);
})();
