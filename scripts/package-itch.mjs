// Builds build/encore-itch-<version>.zip: dist/ with index.html at the root, ready for an
// itch.io HTML5 upload (relative paths, <1000 files, <500 MB). Workshop pages are left out.
import {readdir,readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {deflateRawSync,crc32} from 'node:zlib';
import {join,relative,sep} from 'node:path';
const root='dist',skip=new Set(['art-preview.html','mobile-preview.html']);
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(!skip.has(e.name))out.push(p);}return out;}
const files=(await walk(root)).sort();
if(files.length>=1000)throw Error(`itch.io allows fewer than 1000 files (${files.length}).`);
const locals=[],centrals=[];let offset=0,total=0;
for(const file of files){
 const name=Buffer.from(relative(root,file).split(sep).join('/')),data=await readFile(file),packed=deflateRawSync(data,{level:9});
 const stored=packed.length>=data.length,body=stored?data:packed,crc=crc32(data);total+=data.length;
 const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(stored?0:8,8);
 header.writeUInt32LE(crc,14);header.writeUInt32LE(body.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);
 const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(stored?0:8,10);
 central.writeUInt32LE(crc,16);central.writeUInt32LE(body.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(offset,42);
 locals.push(header,name,body);centrals.push(central,name);offset+=30+name.length+body.length;
}
if(total>=500*2**20)throw Error('itch.io allows at most 500 MB extracted.');
const directory=Buffer.concat(centrals),end=Buffer.alloc(22);
end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const {version}=JSON.parse(await readFile('package.json','utf8')),out=`build/encore-itch-${version}.zip`;
await mkdir('build',{recursive:true});await writeFile(out,Buffer.concat([...locals,directory,end]));
console.log(`${out}: ${files.length} files, ${(total/2**20).toFixed(1)} MB extracted, ${((await stat(out)).size/2**20).toFixed(1)} MB zipped.`);
