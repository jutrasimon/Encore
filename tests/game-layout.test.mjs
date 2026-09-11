import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('show objectives precede the player banner, then the board without a duplicate bottom score',()=>{
 const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 const gameView=source.split('\n').find(line=>line.startsWith('function gameView()'));
 for(const mode of ['solo','multi']){
  const html=runInNewContext(gameView+';gameView()',{
   showingVerdict:()=>false,animating:false,mode,connected:true,game:{phase:'show'},me:()=>({last:{q:5,e:4}}),
   showHeader:()=>'<header/>',meters:()=>'<objectives/>',players:()=>'<players/>',grid:()=>'<board/>',points:()=>'<score/>',showVisualMarkup:()=>'<stage/>'
  });
  assert.ok(html.startsWith('<header/><objectives/><players/><board/>'));
  assert.ok(!html.includes('DERNIÈRE CHANSON'));
  assert.match(source,/class="last-song-stat"/);
  assert.equal(html.split('<players/>').length,2);
  assert.ok(!html.includes('<stage/>'),'normal play reserves all space for the board');
 }
});

test('reveal scenery follows the counters and stays outside board sizing',()=>{
 const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 const view=source.slice(source.indexOf('function resolutionView()'),source.indexOf('function players()'));
 assert.ok(view.indexOf('showVisualMarkup()')>view.indexOf('resolution-caption'));
 const css=readFileSync(new URL('../dist/polish.css',import.meta.url),'utf8');
 assert.match(css,/\.resolution-mode \.show-visual\{position:absolute;inset:auto 0 0/);
});
