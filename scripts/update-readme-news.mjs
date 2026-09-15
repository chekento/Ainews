import fs from 'node:fs';

const readmePath='README.md';
const dataPath='data/news.json';
const readme=fs.readFileSync(readmePath,'utf8');
const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const items=(data.items||[]).slice(0,10);
const generated=data.generatedAt?new Date(data.generatedAt):new Date();
const stamp=Number.isNaN(generated.getTime())?'latest dataset':generated.toISOString().replace('T',' ').replace(/:\d\d\.\d+Z$/,' UTC');
const esc=s=>String(s??'').replaceAll('|','\\|').replace(/\s+/g,' ').trim();
const rows=items.map((i,n)=>`| ${String(n+1).padStart(2,'0')} | **${esc(i.source)}** | ${esc(i.category)} | [${esc(i.title)}](${i.url}) |`).join('\n');
const latest=`<!-- LATEST_AI_NEWS:START -->\n## 🔴 Latest AI News\n\n**Live snapshot · ${stamp} · refreshed automatically every 30 minutes**\n\n| # | Source | Desk | Headline |\n|---:|---|---|---|\n${rows}\n\n[→ Open the complete generated feed](data/news.json) · [→ Source registry](config/sources.json) · [→ GitHub-native News portal](portal/news.md)\n\n> **Source control:** the Android app provides persistent multi-select source controls. Disabled sources are also excluded from all Android home-screen widgets. GitHub README pages cannot execute JavaScript, so this frontpage snapshot itself remains a combined live feed.\n<!-- LATEST_AI_NEWS:END -->`;
const widgets=`<!-- ANDROID_WIDGETS:START -->\n## ⚡ Android Hypercyber Widgets\n\nThe latest APK includes **8 native Android home-screen widgets**. They fetch the live AI dataset directly, refresh automatically, support manual ↻ refresh and fall back to the dataset bundled in the APK when offline.\n\n` +
`**BREAKING** · **PRIMARY SIGNAL** · **LLM PROVIDER WIRE** · **GOVERNANCE RADAR** · **R&D / INFRA** · **SIGNAL STACK** · **NEON MATRIX** · **SIGNAL CLOCK**\n\nAll eight widgets inherit the source choices made inside the app. Turn a source off once and it disappears from the mobile feed **and** the widgets.\n\n### [⬇ Download AI News Android 1.1](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)\n<!-- ANDROID_WIDGETS:END -->`;
function upsert(text,start,end,block,anchor){
  const a=text.indexOf(start),b=text.indexOf(end);
  if(a>=0&&b>a)return text.slice(0,a)+block+text.slice(b+end.length);
  const at=text.indexOf(anchor);
  if(at>=0)return text.slice(0,at)+block+'\n\n---\n\n'+text.slice(at);
  return block+'\n\n'+text;
}
let out=upsert(readme,'<!-- LATEST_AI_NEWS:START -->','<!-- LATEST_AI_NEWS:END -->',latest,'## 📱 AI News for Android');
out=upsert(out,'<!-- ANDROID_WIDGETS:START -->','<!-- ANDROID_WIDGETS:END -->',widgets,'## 📱 AI News for Android');
fs.writeFileSync(readmePath,out);
console.log(`README updated with ${items.length} latest AI stories and Android widget section.`);
