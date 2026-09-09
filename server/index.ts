import {handler} from './http.js';

const base=Deno.env.get('SUPABASE_URL')!;
const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
async function database(path:string,method='GET',body?:unknown) {
  const response=await fetch(base+'/rest/v1/'+path,{method,
    headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json',Prefer:'return=representation'},
    ...(body===undefined?{}:{body:JSON.stringify(body)})});
  if(!response.ok){const error=new Error('Database unavailable');error.name='StorageError';throw error;}
  return response.status===204?null:response.json();
}
const store={
  async get(code:string){return (await database('encore_rooms?code=eq.'+code+'&select=*'))[0]||null;},
  async create(room:unknown,credential:string){return database('rpc/encore_create_room','POST',{room_data:room,creator_hash:credential});},
  async replace(room:{code:string;version:number},version:number){
    const rows=await database('encore_rooms?code=eq.'+room.code+'&version=eq.'+version,'PATCH',{...room,version:version+1});
    return rows.length===1;
  }
};
// JWT verification is disabled at the gateway because http.js authenticates unique,
// random 256-bit player credentials and checks membership before every room read/write.
// The service role key is only read on the server, never bundled into the browser.
Deno.serve(handler(store));
