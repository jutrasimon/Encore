import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {TILES} from '../dist/engine.js';
const dist=new URL('../dist/',import.meta.url);
test('every art file referenced by the shipped code exists, as WebP',()=>{
 const sources=readdirSync(dist).filter(f=>/\.(js|css|html)$/.test(f)).map(f=>readFileSync(new URL(f,dist),'utf8')).join('\n');
 const paths=[...new Set([...sources.matchAll(/art\/[\w./-]+\.(?:webp|png)/g)].map(m=>m[0]))];
 assert.ok(paths.length>15,'static art references found');
 for(const path of paths){assert.ok(path.endsWith('.webp'),path);assert.ok(existsSync(new URL(path,dist)),path);}
 // Drummer tile art is resolved from each tile's icon at runtime.
 for(const [kind,def] of Object.entries(TILES))if(kind.startsWith('perc_'))assert.ok(existsSync(new URL('art/drummer/tiles/'+def.icon+'.webp',dist)),kind);
});
