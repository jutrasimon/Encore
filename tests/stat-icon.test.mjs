import test from 'node:test';
import assert from 'node:assert/strict';
import {StatIcon} from '../dist/stat-icon.js';
import {icon} from '../dist/icons.js';
import {newGame,player,command} from '../dist/engine.js';
import {RewardAdvance} from '../dist/autoplay.js';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
test('stat masks expose labels, sizes, colors and shared legacy entry points',()=>{
 for(const [old,type,label] of [['star','quality','Qualité'],['bolt','energy','Énergie'],['choir','fans','Fans']]){
  assert.equal(icon(old),StatIcon(type,20,'currentColor'));assert.match(StatIcon(type,28,'#fff'),/--stat-size:28px/);assert.ok(StatIcon(type).includes(`aria-label="${label}"`));assert.ok(!icon(old).includes('<svg'));
 }
});
test('coop entry never auto-readies either player and the second confirmation starts the song',()=>{
 const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 const fn=source.slice(source.indexOf('function maybeAutoReady()'),source.indexOf('const type='));
 let game=newGame();game.players=[player('a','A'),player('b','B')];
 const apply=(id,type)=>{const before=game;game=command(game,id,{type,revision:game.revision,show:game.show,round:game.round},42);return before;};
 const before=apply('a','start');
 for(const id of ['a','b']){const advance=new RewardAdvance();advance.observe(before,game,id);runInNewContext(fn+';maybeAutoReady()', {mode:'multi',game,advance,queueMicrotask:()=>assert.fail('Auto ready bypasses entry')});assert.equal(game.players.find(p=>p.id===id).ready,false);}
 apply('a','ready');assert.equal(game.round,0);assert.equal(game.players[0].ready,true);assert.equal(game.players[1].ready,false);
 apply('b','ready');assert.equal(game.round,1);
});
