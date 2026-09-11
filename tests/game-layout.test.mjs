import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('show objectives precede the player banner, then the board and last-song readout',()=>{
 const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 const gameView=source.split('\n').find(line=>line.startsWith('function gameView()'));
 for(const mode of ['solo','multi']){
  const html=runInNewContext(gameView+';gameView()',{
   animating:false,mode,connected:true,game:{phase:'show'},me:()=>({last:{q:5,e:4}}),
   showHeader:()=>'<header/>',meters:()=>'<objectives/>',players:()=>'<players/>',grid:()=>'<board/>',points:()=>'<score/>',showVisualMarkup:()=>'<stage/>'
  });
  assert.ok(html.startsWith('<header/><objectives/><players/><board/>'));
  assert.ok(html.indexOf('DERNIÈRE CHANSON')>html.indexOf('<board/>'));
  assert.equal(html.split('<players/>').length,2);
 }
});
