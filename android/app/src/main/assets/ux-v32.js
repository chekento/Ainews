(function(){
  "use strict";
  var VERSION="3.3.0";
  var FILTER_KEY="aiNewsCustomFiltersV33";
  var SOURCE_KEY="aiNewsCustomSourcesV33";
  var SOCIAL_KEY="aiNewsCustomSocialV33";
  var booted=false;
  var feedBusy=false;
  var feedFetchedAt=0;

  function q(s){return document.querySelector(s)}
  function qq(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
  function app(){try{return S}catch(e){return null}}
  function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])})}
  function list(key){try{var v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}}
  function put(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
  function toastV(message){try{toast(message)}catch(e){var el=q("#toast");if(el){el.textContent=message;el.classList.add("show");setTimeout(function(){el.classList.remove("show")},1800)}}}
  function haptic(){try{native("haptic")}catch(e){}}
  function go(index){try{goPage(index)}catch(e){var p=q("#pages");if(p)p.scrollTo({left:index*p.clientWidth,behavior:"smooth"})}}
  function ext(url){if(!url||!/^(https?:)\/\//i.test(url))return;try{native("openExternal",url);return}catch(e){}try{window.open(url,"_blank","noopener,noreferrer")}catch(e){}}
  function state(){return app()}
  function active(){var s=state();try{return activeItems()}catch(e){return s?(s.items||[]):[]}}
  function renderApp(){try{render()}catch(e){try{renderNews();renderFilters()}catch(x){}}setTimeout(renderV32,30)}
  function merge(base,extra,key){var out=[],seen=new Set();(base||[]).concat(extra||[]).forEach(function(x){if(!x||!x[key]||seen.has(x[key]))return;seen.add(x[key]);out.push(x)});return out}
  function customSources(){return list(SOURCE_KEY)}
  function customFilters(){return list(FILTER_KEY)}
  function customSocial(){return list(SOCIAL_KEY)}
  function ensureCustomRegistry(){
    var s=state();if(!s)return false;
    var changed=false,known=new Set((s.sources||[]).map(function(x){return x.name}));
    customSources().forEach(function(x){if(x&&x.name&&!known.has(x.name)){s.sources.push(x);known.add(x.name);changed=true}});
    if(changed){try{syncSourcePrefs()}catch(e){}}
    return changed
  }
  function textNode(node,name){var all=node.getElementsByTagName(name);return all&&all[0]?String(all[0].textContent||"").trim():""}
  function linkNode(node){
    var all=node.getElementsByTagName("link"),i;
    for(i=0;i<all.length;i++){var href=all[i].getAttribute("href");if(href)return href}
    return all&&all[0]?String(all[0].textContent||"").trim():""
  }
  function slug(v){return String(v||"item").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,42)}
  function feedItems(source,xml){
    var doc=new DOMParser().parseFromString(xml,"text/xml");
    var nodes=Array.prototype.slice.call(doc.querySelectorAll("item,entry"));
    return nodes.slice(0,24).map(function(node,index){
      var title=textNode(node,"title");if(!title)return null;
      var url=linkNode(node)||source.homepage||source.feed;
      var summary=textNode(node,"description")||textNode(node,"summary")||textNode(node,"content");
      var date=textNode(node,"pubDate")||textNode(node,"published")||textNode(node,"updated")||new Date().toISOString();
      var stamp=new Date(date).toISOString();
      return{id:"custom-v33:"+slug(source.name)+":"+index+":"+slug(title),title:title,summary:summary.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,420),url:url,source:source.name,publishedAt:stamp,category:(source.tags&&source.tags.some(function(x){return /research|paper/i.test(x)})?"Research":"Industry"),provenance:source.class||"community",aiConfidence:"medium",providers:[],tags:(source.tags||[]).slice(0,8),monitor:false,customSource:true}
    }).filter(Boolean)
  }
  async function fetchOne(source){
    try{var r=await fetch(source.feed+"?v="+Date.now(),{cache:"no-store"});if(!r.ok)return[];return feedItems(source,await r.text())}catch(e){return[]}
  }
  async function fetchCustomFeeds(force){
    var now=Date.now();if(feedBusy||(!force&&now-feedFetchedAt<300000))return;
    var listSources=customSources().filter(function(x){return x&&x.feed});
    if(!listSources.length)return;
    feedBusy=true;feedFetchedAt=now;
    try{
      var batches=await Promise.all(listSources.map(fetchOne)),incoming=[];batches.forEach(function(x){incoming=incoming.concat(x)});
      var s=state();if(!s)return;
      s.items=(s.items||[]).filter(function(x){return String(x.id||"").indexOf("custom-v33:")!==0}).concat(incoming);
      s.items.sort(function(a,b){return new Date(b.publishedAt)-new Date(a.publishedAt)});
      renderApp();
      toastV(incoming.length?("Added "+incoming.length+" custom feed signals"):"Custom feeds checked");
    }finally{feedBusy=false}
  }
  async function loadExtraRegistry(){
    var s=state();if(!s)return;
    try{
      var pair=await Promise.all([
        fetch("config/providers-extra.json?v="+Date.now()).then(function(r){return r.ok?r.json():{providers:[]}}).catch(function(){return{providers:[]}}),
        fetch("config/sources-extra.json?v="+Date.now()).then(function(r){return r.ok?r.json():{sources:[]}}).catch(function(){return{sources:[]}})
      ]);
      var beforeP=(s.providers||[]).length,beforeS=(s.sources||[]).length;
      s.providers=merge(s.providers,pair[0].providers||[],"id");
      s.sources=merge(s.sources,pair[1].sources||[],"name");
      ensureCustomRegistry();
      if(s.providers.length!==beforeP||s.sources.length!==beforeS)renderApp();
      fetchCustomFeeds(true);
    }catch(e){}
  }
  function bar(){
    if(q("#v32Commandbar"))return;
    var appbar=q(".appbar");if(!appbar)return;
    appbar.insertAdjacentHTML("afterend","<nav id=\"v32Commandbar\" class=\"v32-commandbar\" aria-label=\"Command Center\"><button data-v32-page=\"0\" class=\"active\">⌂ Command</button><button data-v32-page=\"1\">⌕ Discover</button><button data-v32-page=\"2\">⬡ LLM Wire</button><button data-v32-page=\"3\">◇ Governance</button><button data-v32-page=\"4\">◎ Social</button><button data-v32-page=\"6\">⚙ Customize</button><span class=\"v32-live\"><i></i><span id=\"v32LiveCount\">LIVE</span></span></nav>");
  }
  function syncBar(index){
    qq("#v32Commandbar [data-v32-page]").forEach(function(b){b.classList.toggle("active",Number(b.getAttribute("data-v32-page"))===index)})
  }
  function overview(){
    var metrics=q("#metrics");if(!metrics||q("#v32Overview"))return;
    metrics.insertAdjacentHTML("afterend","<section id=\"v32Overview\" class=\"v32-overview\"><div class=\"v32-overview-head\"><div><small>COMMAND CENTER · LIVE OVERVIEW</small><strong>Two intelligence widgets, one glance</strong></div><span id=\"v32OverviewMeta\">local + source-first</span></div><div class=\"v32-overview-grid\"><article class=\"v32-overview-card\" data-v32-page=\"1\"><header><span>SIGNAL ATLAS</span><b id=\"v32AtlasCount\">—</b></header><h3>What is moving</h3><p>Category momentum across the current AI-only dataset.</p><div id=\"v32AtlasBars\" class=\"v32-bars\"></div><div class=\"v32-overview-footer\"><span id=\"v32AtlasFoot\">Open Discover</span><strong>EXPLORE ›</strong></div></article><article class=\"v32-overview-card\" data-v32-page=\"2\"><header><span>PROVIDER MATRIX</span><b id=\"v32ProviderCount\">—</b></header><h3>Who is shaping it</h3><p>Provider activity, first-party coverage and live ecosystem signals.</p><div id=\"v32ProviderBars\" class=\"v32-bars\"></div><div class=\"v32-overview-footer\"><span id=\"v32ProviderFoot\">Full provider directory</span><strong>OPEN WIRE ›</strong></div></article></div></section>");
  }
  function renderOverview(){
    var s=state();if(!s)return;
    var items=active(),cats={},providers={};
    items.forEach(function(i){cats[i.category||"AI"]=(cats[i.category||"AI"]||0)+1;(i.providers||[]).forEach(function(id){providers[id]=(providers[id]||0)+1})});
    var catTop=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a]}).slice(0,4),pTop=Object.keys(providers).sort(function(a,b){return providers[b]-providers[a]}).slice(0,4),maxC=cats[catTop[0]]||1,maxP=providers[pTop[0]]||1;
    var cb=q("#v32AtlasBars"),pb=q("#v32ProviderBars");if(cb)cb.innerHTML=catTop.map(function(k){return"<div class=\"v32-bar\"><span>"+esc(k)+"</span><i style=\"--w:"+Math.max(14,Math.round(cats[k]/maxC*100))+"%\"></i><b>"+cats[k]+"</b></div>"}).join("")||"<span class=\"v32-empty-mini\">No signals loaded</span>";
    if(pb)pb.innerHTML=pTop.map(function(id){var p=(s.providers||[]).find(function(x){return x.id===id})||{};return"<div class=\"v32-bar\"><span>"+esc(p.name||id)+"</span><i style=\"--w:"+Math.max(14,Math.round(providers[id]/maxP*100))+"%\"></i><b>"+providers[id]+"</b></div>"}).join("")||"<span class=\"v32-empty-mini\">No provider signals loaded</span>";
    var ac=q("#v32AtlasCount"),pc=q("#v32ProviderCount"),af=q("#v32AtlasFoot"),pf=q("#v32ProviderFoot"),meta=q("#v32OverviewMeta");
    if(ac)ac.textContent=items.length+" signals";if(pc)pc.textContent=(s.providers||[]).length+" ecosystems";if(af)af.textContent=catTop.length+" active desks";if(pf)pf.textContent=(s.sources||[]).length+" registered sources";if(meta)meta.textContent=(s.sources||[]).length+" sources · "+(s.providers||[]).length+" providers";
    var live=q("#v32LiveCount");if(live)live.textContent=items.length+" LIVE";
  }
  function filters(){
    var inner=q(".discover-inner"),search=q(".search-shell");if(!inner||!search||q("#v32FilterStack"))return;
    var detail=document.createElement("div");detail.className="v32-filter-details";
    var stack=document.createElement("div");stack.id="v32FilterStack";stack.className="v32-filter-stack";
    var toggle=document.createElement("button");toggle.id="v32FilterToggle";toggle.className="v32-filter-toggle";toggle.innerHTML="<span>FILTER WORKSPACE</span><span id=\"v32FilterToggleState\">OPEN · search, source, category, provider</span>";
    var ids=[".control-ribbon","#sourceBtn","#activeFilters","#categoryChips",".provider-filter-wrap"];
    ids.forEach(function(sel){var node=q(sel);if(node)detail.appendChild(node)});
    stack.appendChild(search);stack.appendChild(toggle);stack.appendChild(detail);inner.insertBefore(stack,inner.children[1]||null);
    var collapsed=localStorage.getItem("v32FiltersCollapsed")==="1";stack.classList.toggle("v32-collapsed",collapsed);updateToggle();
    if(!q("#v32Workspace"))detail.insertAdjacentHTML("beforeend","<section id=\"v32Workspace\" class=\"v32-workspace\"><header><div><strong>MY FILTERS</strong><small>Save reusable views on this device.</small></div><span class=\"v32-live\"><i></i> LOCAL</span></header><div class=\"v32-workspace-form\"><input id=\"v32FilterName\" placeholder=\"Filter name\"><input id=\"v32FilterQuery\" placeholder=\"e.g. provider:openai cat:Research\"><button class=\"v32-action\" data-v32-filter-save>Save</button></div><div id=\"v32FilterList\" class=\"v32-filter-list\"></div></section>");
  }
  function updateToggle(){var stack=q("#v32FilterStack"),label=q("#v32FilterToggleState");if(!stack||!label)return;var c=stack.classList.contains("v32-collapsed");label.textContent=c?"CLOSED · tap to expand":"OPEN · tap to minimize"}
  function renderFiltersV32(){
    var host=q("#v32FilterList");if(!host)return;var fs=customFilters();
    host.innerHTML=fs.length?fs.map(function(f){return"<button class=\"v32-filter-chip\" data-v32-filter-apply=\""+esc(f.id)+"\"><b>"+esc(f.name)+"</b><em data-v32-filter-delete=\""+esc(f.id)+"\">×</em></button>"}).join(""):"<span class=\"v32-empty-mini\">No saved filters yet. Try provider:, cat:, tag:, after:, before: or is:primary.</span>";
  }
  function applyFilter(f){
    var s=state();if(!s)return;
    s.query=String(f.query||"");s.category="All";s.provider="all";s.source="all";s.provenance="all";s.time="all";
    var input=q("#searchInput");if(input)input.value=s.query;
    renderApp();go(1);toastV("Filter applied · "+f.name);haptic();
  }
  function saveFilter(){
    var n=q("#v32FilterName"),v=q("#v32FilterQuery"),name=n&&n.value.trim(),query=v&&v.value.trim();if(!name||!query){toastV("Add a name and query first");return}
    var fs=customFilters().filter(function(x){return x.name!==name});fs.push({id:"f-"+Date.now(),name:name,query:query});put(FILTER_KEY,fs);if(n)n.value="";if(v)v.value="";renderFiltersV32();toastV("Saved filter · "+name);haptic()
  }
  function deleteFilter(id){put(FILTER_KEY,customFilters().filter(function(x){return x.id!==id}));renderFiltersV32();toastV("Filter removed")}
  function addSourcePanel(){
    var panel=q("#sourceSheet .source-panel");if(!panel||q("#v32SourceExtra"))return;
    panel.insertAdjacentHTML("beforeend","<section id=\"v32SourceExtra\" class=\"v32-source-extra\"><h3>Add a personal source</h3><p>Add an RSS/Atom feed or official homepage. It stays on this device and is fetched only when the feed is reachable.</p><div class=\"v32-source-form\"><input id=\"v32SourceName\" placeholder=\"Source name\"><input id=\"v32SourceRegion\" placeholder=\"Region / language\"><input id=\"v32SourceHomepage\" placeholder=\"Official homepage or profile URL\"><input id=\"v32SourceFeed\" placeholder=\"RSS / Atom feed URL (optional)\"><select id=\"v32SourceClass\"><option value=\"community\">Community / independent</option><option value=\"journalism\">Journalism</option><option value=\"research\">Research</option><option value=\"primary\">Primary lab</option><option value=\"official\">Official institution</option></select><input id=\"v32SourceTags\" placeholder=\"Tags, comma separated\"><button class=\"v32-action\" data-v32-source-save>Save personal source</button></div></section>");
  }
  function saveSource(){
    var name=q("#v32SourceName")?.value.trim(),homepage=q("#v32SourceHomepage")?.value.trim(),feed=q("#v32SourceFeed")?.value.trim(),region=q("#v32SourceRegion")?.value.trim()||"Global",klass=q("#v32SourceClass")?.value||"community",tags=(q("#v32SourceTags")?.value||"").split(",").map(function(x){return x.trim()}).filter(Boolean);
    if(!name||(!homepage&&!feed)){toastV("Add a name and a homepage or feed URL");return}
    if(homepage&&!/^https?:\/\//i.test(homepage))homepage="https://"+homepage;if(feed&&!/^https?:\/\//i.test(feed))feed="https://"+feed;
    var source={name:name,homepage:homepage||feed,feed:feed||null,class:klass,region:region,tags:tags,strictAI:true,custom:true};
    var all=customSources().filter(function(x){return x.name!==name});all.push(source);put(SOURCE_KEY,all);ensureCustomRegistry();renderApp();fetchCustomFeeds(true);toastV("Personal source added · "+name);haptic()
  }
  function addSocialPanel(){
    var page=q('[data-index="4"] .page-inner'),listHost=q("#socialList");if(!page||!listHost||q("#v32SocialExtra"))return;
    listHost.insertAdjacentHTML("afterend","<section id=\"v32SocialExtra\" class=\"v32-social-extra\"><h3>Official channels you choose</h3><p>Store additional official profile links locally. AI News opens the original platform; it does not copy posts or media.</p><div class=\"v32-social-form\"><input id=\"v32SocialLabel\" placeholder=\"Provider or organization\"><select id=\"v32SocialPlatform\"><option value=\"linkedin\">LinkedIn</option><option value=\"x\">X</option><option value=\"youtube\">YouTube</option><option value=\"instagram\">Instagram</option><option value=\"facebook\">Facebook</option><option value=\"mastodon\">Mastodon</option><option value=\"other\">Other official channel</option></select><input id=\"v32SocialUrl\" placeholder=\"https://…\"><button class=\"v32-action\" data-v32-social-save>Save official channel</button></div><div id=\"v32SocialList\" class=\"v32-custom-social-list\"></div></section>");
  }
  function renderSocialV32(){
    var host=q("#v32SocialList");if(!host)return;var a=customSocial();
    host.innerHTML=a.length?a.map(function(x){return"<div class=\"v32-social-row\"><div><strong>"+esc(x.label)+" · "+esc(x.platform)+"</strong><small>"+esc(x.url)+"</small></div><button data-v32-social-delete=\""+esc(x.id)+"\" aria-label=\"Remove official channel\">×</button></div>"}).join(""):"<span class=\"v32-empty-mini\">No personal channels saved yet.</span>";
  }
  function saveSocial(){
    var label=q("#v32SocialLabel")?.value.trim(),platform=q("#v32SocialPlatform")?.value||"other",url=q("#v32SocialUrl")?.value.trim();if(!label||!url){toastV("Add a label and official URL");return}
    if(!/^https?:\/\//i.test(url))url="https://"+url;
    var a=customSocial();a.push({id:"s-"+Date.now(),label:label,platform:platform,url:url});put(SOCIAL_KEY,a);if(q("#v32SocialLabel"))q("#v32SocialLabel").value="";if(q("#v32SocialUrl"))q("#v32SocialUrl").value="";renderSocialV32();toastV("Official channel saved");haptic()
  }
  function deleteSocial(id){put(SOCIAL_KEY,customSocial().filter(function(x){return x.id!==id}));renderSocialV32();toastV("Official channel removed")}
  function addProviderSummary(){
    var page=q('[data-index="2"] .page-inner'),heading=page&&page.querySelector(".page-heading");if(!heading||q("#v32ProviderSummary"))return;
    heading.insertAdjacentHTML("afterend","<div id=\"v32ProviderSummary\" class=\"v32-provider-summary\"><article><small>ECOSYSTEMS</small><strong id=\"v32ProviderTotal\">—</strong><span>core + extended provider directory</span></article><article><small>ACTIVE SIGNALS</small><strong id=\"v32ProviderSignals\">—</strong><span>current enabled feed</span></article><article><small>OFFICIAL COVERAGE</small><strong id=\"v32ProviderOfficial\">—</strong><span>first-party newsroom matches</span></article></div>");
  }
  function renderProviderSummary(){
    var s=state();if(!s)return;var items=active(),official=items.filter(function(i){return i.provenance==="primary"||i.provenance==="official"}).length;
    var a=q("#v32ProviderTotal"),b=q("#v32ProviderSignals"),c=q("#v32ProviderOfficial");if(a)a.textContent=(s.providers||[]).length;if(b)b.textContent=items.length;if(c)c.textContent=official
  }
  function addWidgetSettings(){
    var page=q(".settings-page"),reset=page&&page.querySelector(".danger-lite");if(!page||!reset||q("#v32WidgetSettings"))return;
    reset.insertAdjacentHTML("beforebegin","<section id=\"v32WidgetSettings\" class=\"v32-widget-settings\"><header><h3>Widget overview modes</h3><span class=\"v32-live\"><i></i> TWO OVERVIEWS</span></header><p>Signal Stack shows a compact multi-story overview. Live AI Radar shows a rolling 72-hour category/provider overview. These modes are native Android widget surfaces.</p><div class=\"v32-widget-picks\"><button data-v32-widget-overview=\"stack\"><strong>Signal Stack</strong><span>3 headlines + context</span></button><button data-v32-widget-overview=\"radar\"><strong>Live AI Radar</strong><span>72h activity map</span></button></div></section>");
  }
  function setWidgetOverview(kind){
    var s=state();if(!s)return;s.widget.modes=s.widget.modes||{};
    if(kind==="stack")s.widget.modes.CompactStackWidget="latest";if(kind==="radar")s.widget.modes.LiveRadarWidget="latest";
    try{persistWidget()}catch(e){try{localStorage.setItem("widgetPrefs2",JSON.stringify(s.widget));native("setWidgetSettings",JSON.stringify(s.widget))}catch(x){}}
    try{native("refreshWidgets")}catch(e){}toastV(kind==="stack"?"Signal Stack overview enabled":"Live AI Radar overview enabled");haptic()
  }
  function labels(){
    document.title="AI News 3.3 · UX Command Center";
    var small=q(".brand small");if(small)small.textContent="HYPERINTELLIGENCE · 3.3 BETA";
    var text=q(".settings-page .page-heading p");if(text)text.textContent="Shape the interface, source workspace, watchlists, briefings and all nine home-screen widgets.";
    qq("#swipeTabs [data-page]").forEach(function(b){var labels=["Command","Discover","LLM Wire","Governance","Social Wire","Saved","Settings"];if(labels[Number(b.getAttribute("data-page"))])b.textContent=labels[Number(b.getAttribute("data-page"))]});
  }
  function articleOpen(){
    document.addEventListener("click",function(e){
      var card=e.target.closest(".news-card,.feature-card");if(!card)return;
      if(e.target.closest("button,a,input,select,textarea,[data-page],[data-open],[data-chat],[data-save],[data-score-id],[data-cluster]"))return;
      var s=state(),title=card.querySelector("h3")?.textContent||"",item=s&&s.items&&s.items.find(function(x){return x.title===title});
      if(item){e.preventDefault();e.stopPropagation();ext(item.url);haptic()}
    },true);
  }
  function events(){
    document.addEventListener("click",function(e){
      var page=e.target.closest("[data-v32-page]");if(page){e.preventDefault();e.stopPropagation();go(Number(page.getAttribute("data-v32-page")));syncBar(Number(page.getAttribute("data-v32-page")));haptic();return}
      if(e.target.closest("#v32FilterToggle")){var stack=q("#v32FilterStack");if(stack){stack.classList.toggle("v32-collapsed");localStorage.setItem("v32FiltersCollapsed",stack.classList.contains("v32-collapsed")?"1":"0");updateToggle();haptic()}return}
      var apply=e.target.closest("[data-v32-filter-apply]");if(apply){var id=apply.getAttribute("data-v32-filter-apply"),f=customFilters().find(function(x){return x.id===id});if(f)applyFilter(f);return}
      var del=e.target.closest("[data-v32-filter-delete]");if(del){e.preventDefault();e.stopPropagation();deleteFilter(del.getAttribute("data-v32-filter-delete"));return}
      if(e.target.closest("[data-v32-filter-save]")){e.preventDefault();e.stopPropagation();saveFilter();return}
      if(e.target.closest("#sourceBtn")||e.target.closest("#v32OpenSources")){try{setSheet("#sourceSheet",true)}catch(e){q("#sourceSheet")?.classList.add("open")}return}
      if(e.target.closest("[data-v32-source-save]")){e.preventDefault();e.stopPropagation();saveSource();return}
      if(e.target.closest("[data-v32-social-save]")){e.preventDefault();e.stopPropagation();saveSocial();return}
      var sd=e.target.closest("[data-v32-social-delete]");if(sd){deleteSocial(sd.getAttribute("data-v32-social-delete"));return}
      var wo=e.target.closest("[data-v32-widget-overview]");if(wo){setWidgetOverview(wo.getAttribute("data-v32-widget-overview"));return}
    },true);
    var pages=q("#pages");if(pages)pages.addEventListener("scroll",function(){syncBar(Math.round(pages.scrollLeft/pages.clientWidth))});
    var refresh=q("#refreshBtn");if(refresh)refresh.addEventListener("click",function(){setTimeout(function(){ensureCustomRegistry();fetchCustomFeeds(true);renderV32()},1200),false});
  }
  function renderV32(){ensureCustomRegistry();renderOverview();renderFiltersV32();renderSocialV32();renderProviderSummary();var s=state();var sourceLabel=q("#sourceBtnLabel");if(sourceLabel&&s)sourceLabel.textContent=Math.max(0,(s.sources||[]).length-(s.disabledSources?s.disabledSources.size:0))+"/"+(s.sources||[]).length+" enabled";syncBar(Math.round((q("#pages")?.scrollLeft||0)/(q("#pages")?.clientWidth||1)))}
  function patchRender(){
    try{var previous=render;if(previous&&previous.__v32)return;var wrapped=function(){previous.apply(this,arguments);setTimeout(function(){var changed=ensureCustomRegistry();if(changed)try{previous.apply(this,arguments)}catch(e){}renderV32()},0)};wrapped.__v32=true;render=wrapped}catch(e){}
  }
  function boot(attempt){
    if(booted)return;var s=state();if(!s||!q("#pages")){if(attempt<50)setTimeout(function(){boot(attempt+1)},180);return}
    booted=true;document.body.classList.add("ux-v32");labels();bar();overview();filters();addSourcePanel();addSocialPanel();addProviderSummary();addWidgetSettings();patchRender();ensureCustomRegistry();renderV32();events();articleOpen();loadExtraRegistry();
    setInterval(function(){if(ensureCustomRegistry())renderApp();renderV32()},2500);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){boot(0)});else boot(0);
})();