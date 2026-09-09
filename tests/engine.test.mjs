import test from 'node:test';
import assert from 'node:assert/strict';
import {TILES,adjacent,tile,resolve,draw,random,newGame,player,command,targets,ROLES,normalizeGame,grantTemporaryFocus,focusCapacity,songOffers} from '../dist/engine.js';
function board(entries){const a=Array(9).fill(null);for(const [i,k]of entries)a[i]=tile(k,'t'+i);return a;}
function result(a){return resolve(a.filter(Boolean),a);}
function act(g,id,type,rest={},seed=1){return command(g,id,{type,revision:g.revision,...rest},seed);}
test('adjacency has no diagonals or row wrapping',()=>{assert.deepEqual(adjacent(0),[1,3]);assert.deepEqual(adjacent(4),[3,5,1,7]);assert(!adjacent(2).includes(3));});
test('Voice Guitar Voice multiplies 2 / 4 / 2',()=>{const r=result(board([[3,'voice'],[4,'guitar'],[5,'voice']]));assert.deepEqual(r.board.slice(3,6).map(t=>t.m),[2,4,2]);assert.deepEqual(r.totals,{q:4,e:4,f:0});});
test('additive bonus applies before multiplier regardless of traversal order',()=>{const r=result(board([[1,'pick'],[3,'voice'],[4,'guitar'],[5,'voice']]));assert.equal(r.board[4].q,8);});
test('redéclencher repeats points only, not charges or threshold powers',()=>{const a=board([[3,'encore'],[4,'note']]);a[4].charges=2;const r=result(a);assert.equal(r.totals.q,24);assert.equal(a[4].charges,0);assert.equal(a[3].exhausted,true);});
test('cup charge grants run before threshold activation',()=>{const a=board([[4,'note'],[5,'cup']]);const r=result(a);assert.equal(r.totals.q,12);assert.equal(a[4].charges,0);assert.equal(a[5].exhausted,true);});
test('exhaust leaves draw pool; inactivity stays and enables feedback next round',()=>{const a=board([[3,'kamikaze'],[4,'amp'],[5,'feedback']]);let r=result(a);assert.equal(r.totals.e,8);assert(a[3].exhausted);assert(a[4].inactive);assert(!draw(a.filter(Boolean),random(1)).some(t=>t?.kind==='kamikaze'));r=resolve(a.filter(Boolean),[null,null,null,null,a[4],a[5],null,null,null]);assert.equal(r.totals.e,3);});
test('draw has no duplicated instances, empty cells shuffle and exhausted never appear',()=>{const inv=Array.from({length:12},(_,i)=>tile('voice',String(i)));for(let s=1;s<20;s++){const d=draw(inv,random(s));assert.equal(d.length,9);assert.equal(new Set(d.map(t=>t.id)).size,9);}const positions=new Set();for(let s=1;s<20;s++)positions.add(draw([inv[0]],random(s)).findIndex(Boolean));assert(positions.size>5);});
test('charges persist in same show but value recalculates each draw',()=>{const a=board([[4,'refrain']]);assert.equal(result(a).totals.e,1);assert.equal(result(a).totals.e,2);assert.equal(a[4].charges,2);});
test('inactive Voice produces no points or normal synergy',()=>{const a=board([[3,'voice'],[4,'guitar']]);a[3].inactive=true;const r=result(a);assert.equal(r.totals.q,1);assert.equal(r.totals.e,0);});
test('both players ready causes exactly one shared round; stale actions cannot mutate',()=>{let g=newGame();g.players=[player('a','A'),player('b','B')];g=act(g,'a','start');const rev=g.revision;g=act(g,'a','ready');assert.equal(g.round,0);assert.throws(()=>command(g,'b',{type:'ready',revision:rev}));assert.equal(g.round,0);g=act(g,'b','ready');assert.equal(g.round,1);assert.equal(g.q,g.players.reduce((n,p)=>n+p.q,0));assert(g.players.every(p=>!p.ready));assert.equal(targets(g).q,48);});
test('reward validation, one choice per player, next show resets temporary state only',()=>{let g=newGame();g.phase='reward';g.players=[player('a','A'),player('b','B')];for(const p of g.players){p.offers=['solo'];p.inventory[0].charges=9;p.inventory[0].inactive=true;p.inventory[1].exhausted=true;}g.players[0].fans=20;assert.throws(()=>act(g,'a','reward',{action:'add',kind:'note'}));g=act(g,'a','reward',{action:'upgrade',tileId:'a-0'});assert.throws(()=>act(g,'a','reward',{action:'add',kind:'solo'}));g=act(g,'b','reward',{action:'remove',tileId:'b-1'});assert.equal(g.show,1);assert.equal(g.players[0].inventory[0].level,1);assert.equal(g.players[0].fans,20);assert(g.players.every(p=>p.inventory.every(t=>!t.inactive&&!t.exhausted&&!t.charges)));assert.equal(g.players[1].inventory.length,4);});
test('finishing only Quality is not a win; complete tour reaches final result',()=>{let g=newGame();g.players=[player('a','A')];g=act(g,'a','start');g.players[0].inventory=Array.from({length:9},(_,i)=>tile('solo','s'+i));for(let i=0;i<5;i++){g.players[0].inventory=Array.from({length:9},(_,j)=>tile('solo','s'+j));g=act(g,'a','ready');if(g.phase==='draft')g=act(g,'a','draft',{kind:g.players[0].songOffers[0]});}assert.equal(g.phase,'lost');assert.equal(g.e,0);
 g=newGame();g.players=[player('a','A')];g=act(g,'a','start');let n=0;while(!['won','lost'].includes(g.phase)&&n++<30){if(g.phase==='reward')g=act(g,'a','reward',{action:'add',kind:g.players[0].offers[0]});else if(g.phase==='draft')g=act(g,'a','draft',{kind:g.players[0].songOffers[0]});else{g.players[0].inventory=Array.from({length:9},(_,i)=>tile(i%2?'voice':'guitar','s'+i,3));g=act(g,'a','ready');}}assert.equal(g.phase,'won');assert.equal(g.history.length,3);});
test('all initial tile kinds resolve with finite output',()=>{for(const kind of Object.keys(TILES)){const r=result(board([[1,'voice'],[3,'guitar'],[4,kind],[5,'refrain'],[7,'amp']]));assert(Object.values(r.totals).every(Number.isFinite),kind);}});
test('role owns five-tile starter and focus defaults; old saves retain their inventory',()=>{
 const p=player('a','A');assert.equal(p.inventory.length,5);assert.equal(p.role,'guitarist-singer');assert.equal(p.focusBase,1);
 assert.deepEqual(p.inventory.map(t=>t.kind),ROLES[p.role].starter);assert.throws(()=>player('b','B','unknown'));
 const old={...newGame(),version:1,players:[{id:'a',inventory:[tile('amp','old')]}]};const g=normalizeGame(old);
 assert.equal(g.players[0].inventory[0].id,'old');assert.deepEqual(g.players[0].focusedIds,[]);assert.equal(g.players[0].focusTemporary,0);assert.equal(old.version,1);
});
test('focus acts on a copy, persists, is reversible and cannot exceed capacity or change after ready',()=>{
 let g=newGame();g.players=[player('a','A'),player('b','B')];g=act(g,'a','start');
 g=act(g,'a','focus',{tileId:'a-0'});assert.deepEqual(g.players[0].focusedIds,['a-0']);
 assert.throws(()=>act(g,'a','focus',{tileId:'a-1'}));assert.throws(()=>act(g,'b','focus',{tileId:'a-0'}));
 g=act(g,'a','focus',{tileId:'a-0'});g=act(g,'a','focus',{tileId:'a-1'});assert.deepEqual(g.players[0].focusedIds,['a-1']);
 g=act(g,'a','ready');assert.throws(()=>act(g,'a','focus',{tileId:'a-1'}));
 g=act(g,'b','ready');assert.deepEqual(g.players[0].focusedIds,['a-1']);
 g=act(g,'a','focus',{tileId:'a-1'});assert.deepEqual(g.players[0].focusedIds,[]);
});
test('focused copies appear more often without duplicates; all small-inventory tiles appear',()=>{
 const inv=Array.from({length:20},(_,i)=>tile('voice','v'+i));
 const focusedCounts={focus:0,other:0};
 for(let seed=1;seed<=5000;seed++){
  const d=draw(inv,random(seed),['v0']);assert.equal(new Set(d.map(t=>t.id)).size,9);
  if(d.some(t=>t.id==='v0'))focusedCounts.focus++;if(d.some(t=>t.id==='v1'))focusedCounts.other++;
 }
 assert(focusedCounts.focus>focusedCounts.other*1.35);assert(focusedCounts.focus<focusedCounts.other*2.1);
 assert.equal(draw(inv.slice(0,5),random(3),['v0']).filter(Boolean).length,5);
 inv[0].exhausted=true;assert(!draw(inv,random(1),['v0']).some(t=>t?.id==='v0'));
});
test('offers come from role pool with replacement, and adding an owned kind is allowed',()=>{
 const p=player('a','A');assert.deepEqual(songOffers(p,()=>0),['guitar','guitar','guitar']);
 let g=newGame();g.players=[p];g.phase='draft';g.round=1;p.songOffers=['guitar','guitar','guitar'];
 g=act(g,'a','draft',{kind:'guitar'});assert.equal(g.players[0].inventory.filter(t=>t.kind==='guitar').length,3);
 assert.equal(g.players[0].inventory.length,6);assert.equal(new Set(g.players[0].inventory.map(t=>t.id)).size,6);
 assert.throws(()=>act(g,'a','draft',{kind:'guitar'}));
});
test('draft blocks ready and simultaneous choices both commit once without changing between-show rewards',()=>{
 let g=newGame();g.players=[player('a','A'),player('b','B')];g=act(g,'a','start');g=act(g,'a','ready');g=act(g,'b','ready');
 assert.equal(g.phase,'draft');assert(g.players.every(p=>p.songOffers.length===3));assert.throws(()=>act(g,'a','ready'));
 const revision=g.revision,choiceB={type:'draft',revision,show:g.show,round:g.round,kind:g.players[1].songOffers[0]};
 assert.throws(()=>act(g,'a','draft',{kind:'not-a-tile'}));
 g=act(g,'a','draft',{kind:g.players[0].songOffers[0]});assert.equal(g.phase,'draft');
 g=command(g,'b',choiceB);assert.equal(g.phase,'show');assert(g.players.every(p=>p.inventory.length===6));
 assert(g.players.every(p=>!p.rewarded&&p.offers.length===0));
});
test('shows last five songs despite exceeded goals, with four drafts and untouched show reward actions',()=>{
 let g=newGame();g.players=[player('a','A')];g=act(g,'a','start');g.q=100;g.e=100;
 for(let i=1;i<=5;i++){
  g=act(g,'a','ready');assert.equal(g.round,i);
  if(i<5){assert.equal(g.phase,'draft');g=act(g,'a','draft',{kind:g.players[0].songOffers[0]});}
 }
 assert.equal(g.phase,'reward');assert.equal(g.players[0].inventory.length,9);assert.equal(g.players[0].offers.length,3);
 g=act(g,'a','reward',{action:'upgrade',tileId:'a-0'});assert.equal(g.show,1);assert.equal(g.round,0);assert.equal(g.players[0].inventory[0].level,1);assert.equal(g.players[0].last,null);
});
test('temporary focus lasts through songs then expires at show end, preserving permanent selection',()=>{
 let g=newGame();g.players=[player('a','A')];g=act(g,'a','start');grantTemporaryFocus(g.players[0],3);
 assert.equal(focusCapacity(g.players[0]),4);assert.throws(()=>grantTemporaryFocus(g.players[0],-1));
 for(let i=0;i<4;i++)g=act(g,'a','focus',{tileId:'a-'+i});
 for(let i=1;i<=5;i++){g=act(g,'a','ready');if(i<5){assert.equal(g.players[0].focusTemporary,3);g=act(g,'a','draft',{kind:g.players[0].songOffers[0]});}}
 assert.equal(g.players[0].focusTemporary,0);assert.equal(g.players[0].focusBase,1);assert.deepEqual(g.players[0].focusedIds,['a-0']);
});
test('removing a focused tile releases its focus slot',()=>{
 let g=newGame();g.players=[player('a','A'),player('b','B')];g.phase='reward';g.players[0].focusedIds=['a-0'];
 g=act(g,'a','reward',{action:'remove',tileId:'a-0'});assert.deepEqual(g.players[0].focusedIds,[]);
});
