# Datenschutzerklärung / Privacy Policy — AI News

**Updated:** 20 September 2026
**App:** AI News (`cloud.kosch.ainews`)  
**Projekt / Anbieterinformationen:** [kosch.cloud](https://kosch.cloud)  
**Repository:** `chekento/Ainews`  
**Vollständiges Quellen- & Provider-Verzeichnis:** [PRIVACY-SOURCES.md](PRIVACY-SOURCES.md)

Diese Datenschutzerklärung beschreibt die tatsächlichen Datenflüsse der AI-News-App und des zugehörigen GitHub-Projekts. Sie ist zugleich das öffentliche Quellen- und Transparenzverzeichnis der App.

## 1. Grundprinzipien

AI News ist als quellengestützter AI-News-Reader konzipiert. Die App benötigt **kein Benutzerkonto**, enthält **keine eigene Werbe- oder Tracking-SDK** und verwendet **keine eigene Analytics-Plattform**. Bookmarks, Darstellungsoptionen, deaktivierte Quellen, Personalisierungsgewichte, Copilot-Einstellungen und Smart-Watch-Regeln werden grundsätzlich lokal auf dem Gerät gespeichert.

Die App betreibt keinen eigenen Server für Nutzerprofile. Für die Aktualisierung des Nachrichtenbestands lädt die App öffentliche JSON-Dateien aus diesem GitHub-Repository. Beim Abruf entstehen beim jeweiligen Netzdienst technisch übliche Verbindungsdaten wie IP-Adresse, Zeitpunkt, User-Agent und gegebenenfalls weitere Protokolldaten nach den Datenschutzbedingungen des jeweiligen Anbieters.

## 2. Verantwortlicher / Kontakt

Projekt- und Anbieterinformationen werden über **https://kosch.cloud** bereitgestellt. Der in der App angebotene Menüpunkt **Impressum / Anbieter** öffnet diese Seite im externen Browser.

Hinweis: Ob und welche zusätzlichen Pflichtangaben für ein konkretes geschäftsmäßiges Angebot erforderlich sind, richtet sich insbesondere nach den anwendbaren Informationspflichten. Für geschäftsmäßige digitale Dienste nennt § 5 DDG unter anderem Name, Anschrift und eine schnelle elektronische Kontaktmöglichkeit. Diese Pflichtangaben sollten auf der verlinkten Anbieter-/Impressumsseite vollständig gepflegt werden.

## 3. Welche Daten speichert die App lokal?

Je nach Nutzung können lokal auf dem Gerät gespeichert werden:

- gespeicherte Artikel / Bookmarks;
- deaktivierte bzw. aktivierte Nachrichtenquellen;
- Theme, Akzentfarbe, Schriftgröße, Dichte, Kartenansicht und weitere UI-Einstellungen;
- Widget-Einstellungen;
- lokale Suchhistorie;
- lokale Interessen-/Personalisierungsgewichte für **For You**;
- Smart-Watch-Regeln und der lokale Zustand bereits geprüfter Feed-Einträge;
- Copilot-Einstellungen;
- Copilot-Verlauf nur innerhalb der Sitzung, sofern Session-Memory aktiviert ist.

Diese Daten dienen ausschließlich der Funktion der App auf dem jeweiligen Gerät. In **Settings → Privacy & legal** können Personalisierungs-/Copilot-Sitzungsdaten und gespeicherte Artikel gezielt gelöscht werden.

## 4. Product & service monitoring

The product wire monitors named AI products and services such as Claude Code, Google Antigravity, Google Flow, Make, Zapier, KNIME, Suno, Udio and Websim.ai. Where no stable first-party feed exists, the workflow uses product-scoped public news monitoring. The app stores only short metadata and the original URL; it does not mirror full articles or social posts.

## 5. Nachrichtenabruf über GitHub

Die App ruft den aktuellen AI-only-Datensatz und Konfigurationen über GitHub / `raw.githubusercontent.com` ab, insbesondere:

- `data/news.json`
- `config/sources.json`
- `config/providers.json`

Zusätzlich enthält das APK eine Offline-Kopie dieser Dateien als Fallback. GitHub kann bei Netzwerkabrufen technisch notwendige Verbindungs- und Server-Logdaten verarbeiten. Maßgeblich sind hierfür die Datenschutzbestimmungen von GitHub.

## 6. Externe Artikel, Newsrooms und Social-Profile

Artikelinhalte externer Webseiten werden **nicht innerhalb der App gescrapt**. AI News verarbeitet Überschriften, kurze Feed-/Monitor-Metadaten, Quellenangaben und – soweit vom Feed ausdrücklich bereitgestellt – Feed-Bildinformationen. Vollständige Artikel werden über einen Nutzer-Tap im externen Browser geöffnet.

Gleiches gilt für offizielle LinkedIn-, Instagram- und Facebook-Profile der Anbieter: AI News verlinkt diese Profile, kopiert aber keine Social-Posts, Medien oder Profiltracking-Technik in die App. Erst beim bewussten Öffnen eines externen Links wird eine Verbindung zum jeweiligen Anbieter hergestellt.

## 7. AI News Copilot

Der eingebaute Copilot kann ohne externes Modell lokal mit dem geladenen Nachrichtenbestand arbeiten. Er verwendet dabei Titel, kurze Zusammenfassungen, Tags, Provider, Kategorien, Provenienz und Zeitstempel und stellt verwendete Quellen als Evidence Cards dar.

Optional kann der Nutzer selbst einen **OpenAI-kompatiblen Endpoint**, ein Modell und gegebenenfalls ein Session-Token konfigurieren. In diesem Fall werden die jeweilige Nutzerfrage, der aktuelle Copilot-Kontext und die ausgewählten Evidence-Einträge an **den vom Nutzer gewählten Endpoint** übertragen. Der Betreiber von AI News erhält diese Daten nicht über einen eigenen Backend-Dienst. API-/Session-Tokens werden von der App nicht dauerhaft in das APK eingebettet; ein eingegebenes Token ist für die jeweilige Sitzung bestimmt. Für den gewählten externen AI-Anbieter gelten dessen eigene Datenschutzbedingungen.

## 7. Smart Watchlists und Benachrichtigungen

Smart-Watch-Regeln werden lokal auf dem Android-Gerät gespeichert. Ein Android-Job lädt periodisch den öffentlichen AI-News-Datensatz von GitHub und prüft ihn **lokal** gegen die Watch-Regeln. Die Watch-Regeln selbst werden nicht an GitHub oder die Nachrichtenquellen übertragen.

Für Benachrichtigungen kann Android ab Version 13 die Systemberechtigung `POST_NOTIFICATIONS` abfragen. Sie kann jederzeit in den Android-Systemeinstellungen entzogen werden.

## 8. Text-to-Speech

Das AI-Daily-Briefing kann über die auf dem Android-Gerät konfigurierte Text-to-Speech-Engine vorgelesen werden. Abhängig von der vom Nutzer installierten bzw. gewählten TTS-Engine kann die Sprachverarbeitung lokal oder durch einen externen TTS-Anbieter erfolgen. AI News selbst betreibt hierfür keinen Sprachserver. Die Datenschutzbedingungen der ausgewählten System-TTS-Engine sind maßgeblich.

## 9. Android Widgets

Die Android-Widgets lesen denselben öffentlichen AI-only-Datensatz von GitHub und greifen auf lokal gespeicherte Quellen-/Widget-Einstellungen zu. Sie enthalten keine eigene Analytics- oder Werbetechnik.

## 10. Berechtigungen

Die App verwendet derzeit folgende Android-Berechtigungen:

- `INTERNET` — Aktualisierung des öffentlichen AI-News-Datensatzes und vom Nutzer ausgelöste externe Verbindungen;
- `VIBRATE` — kurze haptische UI-Rückmeldung;
- `POST_NOTIFICATIONS` — optionale Smart-Watch-Benachrichtigungen auf unterstützten Android-Versionen;
- `RECEIVE_BOOT_COMPLETED` — damit persistente Android-Jobs für aktivierte Smart Watches nach einem Neustart weiter geplant werden können.

## 11. Löschung und Kontrolle

Die App bietet lokale Löschmöglichkeiten in den Settings. Zusätzlich können sämtliche App-Daten jederzeit über die Android-Systemeinstellungen gelöscht oder durch Deinstallation der App entfernt werden. Daten, die bei einem bewusst geöffneten externen Anbieter oder einem selbst konfigurierten AI-Endpoint verarbeitet wurden, unterliegen den Lösch- und Datenschutzregeln des jeweiligen externen Anbieters.

## 12. Quellenverzeichnis — 60 kuratierte AI-Quellen

Die folgende Liste entspricht `config/sources.json`. Das CI prüft automatisch, dass jeder dort registrierte Quellenname auch in dieser Datenschutzerklärung vorkommt.

| # | Quelle | Klasse | Homepage |
|---:|---|---|---|
| 1 | OpenAI News | Primary | https://openai.com/news/ |
| 2 | Anthropic News | Primary | https://www.anthropic.com/news |
| 3 | Google DeepMind | Primary | https://deepmind.google/blog/ |
| 4 | Google AI Blog | Primary | https://blog.google/technology/ai/ |
| 5 | Microsoft AI | Primary | https://blogs.microsoft.com/ai/ |
| 6 | NVIDIA AI Blog | Primary | https://blogs.nvidia.com/blog/category/generative-ai/ |
| 7 | Meta AI | Primary | https://ai.meta.com/blog/ |
| 8 | Hugging Face Blog | Primary | https://huggingface.co/blog |
| 9 | Mistral AI | Primary | https://mistral.ai/news/ |
| 10 | Cohere | Primary | https://cohere.com/blog |
| 11 | xAI | Primary | https://x.ai/news |
| 12 | Perplexity | Primary | https://www.perplexity.ai/hub/blog |
| 13 | AWS Machine Learning | Primary | https://aws.amazon.com/blogs/machine-learning/ |
| 14 | GitHub AI & ML | Primary | https://github.blog/ai-and-ml/ |
| 15 | IBM Research AI | Primary | https://research.ibm.com/artificial-intelligence |
| 16 | Apple Machine Learning Research | Primary | https://machinelearning.apple.com/ |
| 17 | MIT News AI | Research | https://news.mit.edu/topic/artificial-intelligence2 |
| 18 | Stanford HAI | Research | https://hai.stanford.edu/news |
| 19 | arXiv cs.AI | Research | https://arxiv.org/list/cs.AI/recent |
| 20 | arXiv cs.LG | Research | https://arxiv.org/list/cs.LG/recent |
| 21 | Reuters AI & Technology | Journalism | https://www.reuters.com/technology/artificial-intelligence/ |
| 22 | TechCrunch AI | Journalism | https://techcrunch.com/category/artificial-intelligence/ |
| 23 | MIT Technology Review AI | Journalism | https://www.technologyreview.com/topic/artificial-intelligence/ |
| 24 | VentureBeat AI | Journalism | https://venturebeat.com/category/ai/ |
| 25 | WIRED AI | Journalism | https://www.wired.com/tag/artificial-intelligence/ |
| 26 | Ars Technica AI | Journalism | https://arstechnica.com/tag/artificial-intelligence/ |
| 27 | The Verge AI | Journalism | https://www.theverge.com/ai-artificial-intelligence |
| 28 | IEEE Spectrum AI | Journalism | https://spectrum.ieee.org/artificial-intelligence |
| 29 | The Decoder | Journalism | https://the-decoder.com/ |
| 30 | AI News | Journalism | https://www.artificialintelligence-news.com/ |
| 31 | European AI Office | Official | https://digital-strategy.ec.europa.eu/en/policies/ai-office |
| 32 | EU AI Act | Official | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai |
| 33 | NIST Artificial Intelligence | Official | https://www.nist.gov/artificial-intelligence |
| 34 | OECD.AI | Official | https://oecd.ai/ |
| 35 | UNESCO AI Ethics | Official | https://www.unesco.org/en/artificial-intelligence/recommendation-ethics |
| 36 | Council of Europe AI | Official | https://www.coe.int/en/web/artificial-intelligence |
| 37 | IAPP AI Governance Center | Governance | https://iapp.org/resources/topics/ai-governance/ |
| 38 | Partnership on AI | Governance | https://partnershiponai.org/ |
| 39 | AI Now Institute | Governance | https://ainowinstitute.org/ |
| 40 | Ada Lovelace Institute | Governance | https://www.adalovelaceinstitute.org/ |
| 41 | AlgorithmWatch | Governance | https://algorithmwatch.org/en/ |
| 42 | WAICO / China MFA | Official | https://www.mfa.gov.cn/eng/wjbzhd/202607/t20260717_11984747.html |
| 43 | Ai2 Blog | Research | https://allenai.org/blog |
| 44 | Berkeley AI Research | Research | https://bair.berkeley.edu/blog/ |
| 45 | DeepLearning.AI The Batch | Journalism | https://www.deeplearning.ai/the-batch/ |
| 46 | Together AI Blog | Primary | https://www.together.ai/blog |
| 47 | Groq Blog | Primary | https://groq.com/blog |
| 48 | Cerebras Blog | Primary | https://www.cerebras.ai/blog |
| 49 | Scale AI Blog | Primary | https://scale.com/blog |
| 50 | Databricks AI | Primary | https://www.databricks.com/blog/category/artificial-intelligence |
| 51 | LangChain Blog | Primary | https://blog.langchain.com/ |
| 52 | LlamaIndex Blog | Primary | https://www.llamaindex.ai/blog |
| 53 | Stability AI | Primary | https://stability.ai/news-updates |
| 54 | ElevenLabs Blog | Primary | https://elevenlabs.io/blog |
| 55 | Epoch AI | Research | https://epoch.ai/latest |
| 56 | METR | Research | https://metr.org/blog/ |
| 57 | MLCommons | Research | https://mlcommons.org/insights/ |
| 58 | Center for AI Safety | Governance | https://www.safe.ai/blog |
| 59 | UK AI Security Institute | Official | https://www.gov.uk/government/organisations/ai-security-institute |
| 60 | Artificial Analysis | Research | https://artificialanalysis.ai/ |

## 13. Provider-Monitoring — 18 LLM-/AI-Ökosysteme

Zusätzlich zu den kuratierten Quellen führt der Aggregator Provider-Monitoring für folgende Ökosysteme aus. Die Monitor-Abfragen werden serverseitig im GitHub-Workflow erzeugt; die Android-App erhält anschließend nur den erzeugten News-Datensatz.

1. OpenAI — https://openai.com/news/
2. Anthropic — https://www.anthropic.com/news
3. Google DeepMind — https://deepmind.google/discover/blog/
4. Microsoft AI — https://microsoft.ai/
5. Meta AI — https://ai.meta.com/blog/
6. xAI — https://x.ai/news
7. Mistral AI — https://mistral.ai/news/
8. Cohere — https://cohere.com/blog
9. Perplexity — https://www.perplexity.ai/hub/blog
10. Alibaba Qwen — https://qwenlm.github.io/blog/
11. Moonshot AI / Kimi — https://www.kimi.ai/
12. DeepSeek — https://www.deepseek.com/
13. Z.AI / Zhipu — https://z.ai/
14. MiniMax — https://www.minimax.io/
15. AI21 Labs — https://www.ai21.com/blog
16. Amazon AI — https://aws.amazon.com/blogs/machine-learning/
17. NVIDIA — https://blogs.nvidia.com/blog/category/generative-ai/
18. IBM — https://research.ibm.com/artificial-intelligence

## 14. Upstream-Monitoring und Suchfeeds

Für Quellen ohne stabilen RSS/Atom-Feed und für die Provider-Abdeckung kann der GitHub-Aggregator Such-/Monitoring-Feeds verwenden, unter anderem Google-News-RSS-Abfragen. Diese Abfragen laufen im GitHub-Automationsworkflow und enthalten keine personenbezogenen App-Nutzerdaten oder lokalen Watch-Regeln.

## 15. Änderungen dieser Datenschutzerklärung

Wenn Datenflüsse, Berechtigungen, Quellen oder Provider geändert werden, soll diese Datei entsprechend aktualisiert werden. Die Repository-CI vergleicht die Namen der registrierten Quellen und Provider mit diesem Dokument und schlägt bei fehlenden Einträgen fehl.

---

**Maschinenlesbare Register:** [`config/sources.json`](config/sources.json) · [`config/providers.json`](config/providers.json)  
**Impressum / Anbieter:** https://kosch.cloud
