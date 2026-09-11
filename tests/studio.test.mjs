import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,player,normalizeGame,command,studioChoices,studioComplete} from '../dist/engine.js';
import {studioMarkup} from '../dist/studio-ui.js';
function setup(duo=false){let g=newGame();g.phase='reward';g.players=[player('a','A'),...(duo?[player('b','B')]:[])];g.players.forEach(p=>p.offers=['guitar','voice','pick']);return normalizeGame(g);}
const act=(g,id,type,extra={})=>command(g,id,{type,revision:g.revision,show:g.show,round:g.round,...extra},42);
const choice=(g,category,extra={},id='a')=>act(g,id,'reward',{category,action:category,...extra});
test('three actions reevaluate inventory, survive serialization and reject replays',()=>{
 let g=setup(),original=g.players[0].inventory.length,offers=structuredClone(g.players[0].offers);
 g=choice(g,'add',{kind:'guitar'});const added=g.players[0].inventory.at(-1).id;
 g=normalizeGame(JSON.parse(JSON.stringify(g)));assert.deepEqual(g.players[0].offers,offers);assert.throws(()=>choice(g,'add',{kind:'voice'}));
 assert(studioChoices(g.players[0],'upgrade').some(t=>t.id===added));g=choice(g,'upgrade',{tileId:added});assert.equal(g.players[0].inventory.at(-1).level,1);
 g=choice(g,'remove',{tileId:added});assert.equal(g.players[0].inventory.length,original);assert(studioComplete(g.players[0]));assert.equal(g.phase,'reward');
 assert.throws(()=>choice(g,'remove',{tileId:g.players[0].inventory[0].id}));g=act(g,'a','studio-depart');assert.equal(g.phase,'show');assert.equal(g.round,0);assert.equal(g.show,1);
});
test('empty inventory and skipped categories are persistent and do not mutate inventory',()=>{
 let g=setup();g.players[0].inventory=[];assert.deepEqual(studioChoices(g.players[0],'upgrade'),[]);assert.deepEqual(studioChoices(g.players[0],'remove'),[]);
 assert.throws(()=>act(g,'a','studio-depart'));for(const category of ['remove','upgrade','add']){g=choice(g,category,{action:'skip'});g=normalizeGame(JSON.parse(JSON.stringify(g)));assert.equal(g.players[0].studio[category].status,'skipped');}
 assert.deepEqual(g.players[0].inventory,[]);assert(studioComplete(g.players[0]));
});
test('coop stale independent confirmations work, same category duplicates never apply, both departures required',()=>{
 let g=setup(true),rev=g.revision;g=choice(g,'add',{kind:'voice'});g=act(g,'b','reward',{revision:rev,category:'add',action:'add',kind:'guitar'});
 assert.throws(()=>act(g,'a','reward',{revision:rev,category:'add',action:'add',kind:'voice'}));
 for(const id of ['a','b'])for(const category of ['upgrade','remove'])g=choice(g,category,{action:'skip'},id);
 rev=g.revision;g=act(g,'a','studio-depart');assert.equal(g.phase,'reward');assert.throws(()=>act(g,'a','studio-depart'));
 g=act(g,'b','studio-depart',{revision:rev});assert.equal(g.phase,'show');assert(g.players.every(p=>!p.studio));
});
test('legacy completed reward cannot grant a new visit; unsafe upgrades unavailable',()=>{
 let g=setup();delete g.players[0].studio;g.players[0].rewarded=true;g=normalizeGame(g);assert(studioComplete(g.players[0]));assert.throws(()=>choice(g,'add',{kind:'voice'}));
 g.players[0].inventory.forEach(t=>t.level=Number.MAX_SAFE_INTEGER);assert.deepEqual(studioChoices(g.players[0],'upgrade'),[]);
});
test('Studio render is selection only, respects empty/completed states and explicit departure',()=>{
 const g=setup(),before=JSON.stringify(g),p=g.players[0];let html=studioMarkup(g,p,{selection:'voice'});assert.equal(JSON.stringify(g),before);assert(html.includes('0/3 catégories'));assert(html.includes('data-kind="voice"'));assert(!html.includes('DERNIÈRE CHANSON'));assert(!html.includes('OBJECTIF DU SHOW'));
 let next=choice(g,'add',{action:'skip'});html=studioMarkup(next,next.players[0]);assert(html.includes('Catégorie passée'));assert(!html.includes('choose-add'));
 p.inventory=[];html=studioMarkup(g,p,{category:'remove'});assert(html.includes('inventaire est vide'));assert(html.includes('Passer cette catégorie'));assert(!html.includes('choose-remove'));
});
