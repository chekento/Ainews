<div align="center">

# ◈ AI NEWS // LIVE

### AI Intelligence Portal

**Only artificial intelligence. One signal layer for models, providers, research, agents, infrastructure, governance and ethics.**

[![Open Live Newsroom](https://img.shields.io/badge/OPEN_LIVE_NEWSROOM-00E6A8?style=for-the-badge&logo=githubpages&logoColor=07111f)](https://chekento.github.io/Ainews/)
[![LLM Provider Wire](https://img.shields.io/badge/18_LLM_PROVIDERS-7AA7FF?style=for-the-badge&logo=openai&logoColor=white)](https://chekento.github.io/Ainews/#providers)
[![AI News Copilot](https://img.shields.io/badge/AI_NEWS_COPILOT-A993FF?style=for-the-badge&logo=sparkles&logoColor=white)](https://chekento.github.io/Ainews/#stream)

[![Refresh AI news](https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml/badge.svg)](https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml)
[![Deploy Pages](https://github.com/chekento/Ainews/actions/workflows/pages.yml/badge.svg)](https://github.com/chekento/Ainews/actions/workflows/pages.yml)

**42 curated AI sources · 18 LLM/provider monitors · refreshed every 30 minutes · source-first · no tracking · no social scraping**

</div>

---

## Enter the portal

<table>
<tr>
<td width="50%" valign="top">

### ◉ Live AI News Stream

Continuously refreshed AI headlines and short source excerpts across frontier models, agents, research, chips, open source, safety and business.

**[→ Open live news](https://chekento.github.io/Ainews/#stream)**  
[Live dataset](data/news.json) · [Source registry](config/sources.json)

</td>
<td width="50%" valign="top">

### ✦ AI News Copilot

Open any story and select **Ask AI** to research it against the currently loaded news corpus, related providers and governance coverage.

**[→ Open Copilot](https://chekento.github.io/Ainews/#stream)**

Local research mode works without a backend. An optional OpenAI-compatible endpoint can be connected in-session.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ⬡ LLM Provider Wire

Dedicated intelligence radar for major model vendors and foundation-model labs. Provider tags combine first-party announcements with independent reporting.

**[→ Open Provider Wire](https://chekento.github.io/Ainews/#providers)**  
[Provider registry](config/providers.json)

</td>
<td width="50%" valign="top">

### ⚖ Governance Radar

Separate desk for **EU AI Act, European AI Office, WAICO, NIST, OECD.AI, UNESCO, Council of Europe, AI safety, standards, ethics and compliance**.

**[→ Open Governance Radar](https://chekento.github.io/Ainews/#governance)**

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ◎ Official Social Wire

Official LinkedIn, Instagram and Facebook channels are surfaced where they can be identified reliably.

**[→ Open Official Social](https://chekento.github.io/Ainews/#social)**

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

## LLM / Foundation Model Radar

> Click **LLM Provider Wire** in the live newsroom to filter and explore provider-specific coverage.

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

**[Open the 18-provider live radar →](https://chekento.github.io/Ainews/#providers)**

---

## Signal surfaces

`FRONTIER MODELS` · `PRODUCTS & AGENTS` · `RESEARCH` · `INFRASTRUCTURE` · `OPEN SOURCE` · `INDUSTRY` · `SAFETY & SECURITY` · `COMPLIANCE & ETHICS`

The newsroom adds search, provider/source filters, trust-aware sorting, bookmarks, grid/compact views, a live ticker, Signal Pulse trend detection, manual refresh, automatic browser refresh and copyright-safe visual story previews.

---

## Governance & Ethics Desk

<table>
<tr>
<td><strong>🇪🇺 EU AI Act</strong><br><sub>Regulation · implementation · enforcement · transparency</sub></td>
<td><strong>🌐 WAICO</strong><br><sub>Global AI cooperation · membership · governance</sub></td>
<td><strong>🧭 NIST</strong><br><sub>AI RMF · measurement · testing · standards</sub></td>
<td><strong>🏛 OECD / UNESCO / CoE</strong><br><sub>Policy · ethics · rights · international frameworks</sub></td>
</tr>
</table>

**[Open Compliance & Ethics intelligence →](https://chekento.github.io/Ainews/#governance)**

---

## Live intelligence access

| Surface | Direct access |
|---|---|
| 🌐 Full interactive newsroom | **https://chekento.github.io/Ainews/** |
| 📰 Current generated dataset | [`data/news.json`](data/news.json) |
| 🧠 LLM/provider directory | [`config/providers.json`](config/providers.json) |
| 🔎 Curated source directory | [`config/sources.json`](config/sources.json) |
| ⚙ Automated refresh | [GitHub Actions · Refresh AI news](https://github.com/chekento/Ainews/actions/workflows/refresh-news.yml) |
| 🚀 Web deployment | [GitHub Actions · Deploy AI News to Pages](https://github.com/chekento/Ainews/actions/workflows/pages.yml) |

> **If the GitHub Pages URL still shows 404:** this repository frontpage remains the portal. The one-time Pages activation procedure is stored in the collapsed technical section below.

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

- `index.html` — interactive newsroom and portal UI
- `styles.css` — responsive visual system
- `app.js` — filters, Provider Wire, Signal Pulse, bookmarks and AI News Copilot
- `config/sources.json` — curated AI source registry
- `config/providers.json` — provider aliases, official newsrooms and verified social links
- `scripts/fetch-news.mjs` — RSS/Atom aggregation, provider monitors, AI-only filtering, tagging and deduplication
- `data/news.json` — generated live intelligence dataset
- `sw.js` — PWA/offline shell caching
- `.github/workflows/refresh-news.yml` — validation + scheduled feed refresh
- `.github/workflows/pages.yml` — GitHub Pages deployment

### Automation

The scheduled workflow rebuilds the AI-only dataset every 30 minutes. Feed output is deduplicated, tagged by category and provider, sorted by publication time and committed by the repository automation.

Before every feed build, GitHub Actions validates `app.js`, `scripts/fetch-news.mjs`, `config/sources.json` and `config/providers.json`.

### GitHub Pages / 404 first-time activation

GitHub does not allow the repository Actions token to create a Pages site for the first time. If `https://chekento.github.io/Ainews/` returns 404:

1. Open **Repository → Settings → Pages**.
2. Under **Build and deployment**, set **Source → GitHub Actions**.
3. Open **Actions → Deploy AI News to Pages**.
4. Run or re-run the workflow.

After this one-time account-level activation, normal pushes can deploy through the existing workflow.

### AI News Copilot

Every story includes an **Ask AI** action. Built-in local research works from the loaded headlines, short excerpts, source metadata, categories and provider tags.

The UI also supports an optional OpenAI-compatible chat-completions endpoint. Because GitHub Pages is static, secrets cannot be protected server-side. Any optional token remains session-only and must never be committed to the repository. A production deployment should use a secure server-side proxy or authenticated worker.

### Social / copyright policy

1. Official social profiles are linked only when identified as official.
2. LinkedIn, Instagram and Facebook content is not scraped.
3. Social post text, photos, videos and thumbnails are not copied into this repository.
4. Future post-level integrations should use official APIs or authorized embed mechanisms.
5. News cards use publisher headlines and short feed excerpts and link to the canonical source.
6. The UI generates its own visual preview treatment rather than copying publisher artwork.

### Editorial principles

1. **AI only** — general feeds must pass strict AI relevance filtering.
2. **Source first** — primary/official material remains distinguishable from journalism and research.
3. **Provider aware** — major LLM vendors are matched across first-party and independent coverage.
4. **Provenance** — every story retains its source and canonical URL.
5. **Governance isolation** — compliance, ethics, standards and AI policy have their own desk.
6. **Publisher respect** — no article mirroring, social scraping or paywall bypass.
7. **Fail safe** — unhealthy feed runs do not replace the last valid dataset.

### Project

Repository: `chekento/Ainews`  
Primary branch: `main`  
Site model: static GitHub Pages + GitHub Actions data pipeline  
Tracking: none by default

</details>

<div align="center">

<sub>AI NEWS // LIVE · built in `chekento/Ainews`</sub>

</div>
