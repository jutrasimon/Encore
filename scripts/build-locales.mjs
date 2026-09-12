import {readFileSync,writeFileSync} from 'node:fs';
const lines=readFileSync(new URL('../dist/locales/en.tsv',import.meta.url),'utf8').replace(/^\uFEFF/,'').split(/\r?\n/),catalog={};
for(const line of lines){if(!line||line.startsWith('#'))continue;const at=line.indexOf('\t');if(at<1)throw Error('Invalid locale entry: '+line);const key=line.slice(0,at),value=line.slice(at+1);if(!value)throw Error('Missing English translation: '+key);catalog[key]=value;}
writeFileSync(new URL('../dist/locales/en.js',import.meta.url),'export default '+JSON.stringify(catalog,null,2)+';\n');console.log(Object.keys(catalog).length+' English translation entries');
