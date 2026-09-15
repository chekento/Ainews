import fs from 'node:fs';

const readmePath='README.md';
const data=JSON.parse(fs.readFileSync('data/news.json','utf8'));
const readme=fs.readFileSync(readmePath,'utf8');
const items=(data.items||[]).slice(0,12);
const generated=data.generatedAt?new Date(data.generatedAt):new Date();
const stamp=Number.isNaN(generated.getTime())?'latest dataset':generated.toISOString().replace('T',' ').replace(/:\d\d\.\d+Z$/,' UTC');
const esc=s=>String(s??'').replaceAll('|','\\|').replace(/\s+/g,' ').trim();
const rows=items.map((i,n)=>`| ${String(n+1).padStart(2,'0')} | **${esc(i.source)}** | ${esc(i.category)} | ${i.aiConfidence==='high'?'● HIGH':'◐ MED'} | [${esc(i.title)}](${i.url}) |`).join('\n');
const latest=`<!-- LATEST_AI_NEWS:START -->\n## 🔴 Live AI Intelligence\n\n**${data.sourceCount||0} curated sources · ${data.providerCount||0} provider monitors · AI-only filter v${data.filterVersion||3} · snapshot ${stamp}**\n\n| # | Source | Desk | AI relevance | Headline |\n|---:|---|---|---|---|\n${rows}\n\n[→ Full generated dataset](data/news.json) · [→ Source matrix](config/sources.json) · [→ GitHub News portal](portal/news.md)\n\n> The refresh pipeline rejects broad-feed items that do not pass explicit AI relevance checks. RSS-less and temporarily failing AI sources can fall back to domain-scoped monitors.\n<!-- LATEST_AI_NEWS:END -->`;
const widgets=`<!-- ANDROID_WIDGETS:START -->\n## ⚡ Hypercyber Android Widgets\n\nAndroid **2.0** ships eight native home-screen widgets: **Breaking · Primary Signal · LLM Wire · Governance Radar · R&D / Infra · Signal Stack · Neon Matrix · Signal Clock**.\n\nThey share the app's source exclusions and now also support configurable **content mode, accent, text scale, density, summary visibility and metadata visibility**. Every widget reads the live AI-only dataset and falls back to bundled news when offline.\n\n### [⬇ Download AI News Android 2.0](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)\n<!-- ANDROID_WIDGETS:END -->`;
function upsert(text,start,end,block,anchor){
  const a=text.indexOf(start),b=text.indexOf(end);
  if(a>=0&&b>a)return text.slice(0,a)+block+text.slice(b+end.length);
  const at=text.indexOf(anchor);
  if(at>=0)return text.slice(0,at)+block+'\n\n---\n\n'+text.slice(at);
  return block+'\n\n'+text;
}
let out=upsert(readme,'<!-- LATEST_AI_NEWS:START -->','<!-- LATEST_AI_NEWS:END -->',latest,'## 📱 Android 2.0');
out=upsert(out,'<!-- ANDROID_WIDGETS:START -->','<!-- ANDROID_WIDGETS:END -->',widgets,'## 📱 Android 2.0');
fs.writeFileSync(readmePath,out);
console.log(`README refreshed with ${items.length} AI-only stories, ${data.sourceCount||0} sources and Android 2.0 widget controls.`);
