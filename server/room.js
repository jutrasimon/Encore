import {newGame, lobbyPlayer, command} from '../dist/engine.js';

export class GameError extends Error {
  constructor(message, status=400) { super(message); this.status=status; }
}
const activities=new Set(['board','resolving','choice','inventory','studio-add','studio-upgrade','studio-remove']);
export const hash = async token => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))].map(n=>n.toString(16).padStart(2,'0')).join('');
const randomSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
export function makeRoom(code, credential, name, now=Date.now()) {
  const id=crypto.randomUUID(), game=newGame();
  game.players.push(lobbyPlayer(id,name)); game.revision++;
  return {code, version:0, game, members:{[credential]:{id,seen:now,requests:[]}}, expires_at:new Date(now+86400000).toISOString()};
}
export function snapshot(room, credential, knownRevision, now=Date.now()) {
  const member=room.members[credential];
  if(!member) throw new GameError('Connexion requise.',401);
  return {id:member.id, revision:room.game.revision,
    activities:Object.fromEntries(Object.values(room.members).map(m=>[m.id,m.activity||'board'])),
    online:Object.values(room.members).filter(m=>now-m.seen<65000).map(m=>m.id),
    ...(knownRevision===room.game.revision?{}:{game:room.game})};
}
// Compare-and-swap on the storage version protects against concurrent Edge instances.
// Retrying the same action ID returns the saved result instead of applying it twice.
export async function transact(store, code, credential, msg, now=Date.now()) {
  const seed=randomSeed();
  for(let attempt=0;attempt<8;attempt++) {
    const room=await store.get(code);
    if(!room||Date.parse(room.expires_at)<=now) throw new GameError('Ce band a expiré. Crée une nouvelle tournée.',404);
    let member=room.members[credential];
    if(!member) {
      if(msg.type!=='hello') throw new GameError('Connexion requise.',401);
      if(room.game.phase!=='lobby'||room.game.players.length>=2) throw new GameError('Band complet ou tournée déjà commencée.',409);
      const id=crypto.randomUUID(); member={id,seen:now,requests:[]};
      room.members[credential]=member; room.game.players.push(lobbyPlayer(id,msg.name));room.game.revision++;
    } else if(msg.type==='sync'&&now-member.seen<20000&&(!activities.has(msg.activity)||msg.activity===member.activity)) {
      return snapshot(room,credential,msg.knownRevision,now);
    } else if(!['hello','sync'].includes(msg.type)) {
      if(member.requests.includes(msg.requestId)) return snapshot(room,credential,undefined,now);
      if(now-(member.lastAction||0)<200) throw new GameError('Un instant avant la prochaine action.',429);
      if(msg.type==='start'&&room.game.players.length!==2)throw new GameError('Attends le deuxième musicien avant de lancer la tournée.',409);
      room.game=command(room.game,member.id,msg,seed);
      member.lastAction=now;member.requests=[...member.requests.slice(-15),msg.requestId];
    }
    if(activities.has(msg.activity))member.activity=msg.activity;
    member.seen=now;
    room.expires_at=new Date(now+86400000).toISOString();
    if(await store.replace(room,room.version)) return snapshot(room,credential,msg.type==='sync'?msg.knownRevision:undefined,now);
  }
  throw new GameError('Le band bouge vite. Réessaie.',409);
}
