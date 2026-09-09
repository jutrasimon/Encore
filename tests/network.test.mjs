import test from 'node:test';
import assert from 'node:assert/strict';
import {BandConnection,inviteCode,syncDelay} from '../dist/network.js';

const game={revision:2,phase:'draft',players:[{id:'a',drafted:true},{id:'b',drafted:false}]};
const snapshot={id:'a',game,online:['a','b']};
function connection(callbacks={}){
 const c=new BandConnection('https://example.test',{token:'a'.repeat(64),code:'ABCDEF123456',name:'A'},
  {state:()=>{},status:()=>{},error:()=>{},revision:()=>2,...callbacks});
 c.schedule=()=>{};
 return c;
}

test('invitation accepts shared URLs, grouped codes and lowercase; rejects invalid codes',()=>{
 for(const input of ['abcdef123456','ABCD EF12 3456','ABCD-EF12-3456','https://jutrasimon.github.io/Encore/?band=ABCDEF123456'])assert.equal(inviteCode(input),'ABCDEF123456');
 for(const input of ['',null,'https://example.test/','ABCDEF12345','not a code'])assert.equal(inviteCode(input),null);
});

test('a player who chose a tile waits with fast synchronization, then returns to normal pacing',()=>{
 assert.equal(syncDelay(game,'a'),1500);
 assert.equal(syncDelay(game,'b'),4000);
 assert.equal(syncDelay({...game,phase:'show'},'a'),4000);
 assert.equal(syncDelay(game,'a',10),15000);
});

test('initial connection recovers after a temporary error with the same player identity',async t=>{
 const calls=[],states=[],errors=[];
 t.mock.method(globalThis,'fetch',async(_url,options)=>{
  calls.push(options);
  return calls.length===1?new Response('{"error":"temporary"}',{status:503}):Response.json(snapshot);
 });
 const c=connection({state:s=>states.push(s),error:e=>errors.push(e)});
 await c.open();
 assert.equal(calls.length,2);assert.deepEqual(calls[0].headers,calls[1].headers);
 assert.equal(states.length,1);assert.equal(c.id,'a');assert.equal(errors.length,0);c.close();
});

test('a full band is reported once without retrying',async t=>{
 let calls=0,error;
 t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response('{"error":"Band complet"}',{status:409});});
 const c=connection({error:e=>error=e});await c.open();assert.equal(calls,1);assert.equal(error.status,409);c.close();
});

test('lost action response retries the same request ID without applying an action twice',async t=>{
 const bodies=[];
 t.mock.method(globalThis,'fetch',async(_url,options)=>{
  bodies.push(JSON.parse(options.body));
  if(bodies.length===1)throw new TypeError('connection lost');
  return Response.json(snapshot);
 });
 const c=connection();const result=await c.send({type:'ready',revision:1});
 assert.equal(bodies.length,2);assert.equal(bodies[0].requestId,bodies[1].requestId);
 assert.equal(result.game.revision,2);c.close();
});

test('older sync responses cannot replace a newer action state',async t=>{
 const c=connection();c.id='a';c.game={...game,revision:5};
 t.mock.method(globalThis,'fetch',async()=>Response.json(snapshot));
 await c.sync();assert.equal(c.game.revision,5);c.close();
});
