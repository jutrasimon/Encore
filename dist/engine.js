// Shared deterministic rules. Network games execute these only on the server.
export const TILES = {
 guitar:{name:'Six-cordes rafistolée',icon:'guitar',family:'guitar',q:1,build:'Essentiels',text:'1 qualité. ×2 par Voix adjacente.'},
 voice:{name:'Micro cabossé',icon:'mic',family:'voice',e:1,build:'Essentiels',text:'1 énergie. ×2 par Guitare adjacente.'},
 pick:{name:'Médiator fétiche',icon:'pick',build:'Essentiels',text:'Les Guitares adjacentes gagnent +1 qualité avant les multiplicateurs.'},
 boot:{name:'Botte de tempo',icon:'boot',build:'Essentiels',text:'+1 énergie par Guitare ou Voix adjacente.'},
 lighter:{name:'Briquet cheap',icon:'flame',e:1,build:'Génériques',text:'+1 énergie par autre Briquet sur la grille.'},
 duck:{name:'Canard de scène',icon:'duck',build:'Génériques',text:'+1 fan par sorte de tuile active adjacente différente.'},
 smoke:{name:'Fumée de garage',icon:'cloud',build:'Ça tient avec du tape',text:'+2 énergie par case vide ou tuile désactivée adjacente.'},
 cup:{name:'Gobelet suspect',icon:'cup',build:'Génériques',text:'+2 charges aux tuiles à charges adjacentes. S’épuise après la chanson.'},
 refrain:{name:'Refrain parasite',icon:'worm',family:'voice',charge:true,build:'Refrain contagieux',text:'Gagne 1 charge à chaque apparition. Produit autant d’énergie que de charges. Voix : ×2 par Guitare adjacente.'},
 choir:{name:'Chorale du fond',icon:'choir',build:'Refrain contagieux',text:'+1 énergie par Voix active sur la grille.'},
 last:{name:'Une dernière!',icon:'mic',family:'voice',e:1,build:'Refrain contagieux',text:'Voix. 1 énergie ; 6 à la dernière chanson. ×2 par Guitare adjacente.'},
 solo:{name:'Solo interminable',icon:'guitar',family:'guitar',q:2,build:'Solo beaucoup trop long',text:'Guitare. 6 qualité si unique Solo interminable sur la grille, sinon 2. ×2 par Voix adjacente.'},
 note:{name:'Note teeeeenue',icon:'note',family:'guitar',charge:true,build:'Solo beaucoup trop long',text:'Gagne 1 charge par apparition. À 3 charges, les dépense et produit 12 qualité. ×2 par Voix adjacente.'},
 pedal:{name:'Bouton interdit',icon:'pedal',build:'Solo beaucoup trop long',text:'Double la production des Guitares adjacentes. S’épuise après la chanson.'},
 encore:{name:'Encore! Encore!',icon:'repeat',build:'Solo beaucoup trop long',text:'Redéclenche la production des Guitares adjacentes une fois. S’épuise après la chanson.'},
 kamikaze:{name:'Guitare kamikaze',icon:'bomb',family:'guitar',q:8,build:'Ça tient avec du tape',text:'Guitare. 8 qualité, ×2 par Voix adjacente. S’épuise après la chanson.'},
 amp:{name:'Ampli à boutte',icon:'amp',e:8,build:'Ça tient avec du tape',text:'8 énergie, puis se désactive pour le show. Reste dans l’inventaire et peut être repigé.'},
 feedback:{name:'Larsen délicieux',icon:'bolt',build:'Ça tient avec du tape',text:'+3 énergie par tuile désactivée adjacente.'}
};
export const SHOWS=[{name:'Le sous-sol',crowd:'Les colocs & deux inconnus',q:34,e:32,rounds:5},{name:'Le petit pub',crowd:'Les habitués veulent du bruit',q:70,e:64,rounds:5},{name:'Le toit pirate',crowd:'Tout le quartier est au courant',q:122,e:110,rounds:5}];
export function showInfo(index=0){
 const stage=Math.max(0,Math.floor(index)),venue=SHOWS[stage%SHOWS.length],tour=Math.floor(stage/SHOWS.length)+1;
 return {...venue,name:venue.name+(tour>1?' · Tour '+tour:''),level:stage+1,tour,
  q:34+28*stage+8*stage*stage,e:32+25*stage+7*stage*stage};
}
export const ROLES={
 'guitarist-singer':{name:'Guitariste-chanteur',startingCount:5,starter:['guitar','guitar','voice','voice','pick'],focus:1,pool:Object.keys(TILES)}
};
export const STARTER=ROLES['guitarist-singer'].starter;
export const focusCapacity=p=>(p.focusBase??1)+(p.focusTemporary??0);
export function normalizeGame(input){
 const g=structuredClone(input);g.version=2;g.attempt??=0;
 // Preserve the current show's goal for saves created before the rebalance.
 if(!g.stageTarget&&g.round>0&&!g.balanceVersion){const legacy=[[24,25],[34,36],[44,46]][g.show];if(legacy)g.stageTarget={q:legacy[0]*g.players.length,e:legacy[1]*g.players.length};}
 g.balanceVersion=3;
 if(['won','lost'].includes(g.phase)){g.retry=g.phase==='lost';g.phase='reward';}

 for(const p of g.players){p.role??='guitarist-singer';p.focusBase??=ROLES[p.role]?.focus??1;p.focusTemporary??=0;p.focusedIds??=[];p.songOffers??=[];p.drafted??=false;if(g.phase==='reward'&&!p.offers?.length)p.offers=Object.keys(TILES).slice(0,3);pruneFocus(p);if(p.songOffers.length){const pool=ROLES[p.role].pool;p.songOffers=[...new Set([...p.songOffers,...pool])].filter(k=>pool.includes(k)).slice(0,3);}}
 return g;
}
function pruneFocus(p){p.focusedIds=p.focusedIds.filter(id=>p.inventory.some(t=>t.id===id&&!t.exhausted)).slice(0,focusCapacity(p));}
// Future tile effects can grant show-only focus through this helper.
export function grantTemporaryFocus(p,amount){if(!Number.isSafeInteger(amount)||amount<0)throw Error('Bonus de focus invalide.');p.focusTemporary=(p.focusTemporary??0)+amount;}
export function songOffers(p,rng){return shuffle([...new Set(ROLES[p.role].pool)],rng).slice(0,3);}

export function random(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function shuffle(a,rng){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function adjacent(i){return [i%3?i-1:-1,i%3<2?i+1:-1,i>=3?i-3:-1,i<6?i+3:-1].filter(x=>x>=0);}
export function tile(kind,id,level=0){return{id,kind,level,charges:0,inactive:false,exhausted:false};}
export function player(id,name,role='guitarist-singer'){
 const config=ROLES[role];if(!config)throw Error('Rôle inconnu.');
 return{id,name,role,inventory:config.starter.slice(0,config.startingCount).map((k,i)=>tile(k,`${id}-${i}`)),fans:0,q:0,e:0,focusBase:config.focus,focusTemporary:0,focusedIds:[],ready:false,board:[],offers:[],rewarded:false,songOffers:[],drafted:false};
}
export function newGame(){return{version:2,balanceVersion:3,attempt:0,revision:0,phase:'lobby',players:[],show:0,round:0,q:0,e:0,history:[]};}
// Weighted sampling without replacement. Focus doubles the draw weight of one copy;
// a tile never appears twice, and all eligible tiles appear when there are <= 9.
export function draw(inventory,rng,focusedIds=[]){
 const pool=inventory.filter(t=>!t.exhausted),focus=new Set(focusedIds),a=[];
 while(pool.length&&a.length<9){
  const total=pool.reduce((sum,t)=>sum+(focus.has(t.id)?2:1),0);let cursor=rng()*total;
  let i=0;for(;i<pool.length-1;i++){cursor-=focus.has(pool[i].id)?2:1;if(cursor<0)break;}
  a.push(pool.splice(i,1)[0]);
 }
 while(a.length<9)a.push(null);return shuffle(a,rng);
}
export function resolve(inventory,drawn,round=1,rounds=5){
 const board=drawn.map((t,i)=>t?{...t,index:i,q:0,e:0,f:0,m:1,repeats:0,links:[],notes:[]}:{kind:'empty',index:i,q:0,e:0,f:0,m:1,links:[],notes:[]});
 const active=t=>t.kind!=='empty'&&!t.inactive;
 const near=i=>adjacent(i).map(j=>board[j]);
 // Movement and transformations are reserved phases, unused by the first 18 types.
 // Charges first. Cups grant all their charges before threshold powers run.
 for(const t of board.filter(active))if(TILES[t.kind].charge)t.charges++;
 for(const t of board.filter(t=>active(t)&&t.kind==='cup'))for(const n of near(t.index).filter(n=>active(n)&&TILES[n.kind].charge)){n.charges+=2;t.links.push(n.index);}
 for(const t of board.filter(active)){
  const d=TILES[t.kind], ns=near(t.index), live=ns.filter(active);t.q=d.q||0;t.e=d.e||0;
  if(t.kind==='refrain')t.e=t.charges;
  if(t.kind==='note'&&t.charges>=3){t.charges-=3;t.q=12;t.notes.push('3 charges dépensées');}
  if(t.kind==='last'&&round===rounds)t.e=6;
  if(t.kind==='solo'&&board.filter(n=>active(n)&&n.kind==='solo').length===1)t.q=6;
  if(t.kind==='lighter')t.e+=board.filter(n=>active(n)&&n.kind==='lighter').length-1;
  if(t.kind==='boot')t.e=live.filter(n=>['guitar','voice'].includes(TILES[n.kind].family)).length;
  if(t.kind==='choir')t.e=board.filter(n=>active(n)&&TILES[n.kind].family==='voice').length;
  if(t.kind==='duck')t.f=new Set(live.map(n=>n.kind)).size;
  if(t.kind==='smoke')t.e=2*ns.filter(n=>n.kind==='empty'||n.inactive).length;
  if(t.kind==='feedback')t.e=3*ns.filter(n=>n.inactive).length;
  // Upgrade boosts production, not the scope/power of utility tiles.
  if(d.family==='guitar')t.q+=t.level;
  else if(t.kind==='duck')t.f+=t.level;
  else t.e+=t.level;
 }
 // Additive bonuses before multipliers, independent of board traversal.
 for(const t of board.filter(t=>active(t)&&t.kind==='pick'))for(const n of near(t.index).filter(n=>active(n)&&TILES[n.kind].family==='guitar')){n.q++;t.links.push(n.index);}
 for(const t of board.filter(active)){
  const f=TILES[t.kind].family;
  for(const n of near(t.index).filter(active)){
   const nf=TILES[n.kind].family;
   if((f==='guitar'&&nf==='voice')||(f==='voice'&&nf==='guitar')||(f==='guitar'&&n.kind==='pedal')){t.m*=2;t.links.push(n.index);}
   if(f==='guitar'&&n.kind==='encore'){t.repeats++;t.links.push(n.index);}
  }
  t.q*=t.m;t.e*=t.m;t.f*=t.m;
 }
 // Visual links include additive, charge and global contributors, without changing scores.
 for(const t of board.filter(active)){
  let contributors=[];const ns=near(t.index),live=ns.filter(active);
  if(t.kind==='boot')contributors=live.filter(n=>['guitar','voice'].includes(TILES[n.kind].family));
  if(t.kind==='duck')contributors=live;
  if(t.kind==='smoke')contributors=ns.filter(n=>n.kind==='empty'||n.inactive);
  if(t.kind==='feedback')contributors=ns.filter(n=>n.inactive);
  if(t.kind==='choir')contributors=board.filter(n=>active(n)&&TILES[n.kind].family==='voice');
  if(t.kind==='lighter')contributors=board.filter(n=>active(n)&&n.kind==='lighter'&&n.index!==t.index);
  t.links=[...new Set([...t.links,...contributors.map(n=>n.index)])];
 }
 const totals=board.reduce((a,t)=>({q:a.q+t.q*(1+(t.repeats||0)),e:a.e+t.e*(1+(t.repeats||0)),f:a.f+t.f*(1+(t.repeats||0))}),{q:0,e:0,f:0});
 // Exhaust/inactivity apply after production and become relevant next draw.
 for(const t of board.filter(active)){
  const original=inventory.find(n=>n.id===t.id);if(!original)continue;
  original.charges=t.charges;
  if(['cup','pedal','encore','kamikaze'].includes(t.kind)){original.exhausted=true;t.after='Épuisée';}
  if(t.kind==='amp'){original.inactive=true;t.after='Désactivée';}
 }
 return{board,totals};
}
export function targets(g){const n=g.players.length,s=showInfo(g.show);return g.stageTarget?{...g.stageTarget}:{q:s.q*n,e:s.e*n};}
function resetShow(g){
 g.round=0;g.q=0;g.e=0;g.retry=false;const stage=showInfo(g.show);g.stageTarget={q:stage.q*g.players.length,e:stage.e*g.players.length};
 for(const p of g.players){p.q=0;p.e=0;p.last=null;p.ready=false;p.board=[];p.rewarded=false;p.songOffers=[];p.drafted=false;p.focusTemporary=0;pruneFocus(p);for(const t of p.inventory){t.charges=0;t.inactive=false;t.exhausted=false;}}
}
function playRound(g,rng){
 g.round++;
 const song={show:g.show,attempt:g.attempt,round:g.round,players:[]};
 for(const p of g.players){
  const r=resolve(p.inventory,draw(p.inventory,rng,p.focusedIds),g.round,showInfo(g.show).rounds);
  const live=r.board.filter(t=>t.kind!=='empty'&&!t.inactive);
  const row={id:p.id,...r.totals,bonusFans:0,fans:p.fans+r.totals.f,tiles:live.length,links:live.reduce((n,t)=>n+t.links.length,0),repeats:live.reduce((n,t)=>n+(t.repeats||0),0),maxMultiplier:Math.max(1,...live.map(t=>t.m)),empty:r.board.filter(t=>t.kind==='empty').length,inactive:r.board.filter(t=>t.inactive).length,inventory:p.inventory.length,heat:r.board.map(t=>t.q*(1+(t.repeats||0))+t.e*(1+(t.repeats||0)))};
  row.byTile={};
  for(const t of live){const a=row.byTile[t.kind]??={appearances:0,q:0,e:0,f:0};a.appearances++;for(const k of ['q','e','f'])a[k]+=t[k]*(1+(t.repeats||0));}
  song.players.push(row);
  p.career??={songs:0,q:0,e:0,f:0,bonusFans:0,links:0,repeats:0,tiles:0,maxMultiplier:1,bestQ:0,bestE:0,byTile:{},heat:Array(9).fill(0)};
  const c=p.career;c.songs++;for(const k of ['q','e','f','links','repeats','tiles'])c[k]+=row[k];c.maxMultiplier=Math.max(c.maxMultiplier,row.maxMultiplier);c.bestQ=Math.max(c.bestQ,row.q);c.bestE=Math.max(c.bestE,row.e);row.heat.forEach((v,i)=>c.heat[i]+=v);
  for(const t of live){const a=c.byTile[t.kind]??={appearances:0,q:0,e:0,f:0};a.appearances++;for(const k of ['q','e','f'])a[k]+=t[k]*(1+(t.repeats||0));}
  pruneFocus(p);p.board=r.board;p.last=r.totals;p.q+=r.totals.q;p.e+=r.totals.e;p.fans+=r.totals.f;g.q+=r.totals.q;g.e+=r.totals.e;p.ready=false;
 }
 if(g.round===showInfo(g.show).rounds){
  const target=targets(g),won=g.q>=target.q&&g.e>=target.e;
  for(const p of g.players){const gain=Math.floor((p.q+p.e)/10);p.fans+=gain;p.showFans=gain;p.career.bonusFans+=gain;const row=song.players.find(r=>r.id===p.id);row.bonusFans=gain;row.fans=p.fans;p.offers=shuffle(Object.keys(TILES),rng).slice(0,3);p.focusTemporary=0;pruneFocus(p);p.songOffers=[];}
  g.history.push({show:g.show,attempt:g.attempt,q:g.q,e:g.e,won,target});g.retry=!won;g.phase='reward';
 }else{
  g.phase='draft';for(const p of g.players){p.songOffers=songOffers(p,rng);p.drafted=false;}
 }
 g.songs??=[];g.songs.push(song);if(g.songs.length>250)g.songs.splice(0,g.songs.length-250);
}
// Commands are guarded by both player identity and revision. Invalid commands never mutate state.
export function command(input,id,msg,seed=1){
 const g=normalizeGame(input),p=g.players.find(p=>p.id===id);
 if(!p)throw Error('Musicien introuvable.');
 const sameRoundReady=msg.type==='ready'&&g.phase==='show'&&msg.show===g.show&&msg.round===g.round&&!p.ready;
 const independentChoice=msg.show===g.show&&msg.round===g.round&&((msg.type==='draft'&&g.phase==='draft'&&!p.drafted)||(msg.type==='reward'&&g.phase==='reward'&&!p.rewarded));
 if(msg.revision!==g.revision&&!sameRoundReady&&!independentChoice)throw Error('La partie a avancé. Réessaie.');
 const rng=random(seed);
 if(msg.type==='start'){
  if(g.phase!=='lobby'||g.players[0].id!==id)throw Error('Seul le créateur peut lancer la tournée.');
  g.phase='show';resetShow(g);
 }else if(msg.type==='ready'){
  if(g.phase!=='show'||p.ready)throw Error('Chanson déjà validée.');
  p.ready=true;if(g.players.every(p=>p.ready))playRound(g,rng);
 }else if(msg.type==='focus'){
  if(!['lobby','show','draft','reward'].includes(g.phase)||p.ready)throw Error('Change ton focus entre les chansons, avant de te déclarer prêt.');
  const t=p.inventory.find(t=>t.id===msg.tileId);if(!t)throw Error('Tuile introuvable.');
  if(t.exhausted)throw Error('Cette tuile est épuisée : aucun focus possible.');
  if(p.focusedIds.includes(t.id))p.focusedIds=p.focusedIds.filter(id=>id!==t.id);
  else{if(p.focusedIds.length>=focusCapacity(p))throw Error('Retire un focus pour le déplacer sur cette tuile.');p.focusedIds.push(t.id);}
 }else if(msg.type==='draft'){
  if(g.phase!=='draft'||p.drafted)throw Error('Choix déjà fait ou indisponible.');
  if(msg.action!=='skip'){if(!p.songOffers.includes(msg.kind)||!ROLES[p.role].pool.includes(msg.kind))throw Error('Tuile non proposée.');
  p.inventory.push(tile(msg.kind,`${id}-song-${g.show}-${g.attempt}-${g.round}`));}p.drafted=true;p.songOffers=[];
  if(g.players.every(p=>p.drafted))g.phase='show';
 }else if(msg.type==='reward'){
  if(g.phase!=='reward'||p.rewarded)throw Error('Récompense indisponible.');
  if(msg.action==='add'){
   if(!p.offers.includes(msg.kind))throw Error('Tuile non proposée.');
   p.inventory.push(tile(msg.kind,`${id}-reward-${g.show}-${g.attempt}`));
  }else if(msg.action==='upgrade'){
   const t=p.inventory.find(t=>t.id===msg.tileId);if(!t||!Number.isSafeInteger(t.level+1))throw Error('Amélioration impossible.');t.level++;
  }else if(msg.action==='remove'){
   if(!p.inventory.some(t=>t.id===msg.tileId))throw Error('Tuile introuvable.');p.inventory=p.inventory.filter(t=>t.id!==msg.tileId);pruneFocus(p);
  }else if(msg.action!=='skip')throw Error('Choix inconnu.');
  p.rewarded=true;if(g.players.every(p=>p.rewarded)){if(!g.retry)g.show++;g.attempt++;g.phase='show';resetShow(g);}
 }else throw Error('Action inconnue.');
 g.revision++;return g;
}
