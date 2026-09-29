import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,player,tile,command,normalizeGame} from '../dist/engine.js';
import {RewardAdvance} from '../dist/autoplay.js';

for(const count of [1,2])for(const win of [false,true])test(`${count} player(s): five songs, four drafts, then ${win?'mandatory Studio':'terminal defeat'}`,()=>{
 let g=newGame();g.players=Array.from({length:count},(_,i)=>player('p'+i,'Test '+i));
 // Fixed inventories force each outcome without changing the production rules.
 for(const p of g.players)p.inventory=Array.from({length:9},(_,i)=>tile(win?(i%2?'voice':'guitar'):'solo',p.id+'-'+i,win?30:0));
 const advances=g.players.map(()=>new RewardAdvance());
 const act=(id,type,extra={})=>{
  const previous=g;g=command(g,id,{type,revision:g.revision,show:g.show,round:g.round,...extra},42);
  advances.forEach((a,i)=>a.observe(previous,g,'p'+i));
 };
 act('p0','start');
 for(let round=1;round<=5;round++){
  for(let i=0;i<count;i++){assert.equal(advances[i].take(g,'p'+i),true);act('p'+i,'ready');}
  assert.equal(g.round,round);assert.equal(g.show,0);
  if(round<5){
   assert.equal(g.phase,'draft');
   for(let i=0;i<count;i++)act('p'+i,'draft',{action:'skip'});
  }
 }
 assert.equal(g.history.length,1);assert.equal(g.history[0].won,win);
 assert.equal(g.phase,win?'reward':'lost');
 advances.forEach((a,i)=>assert.equal(a.take(g,'p'+i),false));
 const saved=structuredClone(g);
 for(const type of ['ready','draft','start'])assert.throws(()=>act('p0',type,{action:'skip'}));
 assert.deepEqual(g,saved);
 if(win){
  for(let i=0;i<count;i++){
   act('p'+i,'reward',{action:'upgrade',tileId:'p'+i+'-0'});
   for(const category of ['add','remove'])act('p'+i,'reward',{action:'skip',category});
   assert.equal(g.phase,'reward');act('p'+i,'studio-depart');
   if(i<count-1){assert.equal(g.phase,'reward');assert.equal(g.show,0);assert.equal(advances[i].take(g,'p'+i),false);}
  }
  assert.equal(g.phase,'show');assert.equal(g.show,1);assert.equal(g.round,0);
  for(let i=0;i<count;i++){assert.equal(advances[i].take(g,'p'+i),true);act('p'+i,'ready');}
  assert.equal(g.round,1);assert.equal(g.phase,'draft');
 }else{
  for(const action of ['skip','add','upgrade','remove'])assert.throws(()=>act('p0','reward',{action,kind:'solo',tileId:'p0-0'}));
  assert.deepEqual(g,saved);assert.deepEqual(normalizeGame(g),g);
  const fresh=newGame();fresh.players=[player('p0','Test')];
  assert.equal(fresh.show,0);assert.equal(fresh.round,0);assert.equal(fresh.players[0].inventory.length,5);assert.equal(fresh.players[0].fans,0);
 }
});

test('old failed reward saves become terminal without losing the inventory or report',()=>{
 const old=newGame();old.players=[player('p0','Test')];old.phase='reward';old.retry=true;old.round=5;
 old.history=[{show:0,won:false,q:12,e:0}];old.players[0].fans=17;
 const migrated=normalizeGame(old);
 assert.equal(migrated.phase,'lost');assert.deepEqual(migrated.players,old.players);assert.deepEqual(migrated.history,old.history);
 assert.deepEqual(normalizeGame(migrated),migrated);assert.equal(old.phase,'reward');
 assert.throws(()=>command(old,'p0',{type:'reward',action:'skip',revision:old.revision},42));
});
