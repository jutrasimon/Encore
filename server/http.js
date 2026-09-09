import {GameError, hash, makeRoom, snapshot, transact} from './room.js';

const allowedOrigins=new Set(['https://jutrasimon.github.io','http://localhost:8000','http://127.0.0.1:8000']);
export function handler(store) {
 return async request=>{
  const origin=request.headers.get('Origin');
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, apikey',
    'Access-Control-Max-Age':'86400',...(allowedOrigins.has(origin)?{'Access-Control-Allow-Origin':origin}:{})};
  const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
  if(origin&&!allowedOrigins.has(origin))return respond({error:'Origine non autorisée.'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const path=new URL(request.url).pathname.split('/').at(-1);
  if(path==='health'&&request.method==='GET')return respond({ok:true,protocol:2,rules:3});
  if(request.method!=='POST')return respond({error:'Méthode non autorisée.'},405);
  try {
    const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');
    if(!/^[a-f0-9]{64}$/.test(token||''))throw new GameError('Identité invalide.',401);
    if(Number(request.headers.get('Content-Length'))>4096)throw new GameError('Message trop long.',413);
    const reader=request.body?.getReader();let raw='',bytes=0;
    if(reader){const decoder=new TextDecoder();while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.length;if(bytes>4096){await reader.cancel();throw new GameError('Message trop long.',413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}
    let msg;try{msg=JSON.parse(raw);}catch{throw new GameError('Message invalide.');}
    if(!msg||typeof msg!=='object'||Array.isArray(msg))throw new GameError('Message invalide.');
    const credential=await hash(token);
    if(path==='create'||msg.type==='hello'){
      msg.name=typeof msg.name==='string'?msg.name.trim().slice(0,20):'';
      if(!msg.name)throw new GameError('Choisis un nom de scène.');
    }
    if(path==='create') {
      const code=crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase();
      const room=makeRoom(code,credential,msg.name);
      const inserted=await store.create(room,credential);
      return respond({code:inserted.code,...snapshot(inserted,credential)},201);
    }
    if(path!=='room'||!/^[A-F0-9]{12}$/.test(msg.code||''))throw new GameError('Code de band invalide.');
    if(!['hello','sync','start','ready','reward','draft','focus'].includes(msg.type))throw new GameError('Action inconnue.');
    if(!['hello','sync'].includes(msg.type)&&!/^[a-f0-9-]{36}$/.test(msg.requestId||''))throw new GameError('Identifiant d’action invalide.');
    return respond(await transact(store,msg.code,credential,msg));
  }catch(error){
    if(error instanceof GameError)return respond({error:error.message},error.status);
    // Rule errors contain game-facing messages; storage errors never expose credentials or SQL.
    if(error?.name==='StorageError')return respond({error:'Serveur temporairement indisponible. Ta tournée est conservée.'},503);
    return respond({error:error instanceof Error?error.message:'Action refusée.'},400);
  }
 };
}
