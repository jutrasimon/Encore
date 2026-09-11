import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('all screen and dialog action templates share the pointer effect class',()=>{
 let count=0;
 for(const file of ['app.js','inventory-ui.js','stats-ui.js']){
  const source=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');
  for(const [,classes] of source.matchAll(/<button[^>]*?class="([^"]*)"/g)){
   if(!/\b(primary|secondary|skip-reward|recap-link|text-button)\b/.test(classes))continue;
   count++;assert.ok(classes.split(' ').includes('action-button'),file+': '+classes);
  }
 }
 assert.ok(count>=25,'cover home, lobby, board, inventory, draft, Studio, stats, settings and dialogs');
});
