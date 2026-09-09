export const credential=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function api(endpoint,path,token,body) {
 const response=await fetch(endpoint+'/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
 let data;try{data=await response.json();}catch{throw Error('Réponse du serveur indisponible. Réessaie.');}
 if(!response.ok){const error=new Error(data.error||'Le serveur est indisponible.');error.status=response.status;throw error;}
 return data;
}
// Turn-based synchronization. While waiting for the band: 2 s. Otherwise: 10 s.
// No polling on the home screen, after the tour, or in a hidden browser tab.
export class BandConnection {
 constructor(endpoint,session,callbacks){Object.assign(this,{endpoint,session,callbacks,closed:false,inflight:false,failures:0,pending:false});}
 async open(){
  try{const data=await api(this.endpoint,'room',this.session.token,{code:this.session.code,type:'hello',name:this.session.name});
   if(this.closed)return;this.id=data.id;this.game=data.game;this.callbacks.state(data);this.schedule();
  }catch(e){if(!this.closed)this.callbacks.error(e);}
 }
 schedule(){
  clearTimeout(this.timer);if(this.closed||['won','lost'].includes(this.game?.phase))return;
  const me=this.game?.players.find(p=>p.id===this.id);
  const waiting=this.game?.phase==='lobby'||me?.ready||me?.rewarded;
  this.timer=setTimeout(()=>this.sync(),this.failures?Math.min(30000,2000*2**this.failures):waiting?2000:10000);
 }
 async sync(){
  if(this.closed)return;
  if(this.inflight){this.pending=true;return;}
  if(document.hidden){this.schedule();return;}
  this.inflight=true;
  try{
   const data=await api(this.endpoint,'room',this.session.token,{code:this.session.code,type:'sync',knownRevision:this.callbacks.revision()});
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
   catch(e){if(attempt||e.status&&e.status<500)throw e;}
  }
  this.id=data.id;if(data.game&&(!this.game||data.game.revision>=this.game.revision))this.game=data.game;
  this.schedule();return data;
 }
 close(){this.closed=true;clearTimeout(this.timer);}
}
