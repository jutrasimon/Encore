import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/config.js',import.meta.url),'utf8');
const serverFor=pathname=>import('data:text/javascript,'+encodeURIComponent(`const location={pathname:${JSON.stringify(pathname)}};`+source)).then(m=>m.SERVER_URL);
test('main and preview pages each reach their own multiplayer function',async()=>{
 assert.match(await serverFor('/Encore/'),/\/functions\/v1\/encore$/);
 assert.match(await serverFor('/Encore/index.html'),/\/functions\/v1\/encore$/);
 assert.match(await serverFor('/Encore/audio-test/'),/\/functions\/v1\/encore-preview$/);
});
