import {completeVisit} from './helpers/studio.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,player,command,targets,showInfo,normalizeGame} from '../dist/engine.js';
const act=(g,id,type,extra={})=>command(g,id,{type,revision:g.revision,show:g.show,round:g.round,...extra},29);
function band(){const g=newGame();g.players=[player('a','A'),player('b','B')];return act(g,'a','start');}
test('passing a song reward preserves inventory and requires both independent choices',()=>{
 let g=band();g=act(g,'a','ready');g=act(g,'b','ready');const before=structuredClone(g.players[0].inventory),revision=g.revision;
 const second={type:'draft',action:'skip',revision,show:g.show,round:g.round};
 g=act(g,'a','draft',{action:'skip'});assert.deepEqual(g.players[0].inventory,before);assert.equal(g.phase,'draft');assert.throws(()=>act(g,'a','draft',{action:'skip'}));
 g=command(g,'b',second);assert.equal(g.phase,'show');assert.equal(g.players[1].inventory.length,5);
});
test('passing the studio advances only when both players have chosen',()=>{
 let g=band();g.phase='reward';g=completeVisit(g,'a');assert.equal(g.show,0);assert.equal(g.phase,'reward');
 g=completeVisit(g,'b');assert.equal(g.show,1);assert.equal(g.players[0].inventory.length,5);assert.deepEqual(targets(g),{q:140,e:128});
});
test('successful studio keeps gains, resets exhaustion, permits upgrades beyond +3 and unique IDs',()=>{
 let g=newGame();g.players=[player('a','A')];g=act(g,'a','start');g.phase='draft';g.round=1;g.players[0].songOffers=['guitar','voice','pick'];g=act(g,'a','draft',{kind:'guitar'});
 const first=g.players[0].inventory.at(-1).id;g.phase='reward';g.retry=false;g.players[0].inventory[0].level=3;g.players[0].inventory[1].exhausted=true;g.players[0].fans=21;
 g=completeVisit(g,'a',{action:'upgrade',tileId:'a-0'});assert.equal(g.show,1);assert.equal(g.attempt,1);assert.equal(g.players[0].fans,21);assert.equal(g.players[0].inventory[0].level,4);assert.equal(g.players[0].inventory[1].exhausted,false);
 g.phase='draft';g.round=1;g.players[0].songOffers=['guitar','voice','pick'];g=act(g,'a','draft',{kind:'guitar'});
 assert.notEqual(g.players[0].inventory.at(-1).id,first);assert.equal(new Set(g.players[0].inventory.map(t=>t.id)).size,g.players[0].inventory.length);
});
test('every next level is harder, finite and valid well beyond the original final venue',()=>{
 let previous={q:0,e:0};for(let n=0;n<1000;n++){const s=showInfo(n);assert(s.q>previous.q&&s.e>previous.e);assert(Number.isSafeInteger(s.q)&&Number.isSafeInteger(s.e));assert.equal(s.rounds,5);assert(s.name);previous=s;}
});
test('migration locks existing goals until the next show and preserves defeats and continues legacy victories',()=>{
 const g=newGame();delete g.balanceVersion;g.players=[player('a','A')];g.phase='show';g.round=3;
 const migrated=normalizeGame(g);assert.deepEqual(targets(migrated),{q:24,e:25});assert.deepEqual(normalizeGame(migrated),migrated);
 migrated.phase='reward';const next=completeVisit(migrated,'a');assert.deepEqual(targets(next),{q:70,e:64});
 const old={...g,phase:'won',show:2,round:5};assert.equal(normalizeGame(old).phase,'reward');assert.equal(normalizeGame({...old,phase:'lost'}).phase,'lost');
});
