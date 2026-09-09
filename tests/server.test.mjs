import test from 'node:test';
import assert from 'node:assert/strict';
import {handler} from '../server/http.js';
import {hash} from '../server/room.js';

class MemoryStore {
 rooms=new Map();
 async get(code){return structuredClone(this.rooms.get(code)||null);}
 async create(room,credential){
  const existing=[...this.rooms.values()].find(r=>r.members[credential]);
  if(existing)return structuredClone(existing);
  this.rooms.set(room.code,structuredClone(room));return structuredClone(room);
 }
 async replace(room,version){
  if(this.rooms.get(room.code).version!==version)return false;
  this.rooms.set(room.code,structuredClone({...room,version:version+1}));return true;
 }
}
const tokens=['a'.repeat(64),'b'.repeat(64),'c'.repeat(64)];
function client(fetcher,token){return async(path,body)=>{
 const response=await fetcher(new Request('https://example.test/functions/v1/encore/'+path,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Origin:'https://jutrasimon.github.io'},body:JSON.stringify(body)}));
 return {status:response.status,...await response.json()};
};}
async function setup(){const store=new MemoryStore(),fetcher=handler(store),a=client(fetcher,tokens[0]),b=client(fetcher,tokens[1]),c=client(fetcher,tokens[2]);const room=await a('create',{name:'Simon'});const joined=await b('room',{code:room.code,type:'hello',name:'Alex'});return{store,fetcher,a,b,c,code:room.code,game:joined.game};}
const action=(code,g,type,extra={})=>({code,type,revision:g.revision,show:g.show,round:g.round,requestId:crypto.randomUUID(),...extra});
function resetRate(store,code){for(const member of Object.values(store.rooms.get(code).members))member.lastAction=0;}

test('HTTP identity, capacity, origin and malformed messages',async()=>{
 const {fetcher,a,b,c,code,game}=await setup();
 assert.equal((await c('room',{code,type:'sync'})).status,401);
 assert.equal((await c('room',{code,type:'hello',name:'Third'})).status,409);
 assert.equal((await b('room',action(code,game,'start'))).status,400);
 const state=await a('room',{code,type:'sync'});
 assert(!JSON.stringify(state).includes(tokens[0]));assert(!('members' in state));assert(!('version' in state));
 assert.equal((await fetcher(new Request('https://example.test/health',{headers:{Origin:'https://evil.test'}}))).status,403);
 assert.equal((await fetcher(new Request('https://example.test/room',{method:'POST',headers:{Authorization:'Bearer '+tokens[0]},body:'x'.repeat(4097)}))).status,413);
 assert.equal((await client(fetcher,'bad')('room',{code,type:'sync'})).status,401);
});
test('concurrent Ready commits resolve exactly one round; retries are idempotent',async()=>{
 const {a,b,store,code,game}=await setup();
 const start=await a('room',action(code,game,'start'));resetRate(store,code);
 const ma=action(code,start.game,'ready'),mb=action(code,start.game,'ready');
 const results=await Promise.all([a('room',ma),b('room',mb)]);
 assert(results.every(r=>r.status===200));assert.equal(store.rooms.get(code).game.round,1);
 const before=structuredClone(store.rooms.get(code).game);
 assert.equal((await a('room',ma)).status,200);
 assert.deepEqual(store.rooms.get(code).game,before);
 resetRate(store,code);assert.equal((await a('room',{...ma,requestId:crypto.randomUUID()})).status,400);
});
test('server reinstantiation preserves identity and inventory; read revision omits unchanged game',async()=>{
 const {a,store,code,game}=await setup();
 const started=await a('room',action(code,game,'start'));
 const again=client(handler(store),tokens[0]);
 const state=await again('room',{code,type:'hello',name:'Changed'});
 assert.deepEqual(state.game,started.game);assert.equal(state.id,started.id);
 assert(!('game' in await again('room',{code,type:'sync',knownRevision:state.game.revision})));
});
test('concurrent join never admits a third member',async()=>{
 const store=new MemoryStore(),fetcher=handler(store),a=client(fetcher,tokens[0]);
 const created=await a('create',{name:'Simon'});
 const results=await Promise.all(tokens.slice(1).map(t=>client(fetcher,t)('room',{code:created.code,type:'hello',name:'Guest'})));
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 assert.equal(store.rooms.get(created.code).game.players.length,2);
});
test('expired rooms cannot be read and creation does not expose credential hashes',async()=>{
 const {a,store,code}=await setup();store.rooms.get(code).expires_at=new Date(0).toISOString();
 assert.equal((await a('room',{code,type:'sync'})).status,404);
 const store2=new MemoryStore(),a2=client(handler(store2),tokens[0]);
 const first=await a2('create',{name:'Simon'}),retry=await a2('create',{name:'Simon'});
 assert.equal(first.code,retry.code);assert.equal(store2.rooms.size,1);
 assert(!JSON.stringify(first).includes(await hash(tokens[0])));
});
test('HTTP focus and concurrent song choices persist and reject duplicate rewards',async()=>{
 const {a,b,store,code,game}=await setup();let r=await a('room',action(code,game,'start'));resetRate(store,code);
 r=await a('room',action(code,r.game,'focus',{tileId:r.id+'-0'}));assert.equal(r.status,200);assert.equal(r.game.players[0].focusedIds.length,1);resetRate(store,code);
 await Promise.all([a('room',action(code,r.game,'ready')),b('room',action(code,r.game,'ready'))]);resetRate(store,code);
 const g=store.rooms.get(code).game;assert.equal(g.phase,'draft');
 const ma=action(code,g,'draft',{kind:g.players[0].songOffers[0]}),mb=action(code,g,'draft',{kind:g.players[1].songOffers[0]});
 const results=await Promise.all([a('room',ma),b('room',mb)]);assert(results.every(r=>r.status===200));
 assert.equal(store.rooms.get(code).game.phase,'show');assert(store.rooms.get(code).game.players.every(p=>p.inventory.length===6));
 assert.equal((await a('room',ma)).status,200);assert.equal(store.rooms.get(code).game.players[0].inventory.length,6);
 resetRate(store,code);assert.equal((await a('room',{...ma,requestId:crypto.randomUUID()})).status,400);
 const restored=await a('room',{code,type:'hello',name:'A'});assert.equal(restored.game.players[0].focusedIds.length,1);
});
