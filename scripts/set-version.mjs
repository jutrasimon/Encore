// One version for every cache-busting query, the frame label and package.json.
// Usage: node scripts/set-version.mjs 0.10.7
import {readFile,writeFile,readdir} from 'node:fs/promises';
const version=process.argv[2];
if(!/^\d+\.\d+\.\d+$/.test(version||''))throw Error('Usage: node scripts/set-version.mjs X.Y.Z');
const files=[
 ...(await readdir('dist')).filter(f=>/\.(js|html)$/.test(f)).map(f=>'dist/'+f),
 ...(await readdir('tests')).filter(f=>f.endsWith('.mjs')).map(f=>'tests/'+f)
];
let changed=0;
for(const file of files){
 const before=await readFile(file,'utf8');
 const after=(file.startsWith('dist/')
  // Every shipped module shares the same query so no stale copy can mix with a new one.
  ?before.replace(/((?:from |import\()\s*['"]\.\/[\w/-]+\.js)(?:\?v=[\w.]+)?(['"])/g,`$1?v=${version}$2`)
  // Tests keep plain imports; only those deliberately sharing the app's instances are bumped.
  :before.replace(/(\.js)\?v=[\w.]+/g,`$1?v=${version}`))
  .replace(/(href="\.\/[\w-]+\.css)(?:\?v=[\w.]+)?"/g,`$1?v=${version}"`)
  .replace(/(src="\.\/app\.js)(?:\?v=[\w.]+)?"/g,`$1?v=${version}"`)
  .replace(/const VERSION='[\w.]+/,`const VERSION='${version}`);
 if(after!==before){await writeFile(file,after);changed++;}
}
const pkg=JSON.parse(await readFile('package.json','utf8'));pkg.version=version;
await writeFile('package.json',JSON.stringify(pkg,null,2)+'\n');
console.log(`Version ${version}: ${changed} files updated.`);
