(()=>{
  const REMOTE='https://raw.githubusercontent.com/chekento/Ainews/main/';
  const themes=[
    ['FRONTIER MODELS','#07162d','#16dfff','#9b5cff','head'],
    ['AI AGENTS','#07172b','#4ce6ff','#6e7dff','orbit'],
    ['ROBOTICS','#061421','#8fe9ff','#3f73ff','robot'],
    ['INFRASTRUCTURE','#081326','#42d9ff','#ff9a4d','chip'],
    ['RESEARCH','#091329','#c9d6ff','#5c77ff','paper'],
    ['COMPLIANCE','#071522','#ffd77e','#5ecfff','scale'],
    ['SAFETY','#081426','#62eaff','#ff5f78','shield'],
    ['DATA & INSIGHT','#08142b','#37e7ff','#a25cff','chart'],
    ['GLOBAL POLICY','#071629','#69d9ff','#f0b06b','globe'],
    ['AI INDUSTRY','#0a1428','#78c9ff','#ff9c70','city']
  ];
  const categoryIndex={
    'Frontier Models':0,'Products & Agents':1,'Robotics & Embodied AI':2,'Infrastructure':3,'Research':4,
    'Compliance & Ethics':5,'Safety & Security':6,'Open Source':7,'Industry':9
  };
  const escXml=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
  const hash=s=>[...String(s||'')].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
  function motif(type,a,b){
    if(type==='head')return `<path d="M60 208c22-80 67-128 126-144 65 28 94 85 82 157-52 6-92 30-120 72-54-8-86-36-88-85Z" fill="none" stroke="${a}" stroke-width="5"/><g fill="${b}">${[[118,137],[156,104],[202,128],[230,177],[177,195],[132,188]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g><path d="M118 137 156 104 202 128 230 177 177 195 132 188 118 137M156 104l21 91m25-67-70 60" fill="none" stroke="${b}" stroke-width="3" opacity=".8"/>`;
    if(type==='orbit')return `<circle cx="170" cy="165" r="47" fill="#07111e" stroke="${a}" stroke-width="5"/><circle cx="170" cy="165" r="13" fill="${a}"/><ellipse cx="170" cy="165" rx="125" ry="58" fill="none" stroke="${b}" stroke-width="4"/><ellipse cx="170" cy="165" rx="65" ry="128" fill="none" stroke="${a}" stroke-width="3" opacity=".7"/><g fill="${b}"><circle cx="47" cy="165" r="9"/><circle cx="288" cy="165" r="9"/><circle cx="170" cy="38" r="9"/><circle cx="170" cy="292" r="9"/></g>`;
    if(type==='robot')return `<rect x="75" y="72" width="190" height="190" rx="62" fill="#0b1828" stroke="${a}" stroke-width="5"/><rect x="112" y="115" width="116" height="50" rx="25" fill="#05101d" stroke="${b}" stroke-width="3"/><circle cx="145" cy="140" r="11" fill="${a}"/><circle cx="197" cy="140" r="11" fill="${a}"/><path d="M126 207h90M170 72V42m-21 1h42" stroke="${b}" stroke-width="5" stroke-linecap="round"/>`;
    if(type==='chip')return `<rect x="87" y="86" width="166" height="166" rx="22" fill="#0c1930" stroke="${a}" stroke-width="5"/><rect x="119" y="118" width="102" height="102" rx="14" fill="none" stroke="${b}" stroke-width="4"/><path d="M87 116H50m37 35H50m37 36H50m37 35H50M253 116h37m-37 35h37m-37 36h37m-37 35h37M116 86V50m35 36V50m36 36V50m35 36V50M116 252v37m35-37v37m36-37v37m35-37v37" stroke="${a}" stroke-width="4" stroke-linecap="round"/>`;
    if(type==='paper')return `<path d="M84 58h126l52 52v174H84Z" fill="#0b1728" stroke="${a}" stroke-width="5"/><path d="M210 58v53h52M113 150h120M113 184h96M113 218h72" stroke="${b}" stroke-width="5" stroke-linecap="round"/><circle cx="218" cy="230" r="23" fill="none" stroke="${a}" stroke-width="4"/><path d="m234 247 29 29" stroke="${a}" stroke-width="6" stroke-linecap="round"/>`;
    if(type==='scale')return `<path d="M170 55v220M105 86h130M170 55l-22 26h44Z" stroke="${a}" stroke-width="5" fill="none"/><path d="M105 86 66 166h78Zm130 0-39 80h78Z" fill="none" stroke="${b}" stroke-width="4"/><path d="M48 166c8 29 28 43 57 43s49-14 57-43M178 166c8 29 28 43 57 43s49-14 57-43M121 275h98" stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    if(type==='shield')return `<path d="M170 52c45 28 82 38 115 40 0 103-38 164-115 196C93 256 55 195 55 92c33-2 70-12 115-40Z" fill="#0a192a" stroke="${a}" stroke-width="5"/><path d="m116 170 34 34 74-82" fill="none" stroke="${b}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
    if(type==='chart')return `<path d="M58 260V78m0 182h235" stroke="${a}" stroke-width="4"/><path d="M78 232c32-47 54-57 82-35s52-29 80-20 39-53 55-72" fill="none" stroke="${b}" stroke-width="7" stroke-linecap="round"/><g fill="${a}"><circle cx="78" cy="232" r="7"/><circle cx="160" cy="197" r="7"/><circle cx="240" cy="177" r="7"/><circle cx="295" cy="105" r="7"/></g>`;
    if(type==='globe')return `<circle cx="170" cy="165" r="112" fill="#08182a" stroke="${a}" stroke-width="5"/><ellipse cx="170" cy="165" rx="55" ry="112" fill="none" stroke="${b}" stroke-width="3"/><path d="M61 126h218M61 204h218M170 53v224" stroke="${a}" stroke-width="3" opacity=".8"/><path d="M88 85c47 24 111 24 164 0M88 245c47-24 111-24 164 0" fill="none" stroke="${b}" stroke-width="3"/>`;
    return `<path d="M55 263h235M68 263v-66h44v66m13 0V151h53v112m14 0V111h55v152m14 0V181h30v82" fill="#0b1930" stroke="${a}" stroke-width="4"/><path d="M58 95c55 16 105 5 154-23s75-18 92 8" fill="none" stroke="${b}" stroke-width="5" stroke-linecap="round"/>`;
  }
  function placeholder(item){
    let idx=categoryIndex[item?.category];
    if(idx==null)idx=hash(item?.id||item?.title)%10;
    const [label,bg,a,b,type]=themes[idx];
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 420"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#030712"/></linearGradient><filter id="g"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="340" height="420" rx="24" fill="url(#bg)"/><g opacity=".13" stroke="${a}">${Array.from({length:9},(_,i)=>`<path d="M0 ${32+i*42}H340"/>`).join('')}${Array.from({length:8},(_,i)=>`<path d="M${22+i*44} 0V420"/>`).join('')}</g><g transform="translate(0 15)" filter="url(#g)">${motif(type,a,b)}</g><text x="24" y="365" fill="${a}" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2">${escXml(label)}</text><text x="24" y="391" fill="#8797b6" font-family="Arial,sans-serif" font-size="11" letter-spacing="1">AI NEWS // FALLBACK ${idx+1}/10</text></svg>`;
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }
  function safeImage(url){return /^https:\/\/[^\s<>"']+$/i.test(url||'')?url:''}
  let byTitle=new Map();
  async function loadItems(){
    try{let r=await fetch(REMOTE+'data/news.json?media='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;let j=await r.json();byTitle=new Map((j.items||[]).map(i=>[i.title,i]));}
    catch{try{const r=await fetch('news.json');const j=await r.json();byTitle=new Map((j.items||[]).map(i=>[i.title,i]));}catch{}}
    scan();
  }
  function decorate(card,visual){
    if(!card||!visual||visual.dataset.mediaReady)return;
    const title=card.querySelector('h3')?.textContent?.trim();
    const item=byTitle.get(title);
    if(!item)return;
    visual.dataset.mediaReady='1';visual.classList.add('story-media');visual.style.backgroundImage=`url("${placeholder(item)}")`;
    const remote=safeImage(item.image);
    if(remote){const img=document.createElement('img');img.className='story-photo';img.alt='';img.loading='lazy';img.decoding='async';img.src=remote;img.onerror=()=>img.remove();visual.prepend(img);}
  }
  function scan(){
    document.querySelectorAll('.news-card').forEach(card=>decorate(card,card.querySelector('.card-visual')));
    const feature=document.querySelector('.feature-card');if(feature)decorate(feature,feature.querySelector('.feature-visual'));
  }
  const obs=new MutationObserver(scan);obs.observe(document.documentElement,{childList:true,subtree:true});
  const favicon=document.createElement('link');favicon.rel='icon';favicon.type='image/svg+xml';favicon.href='branding/logo-mark.svg';document.head.append(favicon);
  loadItems();
})();
