import fs from 'node:fs';

const path='android/app/src/main/assets/app.js';
let src=fs.readFileSync(path,'utf8');
const before=src;
const patterns=[
  /;if\(i===1\)setTimeout\(\(\)=>\$\('#searchInput'\)\.focus\(\{preventScroll:true\}\),300\)/g,
  /if\(i===1\)setTimeout\(\(\)=>\$\('#searchInput'\)\.focus\(\{preventScroll:true\}\),300\);?/g
];
for(const p of patterns)src=src.replace(p,'');
if(src!==before){
  fs.writeFileSync(path,src);
  console.log('Removed Discover auto-focus from mobile base JavaScript.');
}else if(/searchInput['"]?\)?\.focus|searchInput.*focus/.test(src)){
  console.error('Search focus code still exists but did not match the expected safe patch.');
  process.exit(2);
}else{
  console.log('Discover auto-focus already absent.');
}
