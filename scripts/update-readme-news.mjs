import fs from 'node:fs';

const readmePath='README.md';
const data=JSON.parse(fs.readFileSync('data/news.json','utf8'));
let out=fs.readFileSync(readmePath,'utf8');
const items=(data.items||[]).slice(0,12);
const generated=data.generatedAt?new Date(data.generatedAt):new Date();
const stamp=Number.isNaN(generated.getTime())?'latest dataset':generated.toISOString().replace('T',' ').replace(/:\d\d\.\d+Z$/,' UTC');
const esc=s=>String(s??'').replaceAll('|','\\|').replace(/\s+/g,' ').trim();
const rows=items.map((i,n)=>`| ${String(n+1).padStart(2,'0')} | **${esc(i.source)}** | ${esc(i.category)} | ${i.image?'🖼️':'◈'} | ${i.aiConfidence==='high'?'● HIGH':'◐ MED'} | [${esc(i.title)}](${i.url}) |`).join('\n');
const latest=`<!-- LATEST_AI_NEWS:START -->\n## 🔴 Live AI Intelligence\n\n**${data.sourceCount||0} registered sources · ${data.providerCount||0} provider monitors · AI-only filter v${data.filterVersion||4} · snapshot ${stamp}**\n\n| # | Source | Desk | Media | AI relevance | Headline |\n|---:|---|---|:---:|---|---|\n${rows}\n\n[→ Full generated dataset](data/news.json) · [→ Core sources](config/sources.json) · [→ Extended sources](config/sources-extra.json) · [→ Full transparency catalog](PRIVACY-SOURCES.md)\n\n> **Image policy:** publisher artwork is used only when it is explicitly exposed in RSS/Atom metadata. No article-page image scraping. The Android/Web UI falls back to bundled AI News visuals when no feed image is available.\n\n> **Beta data-quality note:** automated relevance, categorization, provider matching and summaries can still be incomplete or wrong. Verify important information with the linked original source.\n<!-- LATEST_AI_NEWS:END -->`;
const copilot=`<!-- COPILOT_INTELLIGENCE:START -->\n## ✦ Copilot Intelligence 3.7 · BETA\n\nCopilot is a **contextual intelligence layer**, not a detached chatbot. It follows the selected story, Discover filters, provider context or the full enabled feed and retrieves a source-diverse evidence set across titles, excerpts, tags, providers, categories, provenance and recency.\n\n**Built in:** local API-free discussion mode · evidence cards · primary-source boost · Summary · Why it matters · Compare · Timeline · Risk & policy · Source check · session-only follow-up context · inline Copilot actions · direct Widget → Copilot story summary.

**On-device mode:** optional downloadable Qwen3 0.6B dynamic INT4 model (~328 MB) via LiteRT-LM. After the one-time download, generative Copilot answers run locally without an API key or cloud endpoint.\n\n> Copilot output is experimental. Source grounding reduces error risk but does not eliminate it; inspect the evidence and original publication for important claims.\n\n**[→ Copilot architecture & privacy](portal/copilot.md)**\n<!-- COPILOT_INTELLIGENCE:END -->`;
const productWire=`<!-- PRODUCT_WIRE:START -->
## ◈ Product & Service Wire

The product desk monitors usable AI services separately from general model news: Claude Code, Google Antigravity, Google Flow, Make, Zapier, KNIME, Suno, Udio, Websim.ai and more.

**Tracked:** ${data.productCount||40} products · official product pages · original-link news monitoring · no article mirroring.

**[→ Product registry](config/products.json)** · **[→ Android APK archive](ANDROID-ARCHIVE.md)**
<!-- PRODUCT_WIRE:END -->`;
const intelligence=`<!-- INTELLIGENCE_SUITE:START -->\n## ◉ Intelligence Suite 3.7 — Discover & Expanded Intelligence · BETA\n\nAndroid 3.7 keeps **Latest · For You · High Signal · Story Clusters · Brief** and adds a more deliberate Discover experience: opening Discover no longer focuses the search field or opens the keyboard. Search starts only after an explicit tap.\n\n**New in 3.7:** Social Wire with ${data.providerCount||0} provider ecosystems and official multi-platform links · AI product/service wire for Claude Code, Google Antigravity, Flow, Make, Zapier, KNIME, Suno, Udio, Websim.ai and more · API-free local Copilot discussion · optional downloadable Qwen3 on-device LLM · separate Governance desk for AI czar / AI Force, laws and ethics · interactive radar with Matrix rain · 28 app/widget themes including Kawaii Plush and Kawaii Candy ·  Smart Brief presets for Morning / Evening / Since last visit · quick Smart-Watch templates · Widget Studio presets · direct Widget → Copilot story summary · local For-You reset/control · expanded core+extended source registry · ${data.sourceCount||0} AI sources · ${data.providerCount||0} provider ecosystems.\n\n> **Development status:** this is an active beta/test build. Bugs, incomplete functions and breaking changes are possible. **Use at your own risk / Nutzung auf eigene Gefahr.**\n\n### [⬇ Download AI News Android 3.7 Beta](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)\n<!-- INTELLIGENCE_SUITE:END -->`;
const widgets=`<!-- ANDROID_WIDGETS:START -->\n## ⚡ Hypercyber Android Widgets · BETA\n\nAndroid **3.7** ships nine native home-screen widgets: **Breaking · Primary Signal · LLM Wire · Governance Radar · R&D / Infra · Signal Stack · Neon Matrix · Signal Clock · Live AI Radar**.\n\nWidgets share source exclusions, expose configurable content mode/accent/text scale/density/summary/metadata, support **Next › · ✦ Copilot Summary · Refresh ↻**, and include one-tap **Widget Studio presets** for balanced, minimal, dense and desk-specific setups. The ✦ action passes the currently visible story into Copilot and opens an evidence-grounded summary context.\n\n> Widget refresh timing and rendering can vary by Android device, launcher and battery-management policy. This remains beta functionality.\n\n### [⬇ Download AI News Android 3.7 Beta](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)\n<!-- ANDROID_WIDGETS:END -->`;
function upsert(text,start,end,block,anchor){const a=text.indexOf(start),b=text.indexOf(end);if(a>=0&&b>a)return text.slice(0,a)+block+text.slice(b+end.length);const at=text.indexOf(anchor);if(at>=0)return text.slice(0,at)+block+'\n\n---\n\n'+text.slice(at);return block+'\n\n'+text}
out=upsert(out,'<!-- LATEST_AI_NEWS:START -->','<!-- LATEST_AI_NEWS:END -->',latest,'## 🧭 Signal Deck');
out=upsert(out,'<!-- COPILOT_INTELLIGENCE:START -->','<!-- COPILOT_INTELLIGENCE:END -->',copilot,'## 📱 Android');
out=upsert(out,'<!-- INTELLIGENCE_SUITE:START -->','<!-- INTELLIGENCE_SUITE:END -->',intelligence,'## 📱 Android');
out=upsert(out,'<!-- PRODUCT_WIRE:START -->','<!-- PRODUCT_WIRE:END -->',productWire,'## 🧭 Signal Deck');
out=upsert(out,'<!-- ANDROID_WIDGETS:START -->','<!-- ANDROID_WIDGETS:END -->',widgets,'## 🧠 AI-only ingestion');
out=out.replace(/DOWNLOAD_ANDROID_[0-9.]+(?:_BETA)?/g,'DOWNLOAD_ANDROID_3.7_BETA')
  .replace(/CURRENT APK — ANDROID [0-9.]+ BETA/g,'CURRENT APK — ANDROID 3.7 BETA')
  .replace(/### 📱 ANDROID [0-9.]+ BETA/g,'### 📱 ANDROID 3.7 BETA')
  .replace(/## 📱 Android [0-9.]+[^\n]*/g,'## 📱 Android 3.7 Beta — Discover & Expanded Intelligence')
  .replace(/AI News Android [0-9.]+(?: Beta)?/g,'AI News Android 3.7 Beta')
  .replace(/Android \*\*[0-9.]+\*\*/g,'Android **3.7**')
  .replace(/Source-first · \d+ curated AI sources · \d+ provider monitors/g,`Source-first · ${data.sourceCount||0} registered AI sources · ${data.providerCount||0} provider monitors`)
  .replace(/badge\/\d+_AI_SOURCES-/g,`badge/${data.sourceCount||0}_AI_SOURCES-`)
  .replace(/alt="\d+ AI sources"/g,`alt="${data.sourceCount||0} AI sources"`)
  .replace(/badge\/\d+_(?:LLM_ECOSYSTEMS|AI_PROVIDER_ECOSYSTEMS)-/g,`badge/${data.providerCount||0}_AI_PROVIDER_ECOSYSTEMS-`)
  .replace(/alt="\d+ (?:LLM|AI) providers"/g,`alt="${data.providerCount||0} AI providers"`);
const legal=`<p align="center">\n  <a href="PRIVACY.md"><strong>🔐 Datenschutz / Privacy</strong></a> · <a href="PRIVACY-SOURCES.md"><strong>All sources & providers</strong></a> · <a href="https://kosch.cloud"><strong>Impressum / kosch.cloud</strong></a> · <a href="ANDROID-ARCHIVE.md"><strong>APK archive</strong></a>\n</p>`;
const legalRe=/<p align="center">\s*<a href="PRIVACY\.md"><strong>🔐 Datenschutz[\s\S]*?<\/p>/;
if(legalRe.test(out))out=out.replace(legalRe,legal);else out=legal+'\n\n'+out;
fs.writeFileSync(readmePath,out);
console.log(`README refreshed with ${items.length} stories, ${data.sourceCount} sources, ${data.providerCount} providers and Android 3.7 Beta.`);
