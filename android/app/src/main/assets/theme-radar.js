
(function(){
  "use strict";

  var THEMES=[
    {id:"cyber-news",name:"Cyber News",group:"Cyber",accent:"#65f7c4",bg:"#050711",bg2:"#0b1020",panel:"rgba(13,19,36,.86)",panel2:"#11182c",text:"#f5f7ff",muted:"#9ba8c3",line:"rgba(153,179,224,.16)"},
    {id:"modern-news",name:"Modern News",group:"Editorial",accent:"#4f7cff",bg:"#101827",bg2:"#f3f6fb",panel:"rgba(255,255,255,.92)",panel2:"#ffffff",text:"#152038",muted:"#64718a",line:"rgba(31,55,91,.16)"},
    {id:"old-news",name:"Old News",group:"Editorial",accent:"#b78442",bg:"#221a12",bg2:"#392a1c",panel:"rgba(71,50,30,.88)",panel2:"#4a3420",text:"#f8e9c9",muted:"#c9ad83",line:"rgba(230,195,142,.22)"},
    {id:"newspaper-old",name:"Newspaper Old",group:"Editorial",accent:"#8b6b43",bg:"#e7ddc6",bg2:"#c7b99d",panel:"rgba(248,241,224,.92)",panel2:"#f5ecd8",text:"#2b2419",muted:"#766751",line:"rgba(73,57,35,.22)"},
    {id:"interactive-matrix",name:"Interactive Matrix",group:"Digital",accent:"#00ff73",bg:"#020604",bg2:"#07140c",panel:"rgba(2,25,13,.9)",panel2:"#061d10",text:"#d9ffe8",muted:"#72bf8d",line:"rgba(0,255,115,.22)"},
    {id:"cyberpunk",name:"Cyberpunk",group:"Cyber",accent:"#ff4fd8",bg:"#13051b",bg2:"#24113b",panel:"rgba(39,12,58,.9)",panel2:"#32154b",text:"#fff2ff",muted:"#cf9ddd",line:"rgba(255,79,216,.25)"},
    {id:"neon-tokyo",name:"Neon Tokyo",group:"Cyber",accent:"#55d9ff",bg:"#06101a",bg2:"#12233a",panel:"rgba(11,33,53,.9)",panel2:"#122c49",text:"#effcff",muted:"#91c7d9",line:"rgba(85,217,255,.24)"},
    {id:"synthwave",name:"Synthwave",group:"Retro",accent:"#ff78c8",bg:"#160c2b",bg2:"#351145",panel:"rgba(48,17,64,.9)",panel2:"#42175c",text:"#fff1fb",muted:"#d0a5cd",line:"rgba(255,120,200,.24)"},
    {id:"aurora-glass",name:"Aurora Glass",group:"Atmospheric",accent:"#7effd1",bg:"#07151a",bg2:"#152c38",panel:"rgba(30,67,75,.62)",panel2:"rgba(23,54,68,.84)",text:"#effffd",muted:"#9ac7c9",line:"rgba(126,255,209,.24)"},
    {id:"midnight-editorial",name:"Midnight Editorial",group:"Editorial",accent:"#d7b26d",bg:"#101114",bg2:"#20232a",panel:"rgba(33,35,42,.94)",panel2:"#282b33",text:"#f8f3e8",muted:"#aaa49a",line:"rgba(215,178,109,.22)"},
    {id:"solar-flare",name:"Solar Flare",group:"Energy",accent:"#ffad3d",bg:"#271006",bg2:"#55200a",panel:"rgba(88,28,8,.88)",panel2:"#67220a",text:"#fff7e9",muted:"#efbd88",line:"rgba(255,173,61,.25)"},
    {id:"oceanic-signal",name:"Oceanic Signal",group:"Nature",accent:"#44d8ff",bg:"#04131c",bg2:"#073b53",panel:"rgba(6,48,65,.9)",panel2:"#0b4a61",text:"#effcff",muted:"#96c9d7",line:"rgba(68,216,255,.25)"},
    {id:"forest-terminal",name:"Forest Terminal",group:"Nature",accent:"#9aff73",bg:"#07130b",bg2:"#12341d",panel:"rgba(18,54,29,.9)",panel2:"#1a4825",text:"#efffe9",muted:"#a8cf9e",line:"rgba(154,255,115,.24)"},
    {id:"desert-chrome",name:"Desert Chrome",group:"Material",accent:"#f2c27b",bg:"#261d17",bg2:"#58422d",panel:"rgba(84,62,39,.9)",panel2:"#705236",text:"#fff7eb",muted:"#d3b895",line:"rgba(242,194,123,.25)"},
    {id:"crimson-alert",name:"Crimson Alert",group:"Signal",accent:"#ff617b",bg:"#1b070d",bg2:"#3f0d18",panel:"rgba(67,11,25,.9)",panel2:"#551323",text:"#fff1f3",muted:"#dda4ae",line:"rgba(255,97,123,.26)"},
    {id:"violet-quantum",name:"Violet Quantum",group:"Science",accent:"#bf9aff",bg:"#10091e",bg2:"#291354",panel:"rgba(42,20,78,.9)",panel2:"#351c65",text:"#faf5ff",muted:"#c7b4e8",line:"rgba(191,154,255,.26)"},
    {id:"monochrome-wire",name:"Monochrome Wire",group:"Minimal",accent:"#e7edf6",bg:"#0c0e12",bg2:"#20242b",panel:"rgba(30,34,41,.95)",panel2:"#292e37",text:"#f5f7fa",muted:"#aeb6c1",line:"rgba(231,237,246,.22)"},
    {id:"paper-light",name:"Paper Light",group:"Light",accent:"#2764c7",bg:"#edf2f7",bg2:"#ffffff",panel:"rgba(255,255,255,.94)",panel2:"#ffffff",text:"#13223a",muted:"#687894",line:"rgba(39,77,125,.18)"},
    {id:"blueprint",name:"Blueprint",group:"Technical",accent:"#79d7ff",bg:"#09233b",bg2:"#0d4164",panel:"rgba(11,57,87,.9)",panel2:"#104c73",text:"#eaf8ff",muted:"#9bc8dc",line:"rgba(121,215,255,.27)"},
    {id:"holographic",name:"Holographic",group:"Digital",accent:"#d9faff",bg:"#07131b",bg2:"#254256",panel:"rgba(34,75,91,.72)",panel2:"rgba(29,62,82,.88)",text:"#f4ffff",muted:"#a6ced5",line:"rgba(217,250,255,.26)"},
    {id:"retro-crt",name:"Retro CRT",group:"Retro",accent:"#ffb35a",bg:"#111008",bg2:"#2e2710",panel:"rgba(48,39,12,.92)",panel2:"#3a2f0c",text:"#fff3cf",muted:"#d0b77d",line:"rgba(255,179,90,.24)"},
    {id:"high-contrast",name:"High Contrast",group:"Accessibility",accent:"#ffff00",bg:"#000000",bg2:"#111111",panel:"rgba(18,18,18,.98)",panel2:"#171717",text:"#ffffff",muted:"#e0e0e0",line:"rgba(255,255,255,.48)"},
    {id:"arctic-light",name:"Arctic Light",group:"Light",accent:"#007fba",bg:"#e7f4f8",bg2:"#ffffff",panel:"rgba(255,255,255,.95)",panel2:"#ffffff",text:"#102b3c",muted:"#527487",line:"rgba(0,93,135,.18)"},
    {id:"gold-observatory",name:"Gold Observatory",group:"Luxury",accent:"#ffd36a",bg:"#120e08",bg2:"#30210a",panel:"rgba(59,40,8,.9)",panel2:"#4a3108",text:"#fff8dc",muted:"#d6bd83",line:"rgba(255,211,106,.27)"},
    {id:"deep-space",name:"Deep Space",group:"Cosmic",accent:"#8fa8ff",bg:"#02040d",bg2:"#111b42",panel:"rgba(15,24,57,.9)",panel2:"#18265b",text:"#f2f5ff",muted:"#9ba9d0",line:"rgba(143,168,255,.25)"},
    {id:"sunset-newsroom",name:"Sunset Newsroom",group:"Editorial",accent:"#ff8b5c",bg:"#210d12",bg2:"#55220f",panel:"rgba(77,27,21,.9)",panel2:"#662d1c",text:"#fff4e9",muted:"#dda991",line:"rgba(255,139,92,.25)"}
  ];

  var RADAR_KEY="aiNewsRadarPrefsV1";
  var RADAR_SEEN="aiNewsRadarSeenV1";
  var RADAR_INIT="aiNewsRadarInitializedV1";
  var DEFAULT_RADAR={hours:72,mix:"all",max:24,motion:"full",labels:true};
  var radarTimer=null;

  function $(s){return document.querySelector(s)}
  function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])})}
  function readJson(k,f){try{var x=JSON.parse(localStorage.getItem(k)||"");return x&&typeof x==="object"?x:f}catch(e){return f}}
  function writeJson(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function app(){return typeof S!=="undefined"?S:null}
  function theme(id){return THEMES.find(function(x){return x.id===id})||THEMES[0]}
  function radarPrefs(){return Object.assign({},DEFAULT_RADAR,readJson(RADAR_KEY,{}))}
  function isSocial(item){return !!(item&&((item.isSocial===true)||(item.social===true)||/social|reddit|mastodon|bluesky|youtube/i.test(String(item.source||"")+" "+String(item.socialPlatform||""))))}
  function short(v,n){v=String(v||"");return v.length>n?v.slice(0,n-1)+"…":v}
  function hash(v){var h=0;String(v||"").split("").forEach(function(c){h=(h*31+c.charCodeAt(0))>>>0});return h}

  function applyPalette(id){
    var t=theme(id),root=document.documentElement,body=document.body;
    if(!body)return;
    body.dataset.theme=t.id;
    [["--bg",t.bg],["--bg2",t.bg2],["--panel",t.panel],["--panel2",t.panel2],["--text",t.text],["--muted",t.muted],["--line",t.line],["--theme-accent",t.accent]].forEach(function(pair){root.style.setProperty(pair[0],pair[1]);body.style.setProperty(pair[0],pair[1])});
    if(!body.dataset.themeMotion)body.dataset.themeMotion="on";
  }

  function themeOptions(){
    return THEMES.map(function(t){return"<option value='"+t.id+"'>"+esc(t.name)+"</option>"}).join("");
  }
  function themeButtons(target){
    return THEMES.map(function(t){return"<button type='button' class='v34-theme-swatch' data-v34-theme='"+t.id+"' data-v34-theme-target='"+target+"' style='--swatch-bg:"+t.bg+";--swatch-accent:"+t.accent+"'><i></i><span>"+esc(t.name)+"</span></button>"}).join("");
  }
  function syncThemeControls(){
    var s=app();if(!s)return;
    var appId=s.prefs.theme==="cyber"?"cyber-news":(s.prefs.theme||"cyber-news");
    var widgetId=(s.widget&&s.widget.theme)||"cyber-news";
    var select=$("#themePref");if(select){select.innerHTML=themeOptions();select.value=appId}
    var appStudioSelect=$("#v34AppThemePref");if(appStudioSelect){appStudioSelect.innerHTML=themeOptions();appStudioSelect.value=appId}var widgetSelect=$("#widgetThemePref");if(widgetSelect){widgetSelect.innerHTML=themeOptions();widgetSelect.value=widgetId}
    document.querySelectorAll("[data-v34-theme-target='app']").forEach(function(b){b.classList.toggle("active",b.getAttribute("data-v34-theme")===appId)});
    document.querySelectorAll("[data-v34-theme-target='widget']").forEach(function(b){b.classList.toggle("active",b.getAttribute("data-v34-theme")===widgetId)});
    applyPalette(appId);
  }
  function selectTheme(id,target){
    var s=app();if(!s)return;
    var t=theme(id);
    if(target==="widget"){
      s.widget=s.widget||{};
      s.widget.theme=t.id;
      if(typeof persistWidget==="function")persistWidget();else writeJson("widgetPrefs2",s.widget);
    }else{
      s.prefs.theme=t.id;
      if(t.accent)s.prefs.accent=t.accent;
      if(typeof persistPrefs==="function")persistPrefs();else writeJson("prefs2",s.prefs);
    }
    applyPalette(t.id);syncThemeControls();renderRadar();
    if(typeof toast==="function")toast((target==="widget"?"Widget theme: ":"App theme: ")+t.name);
  }

  function insertRadar(){
    if($("#v34RadarModule"))return;
    var metrics=$("#metrics");if(!metrics)return;
    metrics.insertAdjacentHTML("afterend",
      "<section id='v34RadarModule' class='v34-radar-module'>"+
        "<div class='section-title'><div><small>LIVE SIGNAL RADAR</small><h2>New signals in motion</h2></div><button id='v34RadarSettingsBtn' type='button'>Tune ›</button></div>"+
        "<article class='v34-radar-card'>"+
          "<div class='v34-radar-summary'><span id='v34RadarStatus'>SCANNING</span><strong id='v34RadarCount'>0</strong><small id='v34RadarMeta'>news + social · 72h window</small></div>"+
          "<div id='v34RadarStage' class='v34-radar-stage' aria-label='Interactive AI news radar'><div class='v34-radar-cross'></div><div class='v34-radar-sweep'></div><div id='v34RadarPoints'></div><b class='v34-radar-axis axis-n'>NEW</b><b class='v34-radar-axis axis-e'>SOCIAL</b><b class='v34-radar-axis axis-s'>OLDER</b><b class='v34-radar-axis axis-w'>NEWS</b></div>"+
          "<div class='v34-radar-feed'><div class='v34-radar-feed-head'><span>NEWEST SIGNALS</span><span id='v34RadarSocialCount'>0 social</span></div><div id='v34RadarFeed'></div></div>"+
          "<div id='v34RadarSettings' class='v34-radar-settings' hidden><label>Time window<select id='v34RadarHours'><option value='6'>6 hours</option><option value='12'>12 hours</option><option value='24'>24 hours</option><option value='72'>72 hours</option><option value='168'>7 days</option></select></label><label>Signal mix<select id='v34RadarMix'><option value='all'>News + social</option><option value='news'>News only</option><option value='social'>Social only</option></select></label><label>Visible signals<input id='v34RadarMax' type='range' min='8' max='40' step='4' value='24'><span id='v34RadarMaxLabel'>24</span></label><label class='v34-radar-check'><input id='v34RadarLabels' type='checkbox' checked> Labels on radar</label><label class='v34-radar-check'><input id='v34RadarMotion' type='checkbox' checked> Radar sweep animation</label></div>"+
        "</article>"+
      "</section>");
    var p=radarPrefs();
    $("#v34RadarHours").value=String(p.hours);$("#v34RadarMix").value=p.mix;$("#v34RadarMax").value=String(p.max);$("#v34RadarLabels").checked=p.labels!==false;$("#v34RadarMotion").checked=p.motion!=="off";
    $("#v34RadarSettingsBtn").addEventListener("click",function(){var panel=$("#v34RadarSettings");panel.hidden=!panel.hidden;this.textContent=panel.hidden?"Tune ›":"Close tune ×"});
    ["v34RadarHours","v34RadarMix","v34RadarLabels","v34RadarMotion"].forEach(function(id){$("#"+id).addEventListener("change",function(){var next=radarPrefs();if(id==="v34RadarHours")next.hours=Number(this.value);if(id==="v34RadarMix")next.mix=this.value;if(id==="v34RadarLabels")next.labels=this.checked;if(id==="v34RadarMotion")next.motion=this.checked?"full":"off";writeJson(RADAR_KEY,next);renderRadar()})});
    $("#v34RadarMax").addEventListener("input",function(){var next=radarPrefs();next.max=Number(this.value);writeJson(RADAR_KEY,next);$("#v34RadarMaxLabel").textContent=this.value;renderRadar()});
  }

  function insertThemeStudio(){
    if($("#v34ThemeStudio"))return;
    var host=document.querySelector(".settings-page .settings-card");
    if(!host)return;
    host.insertAdjacentHTML("afterend",
      "<section id='v34ThemeStudio' class='settings-card v34-theme-card'><header><span>02</span><div><small>VISUAL SYSTEM</small><h2>Theme Studio · 26 worlds</h2></div></header>"+
      "<div class='v34-theme-intro'>Choose an independent theme for the app and for all home-screen widgets. Your choice stays on this device.</div>"+
      "<div class='v34-theme-select-row'><label>App theme<select id='v34AppThemePref'>"+themeOptions()+"</select></label><label>Widget theme<select id='widgetThemePref'>"+themeOptions()+"</select></label></div>"+
      "<div class='v34-theme-label'>APP THEMES</div><div id='v34AppThemeGrid' class='v34-theme-grid'>"+themeButtons("app")+"</div>"+
      "<div class='v34-theme-label'>WIDGET THEMES</div><div id='v34WidgetThemeGrid' class='v34-theme-grid'>"+themeButtons("widget")+"</div>"+
      "</section>");
    var old=$("#themePref"),appSelect=$("#v34AppThemePref");
    if(old&&appSelect){appSelect.value=old.value==="cyber"?"cyber-news":old.value;old.closest(".setting-row").style.display="none"}
    appSelect.addEventListener("change",function(){selectTheme(this.value,"app")});
    $("#widgetThemePref").addEventListener("change",function(){selectTheme(this.value,"widget")});
  }

  function radarItems(){
    var s=app();if(!s)return[];
    var p=radarPrefs(),cut=Date.now()-Number(p.hours||72)*3600000;
    var list=(s.items||[]).filter(function(i){
      var t=new Date(i.publishedAt||0).getTime();
      if(!t||t<cut)return false;
      if(s.disabledSources&&s.disabledSources.has(i.source))return false;
      var social=isSocial(i);
      return p.mix==="all"||(p.mix==="social"&&social)||(p.mix==="news"&&!social);
    }).sort(function(a,b){return new Date(b.publishedAt)-new Date(a.publishedAt)}).slice(0,Number(p.max||24));
    return list;
  }

  function updateSeen(list){
    var seen=readJson(RADAR_SEEN,{}),initialized=localStorage.getItem(RADAR_INIT)==="1",newCount=0,now=Date.now();
    list.forEach(function(item){if(!seen[item.id]){if(!initialized)newCount++;seen[item.id]=now}});
    if(!initialized)localStorage.setItem(RADAR_INIT,"1");
    var keys=Object.keys(seen);if(keys.length>600)keys=keys.slice(keys.length-600);
    var compact={};keys.forEach(function(k){compact[k]=seen[k]});writeJson(RADAR_SEEN,compact);
    return{seen:seen,newCount:newCount};
  }

  function openSignal(id){
    var s=app(),item=s&&(s.items||[]).find(function(x){return x.id===id});if(!item)return;
    if(typeof native==="function"){native("openExternal",item.url);return}
    try{window.open(item.url,"_blank","noopener,noreferrer")}catch(e){}
  }

  function renderRadar(){
    var stage=$("#v34RadarStage"),points=$("#v34RadarPoints"),feed=$("#v34RadarFeed"),s=app();if(!stage||!points||!feed||!s)return;
    var p=radarPrefs(),list=radarItems(),seenState=updateSeen(list),now=Date.now(),freshHours=Math.min(6,Number(p.hours||72)),socialCount=list.filter(isSocial).length;
    var radius=Math.max(30,Math.min((stage.clientWidth||260)/2-22,132)),html="",feedHtml="";
    list.forEach(function(item,index){
      var age=Math.max(0,now-new Date(item.publishedAt).getTime()),fresh=age<=freshHours*3600000||(seenState.seen[item.id]&&now-seenState.seen[item.id]<900000);
      var angle=(hash(item.id||item.title)%360)*Math.PI/180,dist=radius*(.28+((hash(item.source||"AI")+index*17)%70)/100),x=Math.round(Math.cos(angle)*dist),y=Math.round(Math.sin(angle)*dist);
      var social=isSocial(item),cls="v34-radar-point "+(social?"social":"news")+(fresh?" fresh":"");
      var label=p.labels?(fresh?"NEW":(social?"SOCIAL":"NEWS")):"";
      html+="<button class='"+cls+"' data-v34-radar-story='"+esc(item.id)+"' style='left:calc(50% + "+x+"px);top:calc(50% + "+y+"px)' title='"+esc(item.title)+"'><i></i><span>"+label+"</span></button>";
      if(index<7)feedHtml+="<button class='v34-radar-item "+(fresh?"fresh":"")+"' data-v34-radar-story='"+esc(item.id)+"'><span class='v34-radar-item-type "+(social?"social":"news")+"'>"+(social?"SOCIAL":"NEWS")+"</span><strong>"+esc(short(item.title,120))+"</strong><small>"+esc(item.source||"AI News")+" · "+esc(agoLabel(item.publishedAt))+"</small></button>";
    });
    points.innerHTML=html||"<span class='v34-radar-empty'>No signals in this window</span>";
    feed.innerHTML=feedHtml||"<span class='v34-radar-empty'>Waiting for the next refresh…</span>";
    $("#v34RadarCount").textContent=String(list.length);
    $("#v34RadarSocialCount").textContent=String(socialCount)+" social";
    $("#v34RadarMeta").textContent=(p.mix==="all"?"news + social":p.mix)+" · "+p.hours+"h window · "+new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    $("#v34RadarStatus").textContent=seenState.newCount?"+"+seenState.newCount+" NEW":"LIVE";
    $("#v34RadarMaxLabel").textContent=String(p.max);
    stage.classList.toggle("paused",p.motion==="off");
  }

  function agoLabel(value){
    var t=new Date(value).getTime();if(!t)return"undated";var m=Math.max(0,Math.floor((Date.now()-t)/60000));return m<2?"now":m<60?m+"m":m<1440?Math.floor(m/60)+"h":Math.floor(m/1440)+"d";
  }

  function events(){
    document.addEventListener("click",function(e){
      var themeButton=e.target.closest("[data-v34-theme]");
      if(themeButton){selectTheme(themeButton.getAttribute("data-v34-theme"),themeButton.getAttribute("data-v34-theme-target")||"app");return}
      var story=e.target.closest("[data-v34-radar-story]");
      if(story){openSignal(story.getAttribute("data-v34-radar-story"));return}
    },true);
    var old=$("#themePref");if(old)old.addEventListener("change",function(){var s=app();if(s)applyPalette(s.prefs.theme==="cyber"?"cyber-news":s.prefs.theme)});
  }

  function boot(){
    var s=app();if(!s)return;
    if(s.prefs.theme==="cyber")s.prefs.theme="cyber-news";
    s.widget=s.widget||{};
    if(!s.widget.theme)s.widget.theme="cyber-news";
    insertRadar();insertThemeStudio();syncThemeControls();events();renderRadar();
    clearInterval(radarTimer);radarTimer=setInterval(function(){syncThemeControls();renderRadar()},2500);
    window.addEventListener("resize",renderRadar);
  }

  window.AINewsThemeCatalog=THEMES;
  window.AINewsRadarRender=renderRadar;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
