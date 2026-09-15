import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const sourcesDoc=JSON.parse(await fs.readFile(new URL('../config/sources.json',import.meta.url),'utf8'));
const sources=sourcesDoc.sources||[];
const MAX_PER_SOURCE=12;
const MIN_HEALTHY_ITEMS=10;
const MAX_AGE_DAYS=45;

const aiPattern=/\b(AI|artificial intelligence|generative AI|genAI|machine learning|deep learning|large language model|LLM|foundation model|neural network|transformer|multimodal|AI agent|agentic|ChatGPT|GPT[-\s]?\d|Claude|Gemini|Llama|Mistral|DeepSeek|Qwen|Grok|Copilot|Hugging Face|OpenAI|Anthropic|DeepMind|computer vision|AI Act|AI safety|AI governance|AI model|AI chip|inference|model training)\b/i;
const governancePattern=/\b(AI Act|AI Office|WAICO|regulat|governance|compliance|ethic|responsible AI|AI safety|algorithmic accountability|human rights|transparency|watermark|standard|risk management|NIST|OECD|UNESCO|Council of Europe|law|policy)\b/i;
const securityPattern=/\b(safety|security|misuse|cyber|alignment|red team|jailbreak|biosecurity|catastrophic|risk|threat)\b/i;
const researchPattern=/\b(research|paper|study|benchmark|dataset|science|arXiv|evaluation|method|architecture)\b/i;
const infraPattern=/\b(GPU|chip|semiconductor|data ?center|infrastructure|compute|CUDA|accelerator|TPU|inference server|training cluster)\b/i;
const openPattern=/\b(open[- ]source|open weights|Hugging Face|Apache 2|MIT license|weights released)\b/i;
const agentPattern=/\b(agent|agentic|assistant|API|developer|tool use|coding|browser|computer use|workflow|automation)\b/i;
const frontierPattern=/\b(GPT|Claude|Gemini|Llama|Mistral|DeepSeek|Qwen|Grok|frontier model|foundation model|multimodal model|reasoning model)\b/i;
const industryPattern=/\b(funding|acquisition|revenue|enterprise|startup|market|deal|partnership|investment|CEO|launches|subscription)\b/i;

const decode=s=>String(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));
const clean=s=>decode(s).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const match=(block,re)=>{const m=block.match(re);return m?decode(m[1]).trim():''};
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,18);
const iso=d=>{const x=new Date(d);return Number.isNaN(x.getTime())?null:x.toISOString()};
const notTooOld=d=>!d||Date.now()-new Date(d).getTime()<MAX_AGE_DAYS*86400000;

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
    const summary=clean(match(block,/<(?:description|summary|content:encoded|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content:encoded|content)>/i)).slice(0,520);
    return{title,url,publishedAt:iso(published),summary};
  }).filter(x=>x.title&&/^https?:\/\//i.test(x.url));
}

function categoryFor(text){
  if(governancePattern.test(text))return'Compliance & Ethics';
  if(securityPattern.test(text))return'Safety & Security';
  if(openPattern.test(text))return'Open Source';
  if(infraPattern.test(text))return'Infrastructure';
  if(researchPattern.test(text))return'Research';
  if(agentPattern.test(text))return'Products & Agents';
  if(frontierPattern.test(text))return'Frontier Models';
  if(industryPattern.test(text))return'Industry';
  return'Industry';
}
function tagsFor(text){const out=[];for(const [label,re] of [['EU AI Act',/AI Act|AI Office/i],['WAICO',/WAICO/i],['Agents',/agent|agentic/i],['Open source',/open[- ]source|open weights/i],['Safety',/safety|alignment|risk/i],['Chips',/GPU|chip|semiconductor/i],['Research',/research|paper|benchmark/i],['Multimodal',/multimodal|vision|video|audio/i]])if(re.test(text))out.push(label);return out.slice(0,3)}

async function fetchSource(source){
  if(!source.feed)return{source,items:[],status:'watch'};
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),15000);
  try{
    const r=await fetch(source.feed,{headers:{'user-agent':'AI-News-Live/1.0 (+https://github.com/chekento/Ainews)','accept':'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'},signal:ctrl.signal,redirect:'follow'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const xml=await r.text();
    const parsed=parseFeed(xml).slice(0,MAX_PER_SOURCE*2).filter(i=>notTooOld(i.publishedAt));
    const items=parsed.filter(i=>source.strictAI||aiPattern.test(`${i.title} ${i.summary}`)).slice(0,MAX_PER_SOURCE).map(i=>{const text=`${i.title} ${i.summary}`;return{id:hash(`${source.name}|${i.url}|${i.title}`),title:i.title,summary:i.summary||'Open the original source for full context.',url:i.url,source:source.name,publishedAt:i.publishedAt||new Date().toISOString(),category:categoryFor(text),provenance:source.class,tags:tagsFor(text)}});
    return{source,items,status:'ok'};
  }catch(error){return{source,items:[],status:'error',error:String(error?.message||error)}}finally{clearTimeout(timer)}
}

const results=[];
for(let i=0;i<sources.length;i+=6){results.push(...await Promise.all(sources.slice(i,i+6).map(fetchSource)))}
let items=results.flatMap(r=>r.items);
const seenTitle=new Set(),seenUrl=new Set();
items=items.filter(i=>{const key=i.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().slice(0,140);const url=i.url.replace(/[?#].*$/,'');if(seenTitle.has(key)||seenUrl.has(url))return false;seenTitle.add(key);seenUrl.add(url);return true}).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,300);

if(items.length<MIN_HEALTHY_ITEMS){console.error(`Only ${items.length} healthy AI items; refusing to overwrite existing dataset.`);process.exit(2)}
const payload={generatedAt:new Date().toISOString(),refreshMinutes:30,sourceCount:sources.length,feedCount:sources.filter(s=>s.feed).length,healthyFeeds:results.filter(r=>r.status==='ok').length,failedSources:results.filter(r=>r.status==='error').map(r=>({source:r.source.name,error:r.error})),items};
await fs.mkdir(new URL('../data/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../data/news.json',import.meta.url),JSON.stringify(payload,null,2)+'\n','utf8');
console.log(`Wrote ${items.length} AI stories from ${payload.healthyFeeds}/${payload.feedCount} live feeds.`);
