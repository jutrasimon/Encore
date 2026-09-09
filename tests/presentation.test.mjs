import test from 'node:test';
import assert from 'node:assert/strict';
import {relatedTiles,resolutionEvents,overdriveLevel} from '../dist/presentation.js';
import {resolve,tile} from '../dist/engine.js';
test('every synergy partner, including additive and global effects, is highlighted',()=>{
 const a=Array(9).fill(null);a[4]=tile('guitar','g');a[3]=tile('voice','v');a[1]=tile('pick','p');
 const {board}=resolve(a.filter(Boolean),a);assert.deepEqual(relatedTiles(board,4).sort(),[1,3,4]);
 const b=Array(9).fill(null);b[0]=tile('lighter','l');b[8]=tile('lighter','l2');
 const r=resolve(b.filter(Boolean),b);assert.deepEqual(relatedTiles(r.board,0),[0,8]);
});
test('presentation events account for all players and repeats without mutating scores',()=>{
 const a=Array(9).fill(null);a[3]=tile('encore','repeat');a[4]=tile('guitar','g');const r=resolve(a.filter(Boolean),a);
 const players=[{id:'a',name:'A',board:r.board},{id:'b',name:'B',board:r.board}];const before=structuredClone(players);
 const events=resolutionEvents(players,'b');assert.equal(events[0].playerId,'b');assert.equal(events.length,4);
 assert.equal(events.reduce((n,e)=>n+e.q,0),r.totals.q*2);assert.deepEqual(players,before);
});
test('overdrive starts only above the requirement and double overdrive needs both',()=>{
 const t={q:24,e:25};assert.equal(overdriveLevel({q:24,e:25},t),0);assert.equal(overdriveLevel({q:25,e:25},t),1);assert.equal(overdriveLevel({q:25,e:26},t),2);
});
