export const credential=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function api(endpoint,path,token,body) {
 const response=await fetch(endpoint+'/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
 let data;try{data=await response.json();}catch{throw Error('Réponse du serveur indisponible. Réessaie.');}
 if(!response.ok){const error=new Error(data.error||'Le serveur est indisponible.');error.status=response.status;throw error;}
 return data;
}
export function inviteCode(value){
 let text=String(value??'').trim();
 try{const url=new URL(text);text=url.searchParams.get('band')||'';}catch{}
 text=text.replace(/[\s-]/g,'').toUpperCase();
 return /^[A-F0-9]{12}$/.test(text)?text:null;
}
// Keep wait states responsive, including the choice between songs.
export function syncDelay(game,id,failures=0){
 if(failures)return Math.min(15000,2000*2**failures);
 const me=game?.players.find(p=>p.id===id);
 const waiting=game?.phase==='lobby'||game?.phase==='show'&&me?.ready||game?.phase==='draft'&&me?.drafted||game?.phase==='reward'&&me?.rewarded;
 return waiting?1500:4000;
}
// No polling on the home screen, after the tour, or in a hidden browser tab.
export class BandConnection {
 constructor(endpoint,session,callbacks){Object.assign(this,{endpoint,session,callbacks,closed:false,inflight:false,failures:0,pending:false});}
 async open(){
  for(let attempt=0;attempt<3&&!this.closed;attempt++){
   try{const data=await api(this.endpoint,'room',this.session.token,{code:this.session.code,type:'hello',name:this.session.name});
    if(this.closed)return;this.id=data.id;this.game=data.game;this.failures=0;this.callbacks.state(data);this.schedule();return;
   }catch(e){
    if(this.closed)return;
    if(attempt===2||e.status&&e.status<500){this.callbacks.error(e);return;}
    this.callbacks.status(false);
    await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
   }
  }
 }
 schedule(){
  clearTimeout(this.timer);if(this.closed||['won','lost'].includes(this.game?.phase))return;
  this.timer=setTimeout(()=>this.sync(),syncDelay(this.game,this.id,this.failures));
 }
 async sync(){
  if(this.closed)return;
  if(this.inflight){this.pending=true;return;}
  if(typeof document!=='undefined'&&document.hidden){this.schedule();return;}
  this.inflight=true;
  try{
   const data=await api(this.endpoint,'room',this.session.token,{code:this.session.code,type:'sync',knownRevision:this.callbacks.revision(),activity:this.callbacks.activity?.()});
   if(this.closed)return;
   this.id=data.id;if(data.game&&(!this.game||data.game.revision>=this.game.revision))this.game=data.game;
   this.failures=0;this.callbacks.state(data);
  }catch(e){if(!this.closed){this.failures++;this.callbacks.status(false);if([401,404].includes(e.status)){this.close();this.callbacks.error(e);}}}
  finally{this.inflight=false;if(this.pending){this.pending=false;this.sync();}else this.schedule();}
 }
 async send(message){
  const body={...message,code:this.session.code,requestId:crypto.randomUUID()};
  let data;
  // A lost response may follow a successful commit. Reuse the same ID on retry.
  for(let attempt=0;attempt<2;attempt++){
   try{data=await api(this.endpoint,'room',this.session.token,body);break;}
   catch(e){
    if(attempt||e.status&&e.status<500&&e.status!==429)throw e;
    // The next song can follow a committed choice faster than the server's 200ms guard.
    if(e.status===429)await new Promise(resolve=>setTimeout(resolve,260));
    if(this.closed)throw e;
   }
  }
  this.id=data.id;if(data.game&&(!this.game||data.game.revision>=this.game.revision))this.game=data.game;
  this.schedule();return data;
 }
 close(){this.closed=true;clearTimeout(this.timer);}
}
