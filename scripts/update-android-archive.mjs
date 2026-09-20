import fs from 'node:fs';
const gradle=fs.readFileSync('android/app/build.gradle.kts','utf8');
const version=(gradle.match(/versionName\s*=\s*"([^"]+)"/)||[])[1]||'unknown';
const tag='android-v'+version;
const apk='AI-News-Android-'+version+'.apk';
const release='https://github.com/chekento/Ainews/releases/tag/'+tag;
const download='https://github.com/chekento/Ainews/releases/download/'+tag+'/'+apk;
const sha='https://github.com/chekento/Ainews/releases/download/'+tag+'/'+apk+'.sha256';
const entry='| '+version+' Beta | [APK]('+download+') · [SHA-256]('+sha+') | [Release assets]('+release+') | Versioned archive entry |';
const path='ANDROID-ARCHIVE.md';
let out=fs.existsSync(path)?fs.readFileSync(path,'utf8'):'';
if(!out)out='# Android APK Archive\n\nVersioned Android releases are immutable download points. The stable alias [android-latest](https://github.com/chekento/Ainews/releases/tag/android-latest) always points to the newest beta; use the versioned links below for reproducible downloads.\n\n| Version | Downloads | Release | Notes |\n|---|---|---|---|\n'+entry+'\n';
else{
  if(!out.includes('| Version | Downloads | Release | Notes |'))out+='\n| Version | Downloads | Release | Notes |\n|---|---|---|---|\n';
  const rows=out.split('\n').filter(line=>!line.startsWith('| '+version+' Beta |'));
  const markerIndex=rows.findIndex(line=>line.startsWith('|---'));
  rows.splice(markerIndex+1,0,entry);
  out=rows.join('\n');
}
fs.writeFileSync(path,out.replace(/\n{3,}/g,'\n\n').replace(/\n?$/,'\n'));
console.log('Android archive updated for '+version+' ('+tag+').');