import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const sourcesDoc=JSON.parse(await fs.readFile(new URL('../config/sources.json',import.meta.url),'utf8'));
const providersDoc=JSON.parse(await fs.readFile(new URL('../config/providers.json',import.meta.url),'utf8'));
const sources=sourcesDoc.sources||[];
const providers=providersDoc.providers||[];
const MAX_PER_SOURCE=12;
const MAX_SOURCE_MONITOR=3;
const MAX_PROVIDER_MONITOR=4;
const MIN_HEALTHY_ITEMS=15;
const MAX_AGE_DAYS=45;

const aiPattern=/\b(AI|artificial intelligence|generative AI|genAI|machine learning|deep learning|large language model|LLM|foundation model|neural network|transformer|multimodal|vision language|VLM|AI agent|agentic|ChatGPT|GPT[-\s]?\d|Claude|Gemini|Llama|Mistral|DeepSeek|Qwen|Grok|Copilot|Kimi|GLM|Jamba|Nova|Nemotron|Granite|MiniMax|Hailuo|Hugging Face|OpenAI|Anthropic|DeepMind|Cohere|Perplexity|xAI|Together AI|Groq|Cerebras|Stability AI|ElevenLabs|LangChain|LlamaIndex|computer vision|AI Act|AI safety|AI governance|AI model|AI chip|inference|model training|RAG|retrieval augmented|embeddings|diffusion model|text-to-image|text-to-video|AI benchmark|MLPerf|alignment|robot learning|embodied AI)\b/i;
const modelPattern=/\b(GPT|Claude|Gemini|Llama|Mistral|DeepSeek|Qwen|Grok|Kimi|GLM|Jamba|Nova|Nemotron|Granite|MiniMax|Hailuo|Stable Diffusion|Sora|Veo|Imagen|OLMo|Molmo|Tülu)\b/i;
const governancePattern=/\b(AI Act|AI Office|WAICO|regulat|governance|compliance|ethic|responsible AI|AI safety|AI security|algorithmic accountability|human rights|transparency|watermark|standard|risk management|NIST|OECD|UNESCO|Council of Europe|law|policy)\b/i;
const securityPattern=/\b(safety|security|misuse|cyber|alignment|red team|jailbreak|biosecurity|catastrophic|risk|threat|model eval|evaluation)\b/i;
const researchPattern=/\b(research|paper|study|benchmark|dataset|science|arXiv|evaluation|method|architecture|capabilities)\b/i;
const infraPattern=/\b(GPU|chip|semiconductor|data ?center|infrastructure|compute|CUDA|accelerator|TPU|inference server|training cluster|tokens per second|neocloud)\b/i;
const openPattern=/\b(open[- ]source|open weights|open model|Hugging Face|Apache 2|MIT license|weights released)\b/i;
const agentPattern=/\b(agent|agentic|assistant|API|developer|tool use|coding|browser|computer use|workflow|automation|MCP|RAG)\b/i;
const roboticsPattern=/\b(robot|robotics|embodied|autonomous vehicle|humanoid|physical AI)\b/i;
const frontierPattern=/\b(GPT|Claude|Gemini|Llama|Mistral|DeepSeek|Qwen|Grok|Kimi|GLM|Jamba|Nova|Nemotron|Granite|MiniMax|frontier model|foundation model|multimodal model|reasoning model)\b/i;
const industryPattern=/\b(funding|acquisition|revenue|enterprise|startup|market|deal|partnership|investment|CEO|launches|subscription|IPO)\b/i;

const decode=s=>String(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));
const clean=s=>decode(s).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const match=(block,re)=>{const m=block.match(re);return m?decode(m[1]).trim():''};
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,18);
const iso=d=>{const x=new Date(d);return Number.isNaN(x.getTime())?null:x.toISOString()};
const notTooOld=d=>!d||Date.now()-new Date(d).getTime()<MAX_AGE_DAYS*86400000;
const norm=s=>String(s||'').toLowerCase();

function parseFeed(xml){
  const isAtom=/<feed[\s>]/i.test(xml)&&/<entry[\s>]/i.test(xml);
  const blocks=isAtom?(xml.match(/<entry\b[\s\S]*?<\/entry>/gi)||[]):(xml.match(/<item\b[\s\S]*?<\/item>/gi)||[]);
  return blocks.map(block=>{
    const title=clean(match(block,/<title[^>]*>([\s\S]*?)<\/title>/i));
    let url='';
    if(isAtom){const href=block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);url=href?decode(href[1]):''}
    else url=clean(match(block,/<link[^>]*>([\s\S]*?)<\/link>/i));
    if(!url)url=clean(match(block,/<guid[^>]*>([\s\S]*?)<\/guid>/i));
    const published=match(block,/<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i);
    const summary=clean(match(block,/<(?:description|summary|content:encoded|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content:encoded|content)>/i)).slice(0,420);
    const publisher=clean(match(block,/<source[^>]*>([\s\S]*?)<\/source>/i));
    return{title,url,publishedAt:iso(published),summary,publisher};
  }).filter(x=>x.title&&/^https?:\/\//i.test(x.url));
}

function categoryFor(text){
  if(governancePattern.test(text))return'Compliance & Ethics';
  if(securityPattern.test(text))return'Safety & Security';
  if(roboticsPattern.test(text))return'Robotics & Embodied AI';
  if(openPattern.test(text))return'Open Source';
  if(infraPattern.test(text))return'Infrastructure';
  if(researchPattern.test(text))return'Research';
  if(agentPattern.test(text))return'Products & Agents';
  if(frontierPattern.test(text))return'Frontier Models';
  if(industryPattern.test(text))return'Industry';
  return'Industry';
}

function tagsFor(text){
  const out=[];
  for(const [label,re] of [
    ['EU AI Act',/AI Act|AI Office/i],['WAICO',/WAICO/i],['Agents',/agent|agentic|MCP/i],
    ['Open source',/open[- ]source|open weights|open model/i],['Safety',/safety|alignment|risk|evaluation/i],
    ['Chips',/GPU|chip|semiconductor|accelerator/i],['Research',/research|paper|benchmark|arXiv/i],
    ['Multimodal',/multimodal|vision|video|audio/i],['Enterprise',/enterprise|business|deployment/i],
    ['Robotics',/robot|robotics|embodied|physical AI/i],['RAG',/RAG|retrieval augmented/i]
  ])if(re.test(text))out.push(label);
  return out.slice(0,5);
}

function providersFor(sourceName,text){
  const hay=norm(`${sourceName} ${text}`);
  return providers.filter(p=>{
    if((p.sources||[]).includes(sourceName))return true;
    return (p.aliases||[]).some(alias=>{
      const a=norm(alias).trim();
      if(!a)return false;
      if(a.length<=3)return new RegExp(`(^|[^a-z0-9])${a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^a-z0-9]|$)`,'i').test(hay);
      return hay.includes(a);
    });
  }).map(p=>p.id).slice(0,6);
}

function aiConfidence(source,text){
  if(source?.strictAI)return'high';
  let score=0;
  if(aiPattern.test(text))score+=3;
  if(modelPattern.test(text))score+=2;
  if(providersFor(source?.name||'',text).length)score+=2;
  if(/\b(agent|inference|benchmark|neural|robotics|GPU|model|algorithm)\b/i.test(text))score+=1;
  return score>=4?'high':score>=3?'medium':'low';
}
function isAIRelevant(source,text){return aiConfidence(source,text)!=='low'}

async function fetchText(url,accept){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),15000);
  try{
    const r=await fetch(url,{headers:{'user-agent':'AI-News-Live/3.0 (+https://github.com/chekento/Ainews)','accept':accept||'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'},signal:ctrl.signal,redirect:'follow'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return await r.text();
  }finally{clearTimeout(timer)}
}

function mapSourceItem(source,i,{monitor=false}={}){
  const text=`${source.name} ${i.title} ${i.summary||''}`;
  return{
    id:hash(`${monitor?'source-monitor':'feed'}|${source.name}|${i.url}|${i.title}`),
    title:i.title,
    summary:monitor?`AI-only source monitor surfaced this update from ${source.name}. Open the original publication for full context.`:(i.summary||'Open the original source for full context.'),
    url:i.url,
    source:source.name,
    publishedAt:i.publishedAt||new Date().toISOString(),
    category:categoryFor(text),
    provenance:source.class,
    tags:[...new Set([...(monitor?['Source monitor']:[]),...tagsFor(text)])].slice(0,5),
    providers:providersFor(source.name,text),
    monitor,
    aiConfidence:aiConfidence(source,text)
  };
}

async function fetchSource(source){
  if(!source.feed)return{source,items:[],status:'watch'};
  try{
    const xml=await fetchText(source.feed);
    const parsed=parseFeed(xml).slice(0,MAX_PER_SOURCE*3).filter(i=>notTooOld(i.publishedAt));
    const items=parsed.filter(i=>isAIRelevant(source,`${source.name} ${i.title} ${i.summary}`)).slice(0,MAX_PER_SOURCE).map(i=>mapSourceItem(source,i));
    return{source,items,status:'ok'};
  }catch(error){return{source,items:[],status:'error',error:String(error?.message||error)}}
}

function sourceMonitorQuery(source){
  if(source.monitorQuery)return source.monitorQuery;
  const domain=source.monitorDomain;
  return `site:${domain} (AI OR "artificial intelligence" OR LLM OR "machine learning") when:30d`;
}
async function fetchSourceMonitor(source){
  if(!source.monitorDomain&&!source.monitorQuery)return{source,items:[],status:'skip'};
  const feed=`https://news.google.com/rss/search?q=${encodeURIComponent(sourceMonitorQuery(source))}&hl=en-US&gl=US&ceid=US:en`;
  try{
    const xml=await fetchText(feed);
    const parsed=parseFeed(xml).filter(i=>notTooOld(i.publishedAt));
    const items=parsed.filter(i=>isAIRelevant(source,`${source.name} ${i.title} ${i.summary}`)).slice(0,MAX_SOURCE_MONITOR).map(i=>mapSourceItem(source,i,{monitor:true}));
    return{source,items,status:'ok'};
  }catch(error){return{source,items:[],status:'error',error:String(error?.message||error)}}
}

function monitorQuery(provider){
  const terms=(provider.aliases||[]).filter(Boolean).slice(0,4).map(x=>`"${x.replace(/"/g,'')}"`);
  return `${terms.join(' OR ')} (AI OR model OR LLM) when:30d`;
}
function providerMention(provider,text){
  const hay=norm(text);
  return (provider.aliases||[]).some(a=>{const x=norm(a).trim();return x&&hay.includes(x)});
}
async function fetchProviderMonitor(provider){
  const feed=`https://news.google.com/rss/search?q=${encodeURIComponent(monitorQuery(provider))}&hl=en-US&gl=US&ceid=US:en`;
  try{
    const xml=await fetchText(feed);
    const parsed=parseFeed(xml).filter(i=>notTooOld(i.publishedAt)&&providerMention(provider,`${i.title} ${i.summary}`)).slice(0,MAX_PROVIDER_MONITOR);
    const items=parsed.map(i=>{
      const publisher=i.publisher||'News coverage';
      const suffix=` - ${publisher}`;
      const title=i.title.endsWith(suffix)?i.title.slice(0,-suffix.length):i.title;
      const text=`${title} ${provider.name} ${provider.models||''}`;
      return{
        id:hash(`provider-monitor|${provider.id}|${i.url}|${title}`),title,
        summary:`AI provider-monitor coverage surfaced for ${provider.name}. Open the linked publication for the complete report and context.`,
        url:i.url,source:`${publisher} · provider monitor`,publishedAt:i.publishedAt||new Date().toISOString(),
        category:categoryFor(text),provenance:'journalism',tags:[...new Set(['Provider monitor',...tagsFor(text)])].slice(0,5),
        providers:[provider.id],monitor:true,aiConfidence:'high'
      };
    });
    return{provider,items,status:'ok'};
  }catch(error){return{provider,items:[],status:'error',error:String(error?.message||error)}}
}

const results=[];
for(let i=0;i<sources.length;i+=6)results.push(...await Promise.all(sources.slice(i,i+6).map(fetchSource)));

const monitorTargets=sources.filter(s=>s.monitorDomain||s.monitorQuery).filter(s=>{
  const direct=results.find(r=>r.source.name===s.name);
  return !s.feed||!direct||direct.status!=='ok'||direct.items.length===0;
});
const sourceMonitorResults=[];
for(let i=0;i<monitorTargets.length;i+=6)sourceMonitorResults.push(...await Promise.all(monitorTargets.slice(i,i+6).map(fetchSourceMonitor)));

const providerMonitorResults=[];
for(let i=0;i<providers.length;i+=6)providerMonitorResults.push(...await Promise.all(providers.slice(i,i+6).map(fetchProviderMonitor)));

let items=[...results.flatMap(r=>r.items),...sourceMonitorResults.flatMap(r=>r.items),...providerMonitorResults.flatMap(r=>r.items)];
items=items.filter(i=>i.aiConfidence==='high'||i.aiConfidence==='medium');
const seenTitle=new Set(),seenUrl=new Set();
items=items.filter(i=>{
  const key=i.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().slice(0,150);
  const url=i.url.replace(/[?#].*$/,'');
  if(seenTitle.has(key)||seenUrl.has(url))return false;
  seenTitle.add(key);seenUrl.add(url);return true;
}).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,520);

if(items.length<MIN_HEALTHY_ITEMS){
  console.error(`Only ${items.length} healthy AI-only items; refusing to overwrite existing dataset.`);
  process.exit(2);
}

const providerCoverage=Object.fromEntries(providers.map(p=>[p.id,items.filter(i=>(i.providers||[]).includes(p.id)).length]));
const sourceCoverage=Object.fromEntries(sources.map(s=>[s.name,items.filter(i=>i.source===s.name).length]));
const payload={
  generatedAt:new Date().toISOString(),refreshMinutes:30,aiOnly:true,filterVersion:3,
  sourceCount:sources.length,providerCount:providers.length,feedCount:sources.filter(s=>s.feed).length,
  healthyFeeds:results.filter(r=>r.status==='ok').length,
  sourceMonitors:monitorTargets.length,healthySourceMonitors:sourceMonitorResults.filter(r=>r.status==='ok').length,
  providerMonitors:providers.length,healthyProviderMonitors:providerMonitorResults.filter(r=>r.status==='ok').length,
  failedSources:results.filter(r=>r.status==='error').map(r=>({source:r.source.name,error:r.error})),
  failedSourceMonitors:sourceMonitorResults.filter(r=>r.status==='error').map(r=>({source:r.source.name,error:r.error})),
  failedProviderMonitors:providerMonitorResults.filter(r=>r.status==='error').map(r=>({provider:r.provider.name,error:r.error})),
  providerCoverage,sourceCoverage,items
};

await fs.mkdir(new URL('../data/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../data/news.json',import.meta.url),JSON.stringify(payload,null,2)+'\n','utf8');
console.log(`Wrote ${items.length} AI-only stories from ${payload.healthyFeeds}/${payload.feedCount} feeds, ${payload.healthySourceMonitors}/${payload.sourceMonitors} source monitors and ${payload.healthyProviderMonitors}/${providers.length} provider monitors.`);
