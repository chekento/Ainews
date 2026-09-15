<div align="center">

# ◈ AI NEWS // HYPERINTELLIGENCE

### AI-only news terminal · Android 2.0 · live source radar

**Frontier models. Agents. Research. Infrastructure. Robotics. Safety. Governance. Nothing else.**

[![Download Android](https://img.shields.io/badge/DOWNLOAD_ANDROID_2.0-65F7C4?style=for-the-badge&logo=android&logoColor=07111f)](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)
[![Live Feed](https://img.shields.io/badge/LIVE_AI_FEED-7AA7FF?style=for-the-badge&logo=rss&logoColor=white)](portal/news.md)
[![Sources](https://img.shields.io/badge/60_AI_SOURCES-A993FF?style=for-the-badge)](config/sources.json)
[![Providers](https://img.shields.io/badge/18_LLM_ECOSYSTEMS-FF78C8?style=for-the-badge)](config/providers.json)

[![Android build](https://github.com/chekento/Ainews/actions/workflows/android-apk.yml/badge.svg)](https://github.com/chekento/Ainews/actions/workflows/android-apk.yml)
[![AI feed refresh](https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml/badge.svg)](https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml)

**60 curated AI sources · 18 provider monitors · 30-minute refresh · strict AI relevance gate · no tracking · no social scraping**

</div>

---

<!-- LATEST_AI_NEWS:START -->
## 🔴 Live AI Intelligence

The automated refresh workflow will place the newest verified AI-only headlines here.
<!-- LATEST_AI_NEWS:END -->

---

## 📱 Android 2.0 — rebuilt around discovery

The Android app is no longer just a feed with tabs. Version 2.0 is a configurable **AI intelligence workspace**:

| Surface | What changed |
|---|---|
| **Home / Command Center** | New briefing-first frontpage, top signal, AI pulse, provider radar and one-tap topic routes |
| **Discover** | Full-text + structured search, time range, source, provider, category, provenance, tags, monitor/paper controls and relevance sorting |
| **Search syntax** | `source:`, `provider:`, `cat:`, `tag:`, `type:`, `after:`, `before:`, `is:saved`, `is:primary`, negative terms and quoted phrases |
| **Source control** | Multi-select sources, searchable registry, source classes and persistent exclusions shared with widgets |
| **Appearance** | Cyber / OLED / Light themes, multiple accents, font scale, density, card style, visual previews, summaries and motion controls |
| **Feed behavior** | Default time window, sorting, primary-source boost, provider-monitor toggle, paper toggle and in-app auto refresh |
| **Saved** | Local-only bookmarks with the same filtering/search model |
| **Copilot** | Context uses only the currently enabled, AI-only news corpus |

### [⬇ Download the latest AI News APK](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)

> Direct test builds are debug-signed. A Play Store production build should use a dedicated release key/AAB pipeline.

---

<!-- ANDROID_WIDGETS:START -->
## ⚡ Hypercyber Android Widgets

Android 2.0 includes eight configurable native widgets.
<!-- ANDROID_WIDGETS:END -->

---

## 🧠 AI-only pipeline

The aggregator treats **relevance as a data-quality constraint**, not a visual filter applied after ingestion.

1. AI-dedicated first-party, research and governance streams are explicitly registered as AI-native.
2. Broad feeds must match AI/model/provider terminology before entering the dataset.
3. Provider-monitor results must actually mention the monitored provider/model family.
4. RSS-less sources use domain-scoped Google News monitors; failing RSS feeds can fall back to the same mechanism.
5. Every accepted item receives `aiConfidence`, category, provenance, tags and provider mappings.
6. Deduplication removes repeated titles/URLs before the dataset is published.

The generated JSON carries `aiOnly: true` and the filter version so clients can verify which pipeline produced it.

---

## 🌐 Source universe

**Primary / labs / platforms:** OpenAI, Anthropic, Google DeepMind, Google AI, Microsoft AI, NVIDIA, Meta AI, Hugging Face, Mistral, Cohere, xAI, Perplexity, AWS ML, GitHub AI & ML, IBM Research AI, Apple ML Research, Together AI, Groq, Cerebras, Scale AI, Databricks AI, LangChain, LlamaIndex, Stability AI, ElevenLabs.

**Research / benchmarking:** MIT News AI, Stanford HAI, arXiv cs.AI, arXiv cs.LG, Ai2, Berkeley AI Research, Epoch AI, METR, MLCommons, Artificial Analysis.

**Independent AI reporting:** Reuters AI & Technology, TechCrunch AI, MIT Technology Review AI, VentureBeat AI, WIRED AI, Ars Technica AI, The Verge AI, IEEE Spectrum AI, The Decoder, AI News, DeepLearning.AI The Batch.

**Governance / safety / institutions:** European AI Office, EU AI Act, NIST AI, OECD.AI, UNESCO AI Ethics, Council of Europe AI, IAPP AI Governance Center, Partnership on AI, AI Now Institute, Ada Lovelace Institute, AlgorithmWatch, WAICO / China MFA, Center for AI Safety, UK AI Security Institute.

[Inspect the machine-readable source registry →](config/sources.json)

---

## 🛰 Intelligence surfaces

| Surface | Open |
|---|---|
| Android 2.0 APK | **[AI-News.apk](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)** |
| GitHub-native live news | [`portal/news.md`](portal/news.md) |
| LLM Provider Wire | [`portal/llm-wire.md`](portal/llm-wire.md) |
| Governance Radar | [`portal/governance.md`](portal/governance.md) |
| Official Social links | [`portal/social.md`](portal/social.md) |
| AI News Copilot notes | [`portal/copilot.md`](portal/copilot.md) |
| Generated AI-only dataset | [`data/news.json`](data/news.json) |
| Source registry | [`config/sources.json`](config/sources.json) |
| Provider registry | [`config/providers.json`](config/providers.json) |

---

<details>
<summary><strong>Technical architecture</strong></summary>

### Repository

- `scripts/fetch-news.mjs` — feed ingestion, AI relevance gate, source monitors, provider monitors, classification and deduplication
- `scripts/update-readme-news.mjs` — writes current headlines and build information onto this frontpage
- `config/sources.json` — 60-source registry
- `config/providers.json` — 18-provider/model registry
- `data/news.json` — generated AI-only intelligence dataset
- `android/` — native Android shell + local HTML/CSS/JS intelligence UI + native widgets
- `.github/workflows/refresh-news.yml` — AI feed/frontpage refresh twice per hour
- `.github/workflows/android-apk.yml` — Android build + stable `android-latest` release asset

### Android baseline

Package: `cloud.kosch.ainews`  
Minimum Android: API 26  
Target / compile SDK: 35  
Java: 17

### Privacy / copyright

No analytics by default. No social scraping. No paywall bypass. News cards retain source attribution and link to the original publication. The UI creates its own visual treatment rather than copying publisher artwork.

</details>

<div align="center">

### SIGNAL > NOISE // AI > EVERYTHING ELSE

<sub>AI NEWS // HYPERINTELLIGENCE · KoSch</sub>

</div>
