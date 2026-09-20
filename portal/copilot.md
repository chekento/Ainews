<div align="center">

# ✦ AI News Copilot 3.7

### Contextual, source-grounded intelligence for the AI news corpus

[← Portal](../README.md) · [News](news.md) · [LLM Wire](llm-wire.md) · [Governance](governance.md) · [Social](social.md)

</div>

> [!WARNING]
> **BETA / IN DEVELOPMENT.** Copilot, retrieval, clustering and heuristic inference are experimental and can misunderstand, omit or overstate information. **Use at your own risk / Nutzung auf eigene Gefahr.** Always inspect the displayed evidence and original source for important claims.

**📱 Current Android Beta:** [Download AI News 3.7 APK](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk) · [Release](https://github.com/chekento/Ainews/releases/tag/android-latest) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk.sha256)  
**🔐 Legal & privacy:** [Datenschutz / Privacy & all sources](../PRIVACY.md) · [Impressum / kosch.cloud](https://kosch.cloud)

---

In Android 3.7 Beta, Copilot follows the user's **story, provider, category, search/filter state or the full enabled feed** and retrieves a source-diverse evidence set before answering.

## Retrieval model

The local Copilot ranks current AI-only stories using weighted matches across:

- headline/title relevance
- source excerpt relevance
- provider names and model ecosystems
- tags and news desk/category
- publication recency
- primary/official/research provenance
- relation to the currently focused story

It then reduces repeated-source/provider saturation so the evidence set is not simply several copies of the same report.

## Integrated actions

Every rich news card can launch contextual actions for **Why it matters · Compare · Timeline · Risk**. Copilot also supports **Summary · Related coverage · Source check · Daily/Current briefing** and keeps a short optional session-only follow-up context.

For comparisons, Copilot describes documented current signals rather than declaring an overall winner. Local analysis separates source-derived excerpts from heuristic inference.

## Evidence

Answers can include evidence cards labelled `S1`, `S2`, etc. Each card links to the original publication and shows source, provenance and freshness. The Evidence Depth setting controls how many signals can be retrieved.

## User controls

Android settings expose:

- **Context:** Auto / Story / Current View / Full Feed
- **Evidence depth:** 6–24 signals
- **Primary-source boost** on/off
- **Evidence cards** on/off
- **Session follow-up memory** on/off

## Settings persistence

Selected filters, UI choices and Copilot enable/minimize preferences persist locally for the next session. API tokens are never stored permanently.

## On-device generative mode

Android 3.7 can download **Qwen3 0.6B · dynamic INT4** (~328 MB, Apache-2.0) from the public LiteRT Community model card. The model is loaded with Google's **LiteRT-LM** runtime and generates Copilot answers on the device after the one-time download.

No API key, subscription, account or cloud inference endpoint is required for this mode. The model file stays in the app-private Android storage and can be removed from Settings. Hardware, RAM, thermals and device support affect speed; the existing source-grounded local research fallback remains available when the model is not installed or cannot initialize.

**[→ Model registry](../config/on-device-models.json)** · **[→ Qwen3 model card](https://huggingface.co/litert-community/Qwen3-0.6B)** · **[→ LiteRT-LM Android documentation](https://developers.google.com/edge/litert-lm/android)**

## Optional connected model

The built-in retrieval and structured local analysis do not require an API. An optional OpenAI-compatible endpoint can be connected for synthesis. The model receives the retrieved evidence with source IDs and is instructed to answer only from that context, cite source IDs and label inference.

## Privacy / secrets

No permanent API secret is committed to the repository or bundled into the Android APK. A connected endpoint token is session-entered. The full data-flow explanation is maintained in [PRIVACY.md](../PRIVACY.md).

## Beta interpretation boundary

Copilot output is generated assistance, not a substitute for the original publication, professional advice or independent verification. Source-grounding reduces hallucination risk but does not eliminate it.

**[→ Current AI dataset](../data/news.json)** · **[→ Provider context](../config/providers.json)** · **[→ Source matrix](../config/sources.json)**

---

**[⬇ Download Android 3.7 Beta](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk)** · **[Back to AI News portal →](../README.md)**
