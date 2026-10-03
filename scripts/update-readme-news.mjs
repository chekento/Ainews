import fs from 'node:fs';

const readmePath='README.md';
const gradle=fs.readFileSync('android/app/build.gradle.kts','utf8');
const androidVersion=(gradle.match(/versionName\\s*=\\s*\"([^\"]+)\"/)||[])[1]||'3.9.0';
const androidMinor=androidVersion.split('.').slice(0,2).join('.');
const data=JSON.parse(fs.readFileSync('data/news.json','utf8'));
let out=fs.readFileSync(readmePath,'utf8');
const items=(data.items||[]).slice(0,12);
const generated=data.generatedAt?new Date(data.generatedAt):new Date();
const stamp=Number.isNaN(generated.getTime())?'latest dataset':generated.toISOString().replace('T',' ').replace(/:\d\d\.\d+Z$/,' UTC');
const esc=s=>String(s??'').replaceAll('|','\\|').replace(/\s+/g,' ').trim();
const rows=items.map((i,n)=>`| ${String(n+1).padStart(2,'0')} | **${esc(i.source)}** | ${esc(i.category)} | ${i.image?'🖼️':'◈'} | ${i.aiConfidence==='high'?'● HIGH':'◐ MED'} | [${esc(i.title)}](${i.url}) |`).join('\n');
const latest=`<!-- LATEST_AI_NEWS:START -->\n## 🔴 Live AI Intelligence\n\n**${data.sourceCount||0} registered sources · ${data.providerCount||0} provider monitors · AI-only filter v${data.filterVersion||4} · snapshot ${stamp}**\n\n| # | Source | Desk | Media | AI relevance | Headline |\n|---:|---|---|:---:|---|---|\n${rows}\n\n[→ Full generated dataset](data/news.json) · [→ Core sources](config/sources.json) · [→ Extended sources](config/sources-extra.json) · [→ Full transparency catalog](PRIVACY-SOURCES.md)\n\n> **Image policy:** publisher artwork is used only when it is explicitly exposed in RSS/Atom metadata. No article-page image scraping. The Android/Web UI falls back to bundled AI News visuals when no feed image is available.\n\n> **Beta data-quality note:** automated relevance, categorization, provider matching and summaries can still be incomplete or wrong. Verify important information with the linked original source.\n<!-- LATEST_AI_NEWS:END -->`;
const productWire=`<!-- PRODUCT_WIRE:START -->
## ◈ Product & Service Wire

The product desk monitors usable AI services separately from general model news: Claude Code, Sora, Gemini, NotebookLM, GitHub Copilot, Ollama, LangGraph, Midjourney, ElevenLabs, n8n, Zapier, Websim.ai and many more.

**Tracked:** ${data.productCount||40} products · official product pages · original-link news monitoring · no article mirroring.

**[→ Product registry](config/products.json)** · **[→ Android APK archive](ANDROID-ARCHIVE.md)**
<!-- PRODUCT_WIRE:END -->`;
const intelligence=`<!-- INTELLIGENCE_SUITE:START -->
## ◉ Intelligence Suite ${androidMinor} — Video Radar & Expanded Intelligence · BETA

Android ${androidVersion} keeps **Latest · For You · High Signal · Story Clusters · Brief** and the expanded Discover surface, and adds the multilingual YouTube AI Video Radar. Search starts only after an explicit tap.

**Current ${androidVersion}:** multilingual YouTube AI Video Radar · per-story video discovery for every scanned AI-news item · freely selectable multiple languages · dynamic full-provider coverage · official-channel shortcuts where known · Social Wire with ${data.providerCount||0} provider ecosystems · ${data.productCount||264} tracked products · Governance desk · interactive radar · 28 themes · Smart Briefs · Smart Watches · Widget Studio · ${data.sourceCount||0} AI sources.

This release contains no generative model runtime; news discovery, filtering, clustering, brief overviews, TTS, watchlists and original-source links remain available locally.

> **Development status:** this is an active beta/test build. Bugs, incomplete functions and breaking changes are possible. **Use at your own risk / Nutzung auf eigene Gefahr.**

### [⬇ Download AI News Android ${androidVersion} Beta](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)
<!-- INTELLIGENCE_SUITE:END -->`;
const widgets=`<!-- ANDROID_WIDGETS:START -->
## ⚡ Hypercyber Android Widgets · BETA

Android **${androidMinor}** ships nine native home-screen widgets: **Breaking · Primary Signal · LLM Wire · Governance Radar · R&D / Infra · Signal Stack · Neon Matrix · Signal Clock · Live AI Radar**.

Widgets share source exclusions, expose configurable content mode/accent/text scale/density/summary/metadata, support **Next › · Refresh ↻**, and include one-tap **Widget Studio presets** for balanced, minimal, dense and desk-specific setups. Tapping a headline opens the original source directly.

> Widget refresh timing and rendering can vary by Android device, launcher and battery-management policy. This remains beta functionality.

### [⬇ Download AI News Android ${androidVersion} Beta](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)
<!-- ANDROID_WIDGETS:END -->`;
function upsert(text,start,end,block,anchor){const a=text.indexOf(start),b=text.indexOf(end);if(a>=0&&b>a)return text.slice(0,a)+block+text.slice(b+end.length);const at=text.indexOf(anchor);if(at>=0)return text.slice(0,at)+block+'\n\n---\n\n'+text.slice(at);return block+'\n\n'+text}
out=upsert(out,'<!-- LATEST_AI_NEWS:START -->','<!-- LATEST_AI_NEWS:END -->',latest,'## 🧭 Signal Deck');
out=upsert(out,'<!-- INTELLIGENCE_SUITE:START -->','<!-- INTELLIGENCE_SUITE:END -->',intelligence,'## 📱 Android');
out=upsert(out,'<!-- PRODUCT_WIRE:START -->','<!-- PRODUCT_WIRE:END -->',productWire,'## 🧭 Signal Deck');
out=upsert(out,'<!-- ANDROID_WIDGETS:START -->','<!-- ANDROID_WIDGETS:END -->',widgets,'## 🧠 AI-only ingestion');
out=out.replace(/DOWNLOAD_ANDROID_[0-9.]+(?:_BETA)?/g,'DOWNLOAD_ANDROID_'+androidMinor+'_BETA')
  .replace(/CURRENT APK — ANDROID [0-9.]+ BETA/g,'CURRENT APK — ANDROID '+androidVersion+' BETA')
  .replace(/### 📱 ANDROID [0-9.]+ BETA/g,'### 📱 ANDROID '+androidVersion+' BETA')
  .replace(/## 📱 Android [0-9.]+[^\n]*/g,'## 📱 Android '+androidVersion+' Beta — Multilingual Video Radar & Expanded Intelligence')
  .replace(/AI News Android [0-9.]+(?: Beta)?/g,'AI News Android '+androidVersion+' Beta')
  .replace(/Android \*\*[0-9.]+\*\*/g,'Android **'+androidMinor+'**')
  .replace(/Source-first · \d+ curated AI sources · \d+ provider monitors/g,`Source-first · ${data.sourceCount||0} registered AI sources · ${data.providerCount||0} provider monitors`)
  .replace(/badge\/\d+_AI_SOURCES-/g,`badge/${data.sourceCount||0}_AI_SOURCES-`)
  .replace(/alt="\d+ AI sources"/g,`alt="${data.sourceCount||0} AI sources"`)
  .replace(/badge\/\d+_(?:LLM_ECOSYSTEMS|AI_PROVIDER_ECOSYSTEMS)-/g,`badge/${data.providerCount||0}_AI_PROVIDER_ECOSYSTEMS-`)
  .replace(/alt="\d+ (?:LLM|AI) providers"/g,`alt="${data.providerCount||0} AI providers"`);
out=out
  .replace(/- \*\*\[LLM Provider Wire\]\(portal\/llm-wire\.md\)\*\* — [0-9]+ (?:model ecosystems|provider ecosystems)/g, '- **[LLM Provider Wire](portal/llm-wire.md)** — '+(data.providerCount||0)+' provider ecosystems')
  .replace(/\x60config\/sources\.json\x60(?: \+ \x60config\/sources-extra\.json\x60)? — [0-9]+-source matrix/g, '\x60config/sources.json\x60 + \x60config/sources-extra.json\x60 — '+(data.sourceCount||0)+'-source matrix')
  .replace(/\x60config\/providers\.json\x60(?: \+ \x60config\/providers-extra\.json\x60)? — [0-9]+ LLM\/provider ecosystems/g, '\x60config/providers.json\x60 + \x60config/providers-extra.json\x60 — '+(data.providerCount||0)+' provider ecosystems')
  .replace(/\.github\/workflows\/android-apk\.yml\x60? — Android [0-9.]+ beta build/g, '.github/workflows/android-apk.yml — Android '+androidVersion+' beta build')
  .replace(/Java: [0-9]+/g, 'Java: 21')
  .replace(/- SHA-256: \x60[^\x60]+\x60/g, '- SHA-256: [download checksum](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk.sha256)');
const legal=`<p align="center">\n  <a href="PRIVACY.md"><strong>🔐 Datenschutz / Privacy</strong></a> · <a href="PRIVACY-SOURCES.md"><strong>All sources & providers</strong></a> · <a href="https://kosch.cloud"><strong>Impressum / kosch.cloud</strong></a> · <a href="ANDROID-ARCHIVE.md"><strong>APK archive</strong></a>\n</p>`;
const legalRe=/<p align="center">\s*<a href="PRIVACY\.md"><strong>🔐 Datenschutz[\s\S]*?<\/p>/;
if(legalRe.test(out))out=out.replace(legalRe,legal);else out=legal+'\n\n'+out;
fs.writeFileSync(readmePath,out);
console.log(`README refreshed with ${items.length} stories, ${data.sourceCount} sources, ${data.providerCount} providers, ${data.productCount||0} products and Android ${androidVersion} Beta.`);
