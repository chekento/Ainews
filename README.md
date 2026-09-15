# AI News // Live

A modern, source-first news dashboard focused **exclusively on artificial intelligence**: frontier models, research, agents, infrastructure, open source, business, safety, compliance and ethics.

The project is designed as a static GitHub Pages site with a GitHub Actions news pipeline. Headlines and short excerpts are refreshed from curated RSS/Atom feeds; every card links back to the original publisher. Full articles are never copied.

## What is included

- 40+ curated AI sources across primary labs, research, independent journalism and governance/standards
- Dedicated **Compliance & Ethics / Governance Radar**
- EU AI Act implementation watch
- WAICO (World Artificial Intelligence Cooperation Organization) watch
- NIST, OECD, UNESCO, Council of Europe, IAPP and other governance sources
- Search, category filters, source filters and sort modes
- Provenance/trust badges
- Bookmarks stored locally in the browser
- Auto-refresh in the browser plus a manual refresh control
- Scheduled GitHub Action that rebuilds `data/news.json`
- Responsive, accessible, installable PWA-style experience
- No analytics or trackers by default

## Architecture

`index.html` + `styles.css` + `app.js` render the site. `config/sources.json` contains the source registry. `scripts/fetch-news.mjs` aggregates RSS/Atom sources and applies strict AI-only filtering. `.github/workflows/refresh-news.yml` refreshes the dataset on a schedule and `.github/workflows/pages.yml` deploys the site.

## GitHub Pages

The repository includes a Pages deployment workflow. If Pages is not enabled yet, open **Settings → Pages → Build and deployment → Source → GitHub Actions** once. After that, pushes and automated news refreshes redeploy the site.

## Editorial principles

1. AI only: general-purpose feeds are filtered against a strict AI vocabulary.
2. Source-first: primary/official sources are clearly distinguished from reporting and analysis.
3. Provenance: every item carries its source class and original URL.
4. Compliance isolation: regulation, ethics, governance, standards and safety policy can be viewed separately.
5. Publisher respect: only headlines and brief feed excerpts are displayed; the canonical source remains the destination.
6. Fail-safe refresh: if too few feeds respond, the updater refuses to overwrite the last healthy dataset.

Built for `chekento/Ainews`.