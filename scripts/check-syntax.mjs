// Syntax-checks every shipped module and server file, so new files cannot be forgotten.
import {readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const files=[
 ...(await readdir('dist')).filter(f=>f.endsWith('.js')).map(f=>'dist/'+f),
 ...(await readdir('dist/locales')).filter(f=>f.endsWith('.js')).map(f=>'dist/locales/'+f),
 ...(await readdir('server')).filter(f=>f.endsWith('.js')).map(f=>'server/'+f)
];
for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log(`Syntax OK: ${files.length} files.`);
