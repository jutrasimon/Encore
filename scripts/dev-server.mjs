// Local test server: serves dist/ and runs the real multiplayer handler on an in-memory store.
// Nothing touches Supabase or real saves; rooms vanish when the process stops.
// Usage: node scripts/dev-server.mjs  →  http://localhost:8000/ (an allowed origin of server/http.js)
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {handler} from '../server/http.js';

class MemoryStore{
 rooms=new Map();
 async get(code){return structuredClone(this.rooms.get(code)||null);}
 async create(room,credential){
  const existing=[...this.rooms.values()].find(r=>r.members[credential]);
  if(existing)return structuredClone(existing);
  this.rooms.set(room.code,structuredClone(room));return structuredClone(room);
 }
 async replace(room,version){
  if(this.rooms.get(room.code)?.version!==version)return false;
  this.rooms.set(room.code,structuredClone({...room,version:version+1}));return true;
 }
}
const api=handler(new MemoryStore()),root=new URL('../dist/',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.json':'application/json'};
const port=Number(process.env.PORT||8000);
createServer(async(req,res)=>{
 const url=new URL(req.url,`http://${req.headers.host}`);
 if(url.pathname.startsWith('/api/')){
  const body=['GET','HEAD','OPTIONS'].includes(req.method)?undefined:await new Promise(r=>{const parts=[];req.on('data',p=>parts.push(p));req.on('end',()=>r(Buffer.concat(parts)));});
  const response=await api(new Request(url,{method:req.method,headers:req.headers,body}));
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
 }
 // The shipped config points at Supabase; locally the same origin answers instead.
 if(url.pathname==='/config.js'){res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});res.end(`export const SERVER_URL = '${url.origin}/api';\n`);return;}
 const file=normalize(join(root,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname)));
 if(!file.startsWith(normalize(root))){res.writeHead(403);res.end();return;}
 try{const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}
 catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`ENCORE dev server on http://localhost:${port}/ (coop in memory)`));
