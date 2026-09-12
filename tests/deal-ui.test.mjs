import test from 'node:test';
import assert from 'node:assert/strict';
import {dealFrame,shuffleSlots} from '../dist/deal-ui.js';
import {stageCast} from '../dist/show-art.js';
test('deal moves occupied and empty slots and settles before the existing intro ends',()=>{
 for(const count of [0,1,5,9]){const board=Array.from({length:9},(_,i)=>i<count?{kind:'guitar',id:String(i)}:null),before=JSON.stringify(board);
  const waiting=dealFrame(board,-1,800),middle=dealFrame(board,220,800),end=dealFrame(board,799,800);
  assert.equal(waiting.length,9);assert.deepEqual(waiting.map(t=>t.index).sort((a,b)=>a-b),[0,1,2,3,4,5,6,7,8]);assert.ok(waiting.every(t=>t.progress===0));assert.ok(middle.some(t=>t.progress>0));assert.ok(end.every(t=>t.progress===1));assert.equal(JSON.stringify(board),before);
 }
});
test('explicit empty tiles and null slots share the same deal sequence',()=>{const state=dealFrame([{kind:'empty'},null,{kind:'voice'}],220,800);assert.equal(state.length,3);assert(state[0].progress>state[1].progress);assert(state[1].progress>state[2].progress);});
test('reduced motion distributes immediately',()=>assert.ok(dealFrame([{kind:'voice'},null],0,467,true).every(t=>t.progress===1)));
test('two actual players stay on stage and only the active one performs',()=>{
 const players=[{id:'a',role:'guitarist-singer'},{id:'b',role:'guitarist-singer'}];
 for(const id of ['a','b']){const cast=stageCast({players,activePlayerId:id,performance:'voice'});assert.equal(cast.length,2);assert.equal(cast.filter(p=>p.active).length,1);assert.equal(cast.find(p=>p.active).pose,1);assert.equal(cast.find(p=>!p.active).pose,0);assert.notEqual(cast[0].x,cast[1].x);}
 assert.deepEqual(stageCast({players,result:'happy'}).map(p=>p.pose),[3,3]);
});

test('distribution order is a stable random permutation per board',()=>{const board=Array(9).fill(null);assert.deepEqual(dealFrame(board,0,800).map(t=>t.index),dealFrame(board,500,800).map(t=>t.index));assert.deepEqual(shuffleSlots(9,()=>0).sort((a,b)=>a-b),[0,1,2,3,4,5,6,7,8]);assert.notDeepEqual(shuffleSlots(9,()=>0),shuffleSlots(9,()=>.99));});
