import fs from 'node:fs/promises';

const load=async p=>JSON.parse(await fs.readFile(new URL(p,import.meta.url),'utf8'));
const [coreS,extraS,coreP,extraP]=await Promise.all([
  load('../config/sources.json'),load('../config/sources-extra.json'),load('../config/providers.json'),load('../config/providers-extra.json')
]);
const sources=[...(coreS.sources||[]),...(extraS.sources||[])];
const providers=[...(coreP.providers||[]),...(extraP.providers||[])];
const esc=s=>String(s??'').replaceAll('|','\\|').replace(/\s+/g,' ').trim();
const cls=s=>({primary:'Primary',official:'Official',research:'Research',journalism:'Journalism',governance:'Governance'}[s]||s||'Other');
const sourceRows=sources.map((s,i)=>`| ${i+1} | ${esc(s.name)} | ${cls(s.class)} | ${s.region||'—'} | ${s.homepage||'—'} |`).join('\n');
const providerRows=providers.map((p,i)=>`| ${i+1} | ${esc(p.name)} | ${esc(p.models||'')} | ${p.region||'—'} | ${p.newsroom||'—'} |`).join('\n');
const doc=`# AI News — vollständiges Quellen- & Provider-Verzeichnis\n\n**Stand:** 16. September 2026  \n**Teil der Datenschutzerklärung:** [PRIVACY.md](PRIVACY.md)  \n**Maschinenlesbar:** [core sources](config/sources.json) · [extended sources](config/sources-extra.json) · [core providers](config/providers.json) · [extended providers](config/providers-extra.json)\n\nDieses Dokument ist der automatisch erzeugte Transparenz-Anhang zur Datenschutzerklärung. Es listet sämtliche aktuell registrierten Nachrichtenquellen und AI-/LLM-Provider-Radare auf. Das Register ist bewusst erweiterbar und erhebt keinen Anspruch darauf, jedes weltweit existierende AI-Projekt dauerhaft vollständig abzudecken.\n\n## ${sources.length} registrierte AI-Newsquellen\n\n| # | Quelle | Klasse | Region | Homepage / Originalquelle |\n|---:|---|---|---|---|\n${sourceRows}\n\n## ${providers.length} registrierte AI-/LLM-Provider-Radare\n\n| # | Provider / Ökosystem | Modelle / Fokus | Region | Offizieller Newsroom / Einstieg |\n|---:|---|---|---|---|\n${providerRows}\n\n## Monitoring-Hinweis\n\nWenn eine Quelle keinen stabilen RSS-/Atom-Feed bereitstellt, kann der GitHub-Aggregator einen domainbezogenen Such-/Monitoring-Feed verwenden. Diese Abfragen laufen im GitHub-Workflow und enthalten keine lokalen App-Nutzerdaten, Watchlist-Regeln oder Personalisierungsprofile. Vollständige Artikel werden nicht gespiegelt; der Originalanbieter bleibt das Ziel.\n\n---\n\n[← Datenschutzerklärung](PRIVACY.md) · [← Repository](README.md) · [Impressum / kosch.cloud](https://kosch.cloud)\n`;
await fs.writeFile(new URL('../PRIVACY-SOURCES.md',import.meta.url),doc);

const privacyUrl=new URL('../PRIVACY.md',import.meta.url);
let privacy=await fs.readFile(privacyUrl,'utf8');
if(!privacy.includes('PRIVACY-SOURCES.md')){
  const anchor='**Repository:** `chekento/Ainews`';
  const note='**Vollständiges Quellen- & Provider-Verzeichnis:** [PRIVACY-SOURCES.md](PRIVACY-SOURCES.md)';
  privacy=privacy.includes(anchor)?privacy.replace(anchor,anchor+'  \n'+note):note+'\n\n'+privacy;
  await fs.writeFile(privacyUrl,privacy);
}
console.log(`Privacy source annex refreshed: ${sources.length} sources, ${providers.length} providers.`);
