import test from 'node:test';
import assert from 'node:assert/strict';
import {dealFrame} from '../dist/deal-ui.js';
import {stageCast} from '../dist/show-art.js';
test('deal only moves occupied slots and settles before the existing intro ends',()=>{
 for(const count of [1,5,9]){const board=Array.from({length:9},(_,i)=>i<count?{kind:'guitar',id:String(i)}:null),before=JSON.stringify(board);
  const waiting=dealFrame(board,-1,800),middle=dealFrame(board,220,800),end=dealFrame(board,799,800);
  assert.equal(waiting.length,count);assert.ok(waiting.every(t=>t.progress===0));assert.ok(middle.some(t=>t.progress>0));assert.ok(end.every(t=>t.progress===1));assert.equal(JSON.stringify(board),before);
 }
});
test('reduced motion distributes immediately',()=>assert.ok(dealFrame([{kind:'voice'},null],0,467,true).every(t=>t.progress===1)));
test('two actual players stay on stage and only the active one performs',()=>{
 const players=[{id:'a',role:'guitarist-singer'},{id:'b',role:'guitarist-singer'}];
 for(const id of ['a','b']){const cast=stageCast({players,activePlayerId:id,performance:'voice'});assert.equal(cast.length,2);assert.equal(cast.filter(p=>p.active).length,1);assert.equal(cast.find(p=>p.active).pose,1);assert.equal(cast.find(p=>!p.active).pose,0);assert.notEqual(cast[0].x,cast[1].x);}
 assert.deepEqual(stageCast({players,result:'happy'}).map(p=>p.pose),[3,3]);
});
