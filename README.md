<div align="center">

# ◈ AI NEWS // LIVE

### AI Intelligence Portal

**Only artificial intelligence. One signal layer for models, providers, research, agents, infrastructure, governance and ethics.**

[![Android APK](https://img.shields.io/badge/DOWNLOAD_ANDROID_APK-65F7C4?style=for-the-badge&logo=android&logoColor=07111f)](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)
[![Live News](https://img.shields.io/badge/LIVE_AI_NEWS-7AA7FF?style=for-the-badge&logo=rss&logoColor=white)](portal/news.md)
[![LLM Provider Wire](https://img.shields.io/badge/18_LLM_PROVIDERS-A993FF?style=for-the-badge&logo=openai&logoColor=white)](portal/llm-wire.md)

[![Build Android APK](https://github.com/chekento/Ainews/actions/workflows/android-apk.yml/badge.svg)](https://github.com/chekento/Ainews/actions/workflows/android-apk.yml)
[![Refresh AI news](https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml/badge.svg)](https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml)

**42 curated AI sources · 18 LLM/provider monitors · refreshed every 30 minutes · Android app · source-first · no tracking · no social scraping**

</div>

---

## 📱 AI News for Android

The Android edition is designed as a real mobile news experience rather than a thin link to GitHub Pages. It has its own local interface, pulls the current news dataset directly from this repository, and carries an offline fallback inside the APK.

### [⬇ Download the latest AI News APK](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)

**Modern mobile features:** horizontal **swipe tabs**, fixed bottom navigation, Home signal dashboard, News stream, 18-provider LLM Wire, Governance Radar, Official Social Wire, local Saved stories, native sharing, external-source handoff and an **AI News Copilot** bottom sheet.

> The direct APK is debug-signed for testing and direct installation. Android may ask you once to allow installation from your browser or file manager. A Play Store build should later use a dedicated release signing key.

---

## Enter the portal

<table>
<tr>
<td width="50%" valign="top">

### ◉ Live AI News Stream

Continuously refreshed AI headlines and brief source excerpts across frontier models, agents, research, chips, open source, safety and business.

**[→ Open live news](portal/news.md)**  
[Live dataset](data/news.json) · [Source registry](config/sources.json)

</td>
<td width="50%" valign="top">

### ✦ AI News Copilot

Research stories against the loaded news corpus, related providers, safety and governance context.

**[→ Open Copilot portal](portal/copilot.md)**

The Android app exposes Copilot directly as a floating bottom-sheet assistant.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ⬡ LLM Provider Wire

Dedicated intelligence radar for 18 model vendors and foundation-model labs, combining first-party announcements with independent reporting.

**[→ Open Provider Wire](portal/llm-wire.md)**  
[Provider registry](config/providers.json)

</td>
<td width="50%" valign="top">

### ⚖ Governance Radar

Separate desk for **EU AI Act, European AI Office, WAICO, NIST, OECD.AI, UNESCO, Council of Europe, AI safety, standards, ethics and compliance**.

**[→ Open Governance Radar](portal/governance.md)**

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ◎ Official Social Wire

Official LinkedIn, Instagram and Facebook channels are surfaced where they can be identified reliably.

**[→ Open Official Social](portal/social.md)**

Links only. No copying or scraping of social posts, images or video.

</td>
<td width="50%" valign="top">

### ⌁ Source Matrix

Primary labs, official institutions, research and independent journalism remain visibly separated so every signal keeps its provenance.

**[→ Explore sources](config/sources.json)**

</td>
</tr>
</table>

---

## Android interaction model

The APK uses a mobile-first **swipeable page rail**:

`HOME` ⇆ `NEWS` ⇆ `LLMs` ⇆ `GOVERNANCE` ⇆ `SOCIAL` ⇆ `SAVED`

The swipe position is synchronized with both the top tab rail and the fixed bottom navigation. Provider cards jump directly into filtered News; article cards expose **Ask AI**, source, share and bookmark controls. The app downloads the current JSON feed from `raw.githubusercontent.com` and falls back to the dataset bundled at build time if the network is unavailable.

---

## LLM / Foundation Model Radar

| Provider | Models / ecosystem | Provider | Models / ecosystem |
|---|---|---|---|
| **OpenAI** | GPT · ChatGPT · Sora | **Anthropic** | Claude |
| **Google DeepMind** | Gemini · Veo · Imagen | **Microsoft AI** | Copilot · MAI |
| **Meta AI** | Llama · Meta AI | **xAI** | Grok |
| **Mistral AI** | Mistral · Magistral · Codestral | **Cohere** | Command · Aya |
| **Perplexity** | Sonar | **Alibaba** | Qwen |
| **Moonshot AI** | Kimi | **DeepSeek** | DeepSeek models |
| **Z.AI / Zhipu** | GLM | **MiniMax** | MiniMax · Hailuo |
| **AI21 Labs** | Jamba | **Amazon AI** | Nova · Bedrock |
| **NVIDIA** | Nemotron · NIM | **IBM** | Granite · watsonx |

**[Open the 18-provider wire →](portal/llm-wire.md)**

---

## Live intelligence access

| Surface | Direct access |
|---|---|
| 📱 Latest Android APK | **[AI-News.apk](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)** |
| 📰 GitHub-native News portal | [`portal/news.md`](portal/news.md) |
| 🧠 LLM/provider portal | [`portal/llm-wire.md`](portal/llm-wire.md) |
| ⚖ Governance & Ethics | [`portal/governance.md`](portal/governance.md) |
| ◎ Official Social | [`portal/social.md`](portal/social.md) |
| ✦ AI News Copilot | [`portal/copilot.md`](portal/copilot.md) |
| 🔴 Current generated dataset | [`data/news.json`](data/news.json) |
| ⚙ Automated feed refresh | [GitHub Actions · Refresh AI news](https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml) |
| 🤖 Android build pipeline | [GitHub Actions · Build Android APK](https://github.com/chekento/Ainews/actions/workflows/android-apk.yml) |

---

<div align="center">

### Source first. AI only. Signal over noise.

Headlines and short excerpts remain connected to the original publisher. Full articles are not mirrored. Social content is not scraped. No paywall bypass. No analytics by default.

</div>

---

<details>
<summary><strong>⚙ Repository / Technical details — click to expand</strong></summary>

<br>

### Architecture

- `index.html` / `styles.css` / `app.js` — interactive web newsroom
- `portal/*.md` — GitHub-native portal pages that work without GitHub Pages
- `config/sources.json` — curated AI source registry
- `config/providers.json` — LLM aliases, official newsrooms and verified social links
- `scripts/fetch-news.mjs` — aggregation, provider monitors, AI-only filtering and deduplication
- `data/news.json` — generated live intelligence dataset
- `android/` — Android application project
- `android/app/src/main/assets/` — local mobile UI with swipe tabs and Copilot
- `.github/workflows/refresh-news.yml` — scheduled feed refresh
- `.github/workflows/android-apk.yml` — APK build, artifact and stable `android-latest` release
- `.github/workflows/pages.yml` — optional GitHub Pages deployment

### Android build

Package: `cloud.kosch.ainews`  
Minimum Android: API 26  
Target / compile SDK: 35  
Java: 17  
Android Gradle Plugin: 8.7.3  
Gradle: 8.9

The Actions workflow copies the current news/provider/source JSON into the app as an offline fallback, builds `app-debug.apk`, renames it to `AI-News.apk`, creates a SHA-256 checksum and publishes both under the stable release tag `android-latest`.

### GitHub Pages status / previous 404

The repository portal no longer depends on Pages. All visible portal navigation above points to actual GitHub files, so these routes work even while Pages is disabled.

The optional browser app can still be deployed through GitHub Pages later. GitHub requires the account-level one-time activation under **Repository → Settings → Pages → Source → GitHub Actions** before the Pages workflow can create the public site.

### AI News Copilot

Built-in local research uses loaded headlines, brief excerpts, source metadata, categories and provider tags. The Android sheet also permits an optional OpenAI-compatible endpoint; no permanent API token is committed to the repository or APK.

### Social / copyright policy

1. Official social profiles are linked only when identified as official.
2. LinkedIn, Instagram and Facebook content is not scraped.
3. Social post text, photos, videos and thumbnails are not copied.
4. Future post-level integrations should use official APIs or authorized embed mechanisms.
5. News cards use publisher headlines and short feed excerpts and link to canonical sources.
6. Visual previews are generated by the UI instead of copying publisher artwork.

### Project

Repository: `chekento/Ainews`  
Primary branch: `main`  
Tracking: none by default

</details>

<div align="center">

<sub>AI NEWS // LIVE · GitHub portal + Android app</sub>

</div>
