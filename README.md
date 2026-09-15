<p align="center">
  <img src="assets/branding/logo.svg" width="920" alt="AI News Hyperintelligence">
</p>

<p align="center">
  <strong>AI-only intelligence for models, agents, research, infrastructure, robotics, safety and governance.</strong><br>
  Source-first · 60 curated AI sources · 18 provider monitors · refreshed every 30 minutes
</p>

<p align="center">
  <a href="https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk"><img src="https://img.shields.io/badge/DOWNLOAD_ANDROID_2.1-65F7C4?style=for-the-badge&logo=android&logoColor=07111f" alt="Download Android APK"></a>
  <a href="portal/news.md"><img src="https://img.shields.io/badge/LIVE_AI_NEWS-55D9FF?style=for-the-badge&logo=rss&logoColor=07111f" alt="Live AI News"></a>
  <a href="config/sources.json"><img src="https://img.shields.io/badge/60_AI_SOURCES-A993FF?style=for-the-badge" alt="60 AI sources"></a>
  <a href="config/providers.json"><img src="https://img.shields.io/badge/18_LLM_ECOSYSTEMS-FF78C8?style=for-the-badge" alt="18 LLM providers"></a>
</p>

<p align="center">
  <a href="https://github.com/chekento/Ainews/actions/workflows/android-apk.yml"><img src="https://github.com/chekento/Ainews/actions/workflows/android-apk.yml/badge.svg" alt="Android build"></a>
  <a href="https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml"><img src="https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml/badge.svg" alt="News refresh"></a>
</p>

---

<table>
<tr>
<td width="50%" valign="top">

### ◈ LIVE INTELLIGENCE

Strict AI-only relevance filtering across labs, research, independent reporting, governance and safety sources.

**[Open current news →](portal/news.md)**

</td>
<td width="50%" valign="top">

### 📱 ANDROID 2.1

Command Center home, Discover search, source controls, saved stories, Copilot and eight configurable home-screen widgets.

**[Download APK →](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)**

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🖼️ VISUAL NEWS CARDS

Publisher images are embedded when they are explicitly supplied in RSS/Atom metadata. Otherwise the UI selects one of **10 bundled cyber fallback visuals**.

No article-page image scraping.

</td>
<td width="50%" valign="top">

### ⌕ POWER SEARCH

Search syntax includes `source:`, `provider:`, `cat:`, `tag:`, `type:`, `after:`, `before:`, `is:saved`, `is:primary`, quoted phrases and negative terms.

**[Provider wire →](portal/llm-wire.md)**

</td>
</tr>
</table>

---

<!-- LATEST_AI_NEWS:START -->
## 🔴 Live AI Intelligence

**60 curated sources · 18 provider monitors · AI-only filter v4 · refreshed automatically every 30 minutes**

The automated refresh workflow will replace this block with the latest twelve verified AI signals.

[→ Full generated dataset](data/news.json) · [→ Source matrix](config/sources.json) · [→ GitHub News portal](portal/news.md)

> **Image policy:** publisher artwork is used only when it is explicitly exposed in RSS/Atom metadata. No article-page image scraping. The Android/Web UI falls back to one of ten bundled AI News visuals when no feed image is available.
<!-- LATEST_AI_NEWS:END -->

---

## 🧭 Signal Deck

| Desk | Coverage |
|---|---|
| **Frontier Models** | GPT, Claude, Gemini, Llama, Mistral, DeepSeek, Qwen, Grok, Kimi, GLM and more |
| **Products & Agents** | agentic systems, coding, browser/computer use, MCP, RAG, assistants and automation |
| **Research** | AI2, Stanford HAI, MIT, arXiv, BAIR, Epoch AI, METR and benchmarks |
| **Infrastructure** | NVIDIA, Cerebras, Groq, GPUs, inference, data centers, accelerators and compute |
| **Robotics & Embodied AI** | robot learning, humanoids, physical AI and autonomous systems |
| **Safety & Security** | evaluations, red teaming, misuse, cybersecurity, alignment and AI security institutes |
| **Compliance & Ethics** | EU AI Act, European AI Office, WAICO, NIST, OECD, UNESCO and Council of Europe |

---

## 📱 Android 2.1 — Visual Intelligence

The APK uses a local mobile interface rather than depending on GitHub Pages. It downloads the current AI-only JSON feed directly from this repository and keeps a bundled offline fallback inside the package.

**Visual layer:** new A+Broadcast logo, launcher icon and favicon; publisher feed images where available; ten local fallback visuals; image-aware rich cards; offline-safe branding.

**UX layer:** horizontal swipe navigation, Command Center home, advanced Discover search, provider/source/category/provenance/time filters, Rich/Compact/Headline card modes, saved stories, native sharing, Governance Radar, Official Social and AI News Copilot.

**Customization:** Hypercyber/OLED/Light/System themes, multiple accents, UI density, font scale, animation level, summaries, visual previews, default time range, sorting, refresh cadence, primary-source boost, provider monitors and research-paper visibility.

### [⬇ Download AI News Android 2.1](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)

> Direct APKs are debug-signed test builds. A Play Store production package should use a dedicated release key and AAB pipeline.

---

<!-- ANDROID_WIDGETS:START -->
## ⚡ Hypercyber Android Widgets

Android **2.1** ships eight native home-screen widgets: **Breaking · Primary Signal · LLM Wire · Governance Radar · R&D / Infra · Signal Stack · Neon Matrix · Signal Clock** — now carrying the refreshed A+Broadcast identity.

They share the app's source exclusions and support configurable **content mode, accent, text scale, density, summary visibility and metadata visibility**. Every widget reads the live AI-only dataset and falls back to bundled news when offline.

### [⬇ Download AI News Android 2.1](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)
<!-- ANDROID_WIDGETS:END -->

---

## 🧠 AI-only ingestion

The feed treats relevance as a data-quality rule, not a cosmetic filter. Broad feeds must match explicit AI/model/provider terminology; provider-monitor results must mention the tracked ecosystem; RSS-less sources can use domain-scoped monitors; low-confidence items are discarded before publication.

Current generated metadata is available in [`data/news.json`](data/news.json), including feed health, provider coverage, source coverage, AI confidence and optional feed-provided image metadata.

---

## 🛰️ Portal

- **[News](portal/news.md)** — current AI stream
- **[LLM Provider Wire](portal/llm-wire.md)** — 18 model ecosystems
- **[Governance Radar](portal/governance.md)** — policy, standards, ethics and safety
- **[Official Social](portal/social.md)** — official profile links only; no post scraping
- **[AI News Copilot](portal/copilot.md)** — context-aware research surface
- **[60-source registry](config/sources.json)** — source classes, tags, regions and monitor configuration

---

<details>
<summary><strong>⚙ Repository / technical details</strong></summary>

### Architecture

- `scripts/fetch-news.mjs` — AI-only aggregation, dedupe, category assignment, source/provider monitors and feed-image extraction
- `scripts/update-readme-news.mjs` — refreshes the live repository frontpage block
- `data/news.json` — generated intelligence dataset
- `config/sources.json` — 60-source matrix
- `config/providers.json` — 18 LLM/provider ecosystems
- `android/` — Android app, native widgets and local mobile UI
- `assets/branding/` — repository/web logo system
- `.github/workflows/refresh-news.yml` — 30-minute feed refresh
- `.github/workflows/android-apk.yml` — Android 2.1 build and stable `android-latest` release

### Image policy

1. Article-page HTML is not scraped for images.
2. A publisher image is eligible only when its RSS/Atom item explicitly exposes an image URL via media metadata, enclosure or feed content.
3. Missing/failed remote images fall back to one of ten bundled vector visuals.
4. The original publisher article remains the canonical destination.

### Android build

Package: `cloud.kosch.ainews`  
Minimum Android: API 26  
Target / compile SDK: 35  
Java: 17

</details>

<p align="center"><strong>AI NEWS // HYPERINTELLIGENCE</strong><br><sub>Source first. AI only. Signal over noise.</sub></p>
