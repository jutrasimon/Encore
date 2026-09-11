import test from 'node:test';
import assert from 'node:assert/strict';
import {resolutionPlan,resolutionFrame,electricPath} from '../dist/resolution.js';
import {ResolutionAudio,spokenStageName} from '../dist/resolution-audio.js';
import {resolve,tile} from '../dist/engine.js';
function musician(id,name){const b=Array(9).fill(null);b[3]=tile('voice',id+'v');b[4]=tile('guitar',id+'g');b[1]=tile('encore',id+'r');return {id,name,...resolve(b.filter(Boolean),b)};}
const players=[musician('a','Premier'),musician('b','Deuxième')];
test('same cast order, frozen boards and repeated production totals on every client',()=>{
 const copy=structuredClone(players),p=resolutionPlan(copy,{q:10,e:8});copy[0].name='Changed';copy[0].board=[];
 assert.deepEqual(p.groups.map(g=>g.player.id),['a','b']);assert.equal(p.groups[0].player.name,'Premier');assert.equal(p.groups[0].player.board.length,9);
 assert.deepEqual(p.total,{q:10+players.reduce((n,p)=>n+p.totals.q,0),e:8+players.reduce((n,p)=>n+p.totals.e,0)});
 assert.deepEqual(players[0].board, p.groups[0].player.board);
});
test('charge stays personal, transfer conserves every point, next scene waits for impact and fade',()=>{
 for(const reduced of [false,true]){
  const p=resolutionPlan(players,{q:10,e:8},reduced),a=p.groups[0],b=p.groups[1];
  assert.equal(resolutionFrame(p,0).phase,'intro');
  for(let t=a.charge;t<a.transfer;t+=17)assert.deepEqual(resolutionFrame(p,t).score,a.base);
  const hold=resolutionFrame(p,a.hold);assert.equal(hold.phase,'hold');assert.deepEqual(hold.local,a.total);
  for(let t=a.transfer;t<a.impact;t+=7){const f=resolutionFrame(p,t);for(const k of ['q','e'])assert.equal(f.score[k]+f.local[k],a.base[k]+a.total[k]);}
  for(const g of p.groups){
   assert.ok(g.outro-g.impact>=(reduced?500:1600),'the entire explosion finishes before the screen fades');
   assert.equal(resolutionFrame(p,g.outro-1).phase,'impact');
   const score={q:g.base.q+g.total.q,e:g.base.e+g.total.e};
   let previousOpacity=1;
   for(let t=g.outro;t<g.end;t+=17){const f=resolutionFrame(p,t);assert.equal(f.done,false);assert.equal(f.phase,'outro');assert.equal(f.group,g);assert.deepEqual(f.score,score);assert.ok(f.opacity>=0&&f.opacity<=previousOpacity);previousOpacity=f.opacity;}
   assert.ok(resolutionFrame(p,g.end-1).opacity<.001,'the reveal is transparent before its DOM is replaced');
  }
  assert.equal(resolutionFrame(p,a.end).group.player.id,'b');
  assert.deepEqual(resolutionFrame(p,b.start).score,{q:a.base.q+a.total.q,e:a.base.e+a.total.e});
  assert.deepEqual(resolutionFrame(p,p.duration),{done:true,score:p.total});
 }
});
test('empty and zero-production boards still get an entrance and a finite finish',()=>{
 const p=resolutionPlan([{id:'z',name:'Silence',board:Array.from({length:9},()=>({kind:'empty'}))}],{q:0,e:0});
 assert.deepEqual(resolutionFrame(p,p.groups[0].hold).local,{q:0,e:0,f:0});assert.equal(resolutionFrame(p,Infinity).done,true);
 assert.deepEqual(resolutionFrame(resolutionPlan([],{q:5,e:6}),0),{done:true,score:{q:5,e:6}});
});

test('the score lands with the resource packet, after its travel and before the impact',()=>{
 const plan=resolutionPlan(players,{q:10,e:8}),g=plan.groups[0],duration=g.impact-g.transfer;
 assert.deepEqual(resolutionFrame(plan,g.transfer+duration*.71).score,g.base);
 const arriving=resolutionFrame(plan,g.transfer+duration*.9);
 assert.ok(arriving.score.q>g.base.q);assert.ok(arriving.local.q>0);
 assert.deepEqual(resolutionFrame(plan,g.impact).score,{q:g.base.q+g.total.q,e:g.base.e+g.total.e});
});
test('electric arcs zigzag and reach exact tile centers for adjacent and global synergies',()=>{
 for(const [a,b,end] of [[0,1,'150 50'],[0,8,'250 250'],[8,0,'50 50'],[3,4,'150 150']]){
  const d=electricPath(a,b);assert.ok(d.endsWith('L '+end));assert.ok(d.split(' L ').length>6);assert.ok(!d.includes('NaN'));assert.notEqual(d,electricPath(a,b,1));
 }
});
test('mute, unavailable audio and unavailable speech never block the performance',()=>{
 const calls=[],host={speechSynthesis:{speak:u=>calls.push(u),cancel(){},getVoices:()=>[]},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 let enabled=false;const audio=new ResolutionAudio(()=>enabled,host);audio.unlock();audio.announce('Simon');audio.tick(5);audio.boom();assert.equal(calls.length,0);
 enabled=true;audio.announce('Simon');assert.equal(calls[0].text,'Simon');assert.ok(calls[0].pitch<1);audio.stop();
 const unavailable=new ResolutionAudio(()=>true,{});unavailable.unlock();unavailable.announce('A');unavailable.transfer();unavailable.stop();
});

test('stage names are spoken alone as words with French pronunciation, preserving the visible spelling',()=>{
 assert.equal(spokenStageName('  SIMON  '),'Simon');assert.equal(spokenStageName('ÉLODIE-JEAN'),'Élodie-Jean');assert.equal(spokenStageName('yUmMy'),'Yummy');
 const name='SIMON',calls=[];const voice={name:'Claude',lang:'fr-CA',localService:true};
 const host={speechSynthesis:{speak:u=>calls.push(u),cancel(){},getVoices:()=>[voice]},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 new ResolutionAudio(()=>true,host).announce(name);assert.equal(name,'SIMON');assert.equal(calls[0].text,'Simon');assert.equal(calls[0].lang,'fr-CA');assert.equal(calls[0].voice,voice);
});
