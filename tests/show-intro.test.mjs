import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {showInfo} from '../dist/engine.js';
import {showAsset} from '../dist/show-art.js';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const intro=source.slice(source.indexOf('function showIntro()'),source.indexOf('function showResult()'));
test('show intro uses venue covers and live objectives with the existing entry action',()=>{
 for(const [phase,round,mode] of [['show',0,'solo'],['show',0,'multi'],['draft',2,'solo']]){
  const dlg={dataset:{},setAttribute(){},showModal(){this.open=true;}};
  const p={id:'me',name:'Moi',ready:false},game={show:1,phase,round,players:[p,{id:'partner',name:'Toi',ready:true}]};
  runInNewContext(intro+'showIntro()',{$:()=>dlg,animating:false,game,showInfo,targets:()=>({q:140,e:128}),preloadShowCover(){},showAsset,me:()=>p,myId:'me',mode,connected:true,busy:false,icon:()=>'',esc:s=>s});
  assert.ok(dlg.open);assert.match(dlg.innerHTML,/02-petit-pub\/cover.png/);assert.match(dlg.innerHTML,/<b>140<\/b>/);assert.match(dlg.innerHTML,/<b>128<\/b>/);
  assert.ok(dlg.innerHTML.indexOf('Le petit pub')<dlg.innerHTML.indexOf('show-intro-art'));
  assert.ok(!dlg.innerHTML.includes('data-action="start"'));
  if(round===0){assert.match(dlg.innerHTML,/data-action="ready" >MONTER SUR SCÈNE/);assert.equal(dlg.innerHTML.includes('entry-status'),mode==='multi','only a band lists who is ready');}
  else assert.match(dlg.innerHTML,/data-action="close">MONTER SUR SCÈNE/);
 }
});
