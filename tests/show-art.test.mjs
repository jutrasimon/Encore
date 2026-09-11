import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {classArt,showArt,showAsset,performancePose,removeMagenta} from '../dist/show-art.js';
test('show art repeats with venues while role art uses the engine role ID',()=>{
 for(let i=0;i<9;i++){
  assert.equal(showArt(i),showArt(i%3));
  for(const name of ['intro','back','background','foreground','crowd-sheet'])assert.ok(existsSync(new URL('../dist/'+showAsset(i,name),import.meta.url)));
 }
 for(const path of Object.values(classArt('guitarist-singer')))assert.ok(existsSync(new URL('../dist/'+path,import.meta.url)));
 assert.equal(classArt('legacy'),classArt('guitarist-singer'));
});
test('magenta key removes backdrop and preserves cream, lime, amber and dark ink',()=>{
 const pixels=new Uint8ClampedArray([255,0,255,255,255,244,210,255,186,255,66,255,255,186,66,255,10,18,8,255]);
 removeMagenta(pixels);assert.deepEqual([3,7,11,15,19].map(i=>pixels[i]),[0,255,255,255,255]);
});
test('result poses outrank overdrive and actions; reduced motion is stable',()=>{
 assert.equal(performancePose({result:'sad',overdrive:true,performance:'voice'}),5);
 assert.equal(performancePose({result:'happy',reduced:true}),3);
 assert.equal(performancePose({result:'neutral'}),4);
 assert.equal(performancePose({overdrive:true,performance:'voice'}),2);
 assert.equal(performancePose({performance:'voice'}),1);
 assert.equal(performancePose({performance:'guitar'}),2);
 assert.equal(performancePose({performance:'voice',reduced:true}),0);
 assert.equal(performancePose({performance:'guitar',paused:true}),0);
});
