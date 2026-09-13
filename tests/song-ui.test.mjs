import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,player,tile,command} from '../dist/engine.js';
import {finishedShow,lastSong,songCounter,verdictMarkup} from '../dist/song-ui.js';
for(const count of [1,2])for(const win of [true,false])test(`verdict uses actual ${count}-player outcome after five songs (${win})`,()=>{
 let g=newGame();g.players=Array.from({length:count},(_,i)=>player('p'+i,'Musicien '+i));
 for(const p of g.players)p.inventory=Array.from({length:9},(_,i)=>tile(win?(i%2?'voice':'guitar'):'solo',p.id+'-'+i,win?30:0));
 const act=(id,type,extra={})=>{g=command(g,id,{type,revision:g.revision,show:g.show,round:g.round,...extra},42);};
 act('p0','start');
 for(let r=1;r<=5;r++){for(let i=0;i<count;i++)act('p'+i,'ready');if(r<5){assert.equal(finishedShow(g),false);for(let i=0;i<count;i++)act('p'+i,'draft',{action:'skip'});}}
 assert.ok(finishedShow(g));assert.ok(lastSong(g));const before=JSON.stringify(g),html=verdictMarkup(g,g.players[0]);
 assert.equal(JSON.stringify(g),before);assert.equal((html.match(/class="action-button primary"/g)||[]).length,1);assert.doesNotMatch(html,/data-action="result-detail"/);assert.ok(!html.includes('grid-wrap'));
 assert.match(html,win?/SHOW RÉUSSI !/:/SHOW RATÉ/);assert.match(html,win?/data-action="rewards"/:/data-action="stats"/);
 assert.ok(html.includes(String(g.q)));assert.ok(html.includes(String(g.e)));assert.match(html,win?/✓ ATTEINT/:/IL MANQUAIT/);
 const restored=JSON.parse(before);assert.equal(verdictMarkup(restored,restored.players[0]),html);
});
test('compact song counter retains the real number and accessible finale label',()=>{
 const g=newGame();g.round=4;assert.equal(lastSong(g),false);assert.ok(!songCounter(g).includes('DERNIÈRE CHANSON'));g.round=5;assert.equal(lastSong(g),true);assert.match(songCounter(g),/Dernière chanson/);assert.match(songCounter(g),/CHANSON <b>5<\/b><span>\/ 5<\/span>/);g.show=7;g.round=1;assert.equal(lastSong(g),false);
});

test("upcoming counter stops at the last song",()=>{const g=newGame();g.round=4;assert.match(songCounter(g,{upcoming:true}),/PROCHAINE CHANSON/);assert.match(songCounter(g,{upcoming:true}),/<b>5<\/b>/);g.round=5;assert.doesNotMatch(songCounter(g,{upcoming:true}),/PROCHAINE|<b>6/);});
