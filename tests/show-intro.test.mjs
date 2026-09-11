import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {showInfo} from '../dist/engine.js';
import {showAsset} from '../dist/show-art.js';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const intro=source.slice(source.indexOf('function showIntro()'),source.indexOf('function showResult()'));
const action=source.slice(source.indexOf('function phaseAction()'),source.indexOf('function focusButton('));
test('show intro uses venue covers and live objectives with the existing entry action',()=>{
 for(const [phase,mode,host,connected] of [['lobby','solo',true,true],['lobby','multi',true,false],['lobby','multi',false,true],['draft','solo',true,true]]){
  const dlg={dataset:{},setAttribute(){},showModal(){this.open=true;}};
  const p={id:'me'},game={show:1,phase,players:[{id:host?'me':'partner'},p]};
  runInNewContext(action+intro+'showIntro()',{$:()=>dlg,animating:false,game,showInfo,targets:()=>({q:140,e:128}),preloadShowCover(){},showAsset,me:()=>p,myId:'me',mode,connected,busy:false,icon:()=>'',esc:s=>s});
  assert.ok(dlg.open);assert.match(dlg.innerHTML,/02-petit-pub\/cover.png/);assert.match(dlg.innerHTML,/<b>140<\/b>/);assert.match(dlg.innerHTML,/<b>128<\/b>/);
  assert.ok(dlg.innerHTML.indexOf('Le petit pub')<dlg.innerHTML.indexOf('show-intro-art'));
  if(phase==='lobby'&&host){assert.match(dlg.innerHTML,/data-action="start"/);assert.match(dlg.innerHTML,/MONTER SUR SCÈNE/);if(!connected)assert.match(dlg.innerHTML,/data-action="start" disabled/);}
  else if(phase==='lobby'){assert.ok(!dlg.innerHTML.includes('data-action="start"'));assert.match(dlg.innerHTML,/Le créateur lance/);}
  else{assert.ok(!dlg.innerHTML.includes('data-action="start"'));assert.match(dlg.innerHTML,/data-action="close">MONTER SUR SCÈNE/);}
 }
});
