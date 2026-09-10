import test from 'node:test';
import assert from 'node:assert/strict';
import {RewardAdvance} from '../dist/autoplay.js';
import {resolutionSpeed,resolutionPlan,resolutionFrame} from '../dist/resolution.js';
import {scoreCallout} from '../dist/juice.js';
import {newGame,player,command} from '../dist/engine.js';
import {ResolutionAudio} from '../dist/resolution-audio.js';
function setup(ids=['a']){let g=newGame();g.players=ids.map(id=>player(id,id));return act(g,ids[0],'start');}
function act(g,id,type,extra={}){return command(g,id,{type,revision:g.revision,show:g.show,round:g.round,...extra},77);}
for(const ids of [['a'],['a','b']])test(`launch starts only the first song with ${ids.length} player(s), despite duplicate updates`,()=>{
 let g=newGame();g.players=ids.map(id=>player(id,id));
 const clients=ids.map(id=>({id,advance:new RewardAdvance()}));
 for(const {id,advance} of clients){advance.observe(null,g,id);assert.equal(advance.take(g,id),false);}
 const lobby=g;g=act(g,ids[0],'start');
 for(const {id,advance} of clients){
  advance.observe(lobby,g,id);advance.observe(g,structuredClone(g),id);
  assert.equal(advance.take(g,id),true);assert.equal(advance.take(g,id),false);
 }
 for(const {id} of clients){
  const previous=g;g=act(g,id,'ready');
  for(const client of clients){client.advance.observe(previous,g,client.id);assert.equal(client.advance.take(g,client.id),false);}
 }
 assert.equal(g.round,1);assert.equal(g.phase,'draft');
 for(const {id,advance} of clients){advance.observe(g,structuredClone(g),id);assert.equal(advance.take(g,id),false);}
});
test('reward completion auto-readies once in solo and stops after that song',()=>{
 let g=setup();g=act(g,'a','ready');const advance=new RewardAdvance();
 assert.equal(g.phase,'draft');const next=act(g,'a','draft',{kind:g.players[0].songOffers[0]});advance.observe(g,next,'a');
 assert.equal(advance.take(next,'a'),true);assert.equal(advance.take(next,'a'),false);
 const played=act(next,'a','ready');advance.observe(next,played,'a');assert.equal(played.round,2);assert.equal(advance.take(played,'a'),false);
});
test('coop waits for both choices, then each client readies once despite duplicate updates',()=>{
 let g=setup(['a','b']);g=act(act(g,'a','ready'),'b','ready');const a=new RewardAdvance(),b=new RewardAdvance();
 const one=act(g,'a','draft',{action:'skip'});a.observe(g,one,'a');b.observe(g,one,'b');assert.equal(a.take(one,'a'),false);
 const both=act(one,'b','draft',{action:'skip'});a.observe(one,both,'a');b.observe(one,both,'b');
 assert.equal(a.take(both,'a'),true);assert.equal(b.take(both,'b'),true);
 let ready=act(both,'a','ready');a.observe(both,ready,'a');assert.equal(a.take(ready,'a'),false);
 const played=act(ready,'b','ready');assert.equal(played.round,2);assert.equal(played.phase,'draft');
 a.observe(ready,played,'a');b.observe(ready,played,'b');assert.equal(a.take(played,'a'),false);assert.equal(b.take(played,'b'),false);
});
test('successful studio choice or skip queues first song of the next show',()=>{
 for(const action of ['skip','add','upgrade','remove']){
  let g=setup();g.players[0].inventory.forEach(t=>t.level=30);for(let i=0;i<5;i++){g=act(g,'a','ready');if(g.phase==='draft')g=act(g,'a','draft',{action:'skip'});}
  assert.equal(g.phase,'reward');const advance=new RewardAdvance(),p=g.players[0];
  const next=act(g,'a','reward',{action,kind:p.offers[0],tileId:p.inventory[0].id});advance.observe(g,next,'a');
  assert.equal(next.round,0);assert.equal(advance.take(next,'a'),true);assert.equal(act(next,'a','ready').round,1);
 }
});
test('merely inspecting or opening a reward never starts a song',()=>{
 const advance=new RewardAdvance(),g=setup();advance.observe(g,structuredClone(g),'a');assert.equal(advance.take(g,'a'),false);
 advance.clear();assert.equal(advance.take(g,'a'),false);
});
test('resolution accelerates gently from 1.5x to a hard 2.25x ceiling and conserves totals',()=>{
 assert.equal(resolutionSpeed(0),1.5);assert.equal(resolutionSpeed(4500),1.6875);assert.equal(resolutionSpeed(9000),2.25);assert.equal(resolutionSpeed(999999),2.25);
 let g=setup(['a','b']);g=act(act(g,'a','ready'),'b','ready');const p=resolutionPlan(g.players,{q:0,e:0});
 const timings=p.groups.flatMap(g=>g.timings);for(let i=1;i<timings.length;i++)assert.ok(timings[i].duration<=timings[i-1].duration);
 for(const g of p.groups)for(const t of g.timings)assert.ok(t.duration<=620/1.5&&t.duration>=620/2.25);
 assert.deepEqual(resolutionFrame(p,p.duration).score,{q:g.q,e:g.e});
});
test('large scores get distinct praise, small scores do not spam commentary',()=>{
 assert.equal(scoreCallout({q:3,e:2}),null);assert.equal(scoreCallout({q:10}).text,'GREAT!');assert.equal(scoreCallout({q:40}).text,'FANTASTIC!');assert.equal(scoreCallout({q:70,e:20}).rank,4);
});
test('announcer says only the name with one fading echo; stop cancels it',async()=>{
 const calls=[],host={speechSynthesis:{speak:u=>calls.push(u),cancel(){},getVoices:()=>[]},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 const audio=new ResolutionAudio(()=>true,host);audio.announce('YUMMY');assert.equal(calls[0].text,'Yummy');calls[0].onend();
 await new Promise(r=>setTimeout(r,85));assert.equal(calls.length,2);assert.equal(calls[1].text,'Yummy');assert.ok(calls[1].volume<calls[0].volume);
 audio.announce('Simon');calls[2].onend();audio.stop();await new Promise(r=>setTimeout(r,85));assert.equal(calls.length,3);
});
