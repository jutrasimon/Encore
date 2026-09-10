import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,player,command,normalizeGame,tile} from '../dist/engine.js';
import {songRows,series,statsMarkup} from '../dist/stats-ui.js';
const act=(g,id,type,extra={})=>command(g,id,{type,revision:g.revision,show:g.show,round:g.round,...extra},37);
function band(){let g=newGame();g.players=[player('a','<A>'),player('b','B')];g.players[0].inventory.push(tile('duck','duck'));return act(g,'a','start');}
function round(g){g=act(g,'a','ready');return act(g,'b','ready');}
test('per-song and career totals reconcile with authoritative production and fans, including show bonus',()=>{
 let g=band();g.players.forEach(p=>p.inventory.forEach(t=>t.level=30));for(let i=0;i<5;i++){g=round(g);if(i<4){g=act(g,'a','draft',{action:'skip'});g=act(g,'b','draft',{action:'skip'});}}
 assert.equal(g.songs.length,5);const rows=songRows(g);assert.equal(rows.reduce((n,r)=>n+r.q,0),g.q);assert.equal(rows.reduce((n,r)=>n+r.e,0),g.e);
 assert.equal(rows.reduce((n,r)=>n+r.f+r.bonusFans,0),g.players.reduce((n,p)=>n+p.fans,0));
 for(const p of g.players){assert.equal(p.career.songs,5);assert.equal(p.career.q,p.q);assert.equal(p.career.f+p.career.bonusFans,p.fans);assert.equal(Object.values(p.career.byTile).reduce((n,t)=>n+t.q+t.e,0),p.q+p.e);assert.equal(p.career.heat.reduce((a,b)=>a+b,0),p.q+p.e);}
 const c=structuredClone(g.players[0].career);g=act(g,'a','reward',{action:'skip'});g=act(g,'b','reward',{action:'skip'});assert.deepEqual(g.players[0].career,c);assert.equal(songRows(g,'band','show').length,0);
});
test('readiness and rejected stale requests never double count recorded songs',()=>{
 let g=band();g=act(g,'a','ready');assert.equal(g.songs,undefined);g=act(g,'b','ready');const saved=structuredClone(g);assert.throws(()=>act(g,'b','ready'));assert.deepEqual(g,saved);assert.equal(g.songs.length,1);
});
test('legacy saves keep their fans without fabricating past song details',()=>{
 const g=band();g.players[0].fans=90;const migrated=normalizeGame(g);assert.equal(migrated.players[0].fans,90);assert.equal(migrated.songs,undefined);const next=round(migrated);assert.equal(next.songs.length,1);assert.equal(next.players[0].career.songs,1);
});
test('chart acceleration uses actual deltas including performance fans; filters distinguish retries',()=>{
 const rows=[{q:2,f:1,bonusFans:0,fans:51},{q:8,f:2,bonusFans:5,fans:58},{q:3,f:0,bonusFans:0,fans:58}];assert.deepEqual(series(rows,'q','velocity'),[null,6,-5]);assert.deepEqual(series(rows,'f','velocity'),[null,6,-7]);assert.deepEqual(series(rows,'f','cumulative'),[51,58,58]);
 let g=round(band());g.songs.push({...g.songs[0],attempt:1});assert.equal(songRows(g,'band','show').length,1);assert.equal(songRows(g,'a')[0].q,g.players[0].q);
});
test('bounded song history retains lifetime counters and renders escaped names',()=>{
 let g=band();g.songs=Array.from({length:250},()=>({show:0,attempt:0,round:1,players:[]}));g=round(g);assert.equal(g.songs.length,250);assert.equal(g.players[0].career.songs,1);const html=statsMarkup(g,{playerId:'a'});assert(html.includes('&lt;A&gt;'));assert(!html.includes('<A>'));assert(html.includes('250 dernières'));
});
