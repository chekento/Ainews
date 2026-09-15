(()=>{
  const PRIVACY_URL='https://github.com/chekento/Ainews/blob/main/PRIVACY.md';
  const IMPRESSUM_URL='https://kosch.cloud';
  const SOURCES_URL='https://github.com/chekento/Ainews/blob/main/config/sources.json';
  document.title='AI News 3.1';

  function ext(url){
    try{
      if(window.AndroidBridge&&typeof AndroidBridge.openExternal==='function'){AndroidBridge.openExternal(url);return;}
    }catch{}
    try{window.open(url,'_blank','noopener,noreferrer')}catch{}
  }

  function addLegalSettings(){
    const page=document.querySelector('.settings-page');
    if(!page||document.querySelector('#legalSettings31'))return;
    const reset=page.querySelector('.danger-lite');
    const html=`<section id="legalSettings31" class="settings-card legal-settings"><header><span>06</span><div><small>PRIVACY · SOURCES · LEGAL</small><h2>Privacy & legal</h2></div></header>
      <div class="privacy-summary"><strong>Local-first by default</strong><span>No account · no in-app analytics · no ad SDK · bookmarks and personalization stay on this device.</span></div>
      <div class="legal-actions">
        <button data-legal-open="privacy"><b>Datenschutz & Quellen</b><small>Privacy policy, all 60 sources and 18 provider monitors</small><em>↗</em></button>
        <button data-legal-open="impressum"><b>Impressum / Anbieter</b><small>kosch.cloud</small><em>↗</em></button>
        <button data-legal-open="sources"><b>Source registry</b><small>Machine-readable source matrix on GitHub</small><em>↗</em></button>
      </div>
      <div class="local-data-actions"><button data-clear-ai-local>Clear personalization & Copilot session</button><button data-clear-saved-local>Clear saved stories</button></div>
      <p class="legal-note">Optional external Copilot endpoints receive only the question and selected evidence when you configure and use them. Smart-watch rules remain local.</p>
      <div class="app-identity"><span>AI News 3.1.0</span><span>cloud.kosch.ainews</span></div>
    </section>`;
    if(reset)reset.insertAdjacentHTML('beforebegin',html);else page.insertAdjacentHTML('beforeend',html);
    const resetNum=reset?.querySelector('header>span');if(resetNum)resetNum.textContent='07';
  }

  function improveLabels(){
    const brand=document.querySelector('.brand small');
    if(brand&&!brand.textContent.includes('3.1'))brand.textContent='HYPERINTELLIGENCE · 3.1';
    const source=document.querySelector('#sourceBtn');
    if(source)source.setAttribute('aria-label','Manage AI news sources');
    const watch=document.querySelector('#watchQuery');
    if(watch){watch.setAttribute('autocomplete','off');watch.setAttribute('spellcheck','false');watch.title='Examples: provider:openai agent · cat:Safety DeepSeek · tag:Robotics';}
    document.querySelectorAll('[data-intel]').forEach(b=>{if(!b.title)b.title=`Switch intelligence mode to ${b.textContent.trim()}`;});
  }

  function enhance(){addLegalSettings();improveLabels();}

  document.addEventListener('click',e=>{
    const legal=e.target.closest('[data-legal-open]');
    if(legal){e.preventDefault();e.stopPropagation();const kind=legal.dataset.legalOpen;ext(kind==='privacy'?PRIVACY_URL:kind==='impressum'?IMPRESSUM_URL:SOURCES_URL);return;}

    const providerCard=e.target.closest('#providerGrid [data-provider]');
    if(providerCard){
      // Intelligence 3.0 capture handler has already opened the dossier. Prevent the legacy bubble handler from also jumping to Discover.
      e.stopPropagation();
      return;
    }

    const disable=e.target.closest('#disableAllSources');
    if(disable){
      e.preventDefault();e.stopPropagation();
      if(!confirm('Disable every source? The feed will be empty until you re-enable sources.')){toast('No sources changed');return;}
      S.sources.forEach(s=>S.disabledSources.add(s.name));syncSourcePrefs();render();toast('All sources disabled');return;
    }

    const reset=e.target.closest('#resetSettingsBtn');
    if(reset&&!confirm('Reset interface and widget settings to defaults?')){e.preventDefault();e.stopPropagation();toast('Reset cancelled');return;}

    if(e.target.closest('[data-clear-ai-local]')){
      e.preventDefault();e.stopPropagation();
      if(!confirm('Clear local personalization and the Copilot session on this device?'))return;
      localStorage.removeItem('interestProfile3');localStorage.removeItem('recentSearches');sessionStorage.removeItem('copilotHistory3');
      toast('Local AI profile cleared');setTimeout(()=>location.reload(),450);return;
    }

    if(e.target.closest('[data-clear-saved-local]')){
      e.preventDefault();e.stopPropagation();
      if(!confirm('Remove all saved stories from this device?'))return;
      localStorage.removeItem('saved');try{S.bookmarks.clear();render();}catch{}toast('Saved stories cleared');return;
    }
  },true);

  window.AINewsHandleBack=function(){
    const intel=document.querySelector('#intelModal.open');if(intel){intel.classList.remove('open');return true;}
    const sheet=document.querySelector('.sheet.open');if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');return true;}
    try{const pages=document.querySelector('#pages');if(pages&&pages.clientWidth&&Math.round(pages.scrollLeft/pages.clientWidth)!==0){goPage(0);return true;}}catch{}
    return false;
  };

  window.AINewsOpenWatch=function(query,storyId){
    try{
      S.query=String(query||'').trim();S.time='30d';
      const input=document.querySelector('#searchInput');if(input)input.value=S.query;
      renderFilters();renderNews();goPage(1);
      const story=S.items.find(x=>x.id===storyId);if(story)toast(`Smart Watch · ${story.source}`);else toast('Smart Watch results');
      return true;
    }catch{return false;}
  };

  const mo=new MutationObserver(()=>{clearTimeout(mo._t);mo._t=setTimeout(enhance,60)});
  mo.observe(document.body,{childList:true,subtree:true});
  setTimeout(enhance,120);
})();
