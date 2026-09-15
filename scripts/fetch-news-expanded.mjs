import fs from 'node:fs/promises';

const sourceCoreUrl=new URL('../config/sources.json',import.meta.url);
const sourceExtraUrl=new URL('../config/sources-extra.json',import.meta.url);
const providerCoreUrl=new URL('../config/providers.json',import.meta.url);
const providerExtraUrl=new URL('../config/providers-extra.json',import.meta.url);

const [sourceCoreRaw,sourceExtraRaw,providerCoreRaw,providerExtraRaw]=await Promise.all([
  fs.readFile(sourceCoreUrl,'utf8'),fs.readFile(sourceExtraUrl,'utf8'),fs.readFile(providerCoreUrl,'utf8'),fs.readFile(providerExtraUrl,'utf8')
]);
const sourceCore=JSON.parse(sourceCoreRaw),sourceExtra=JSON.parse(sourceExtraRaw),providerCore=JSON.parse(providerCoreRaw),providerExtra=JSON.parse(providerExtraRaw);
const unique=(items,key)=>{const out=[],seen=new Set();for(const item of items||[]){const id=item?.[key];if(!id||seen.has(id))continue;seen.add(id);out.push(item)}return out};
const mergedSources={...sourceCore,version:3,updated:'2026-09-16',policy:'AI-only merged core + extended registry. Broad sources must pass explicit relevance checks.',sources:unique([...(sourceCore.sources||[]),...(sourceExtra.sources||[])],'name')};
const mergedProviders={...providerCore,version:2,updated:'2026-09-16',providers:unique([...(providerCore.providers||[]),...(providerExtra.providers||[])],'id')};

await fs.writeFile(sourceCoreUrl,JSON.stringify(mergedSources,null,2)+'\n');
await fs.writeFile(providerCoreUrl,JSON.stringify(mergedProviders,null,2)+'\n');
try{
  await import(`./fetch-news.mjs?expanded=${Date.now()}`);
}finally{
  await fs.writeFile(sourceCoreUrl,sourceCoreRaw);
  await fs.writeFile(providerCoreUrl,providerCoreRaw);
}
console.log(`Expanded AI-only build used ${mergedSources.sources.length} sources and ${mergedProviders.providers.length} provider ecosystems.`);
