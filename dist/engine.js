// Shared deterministic rules. Network games execute these only on the server.
export const TILES = {
 guitar:{name:'Six-cordes rafistolée',icon:'guitar',family:'guitar',q:1,build:'Essentiels',text:'1 qualité. ×2 par Voix adjacente.'},
 voice:{name:'Micro cabossé',icon:'mic',family:'voice',e:1,build:'Essentiels',text:'1 énergie. ×2 par Guitare adjacente.'},
 pick:{name:'Médiator fétiche',icon:'pick',build:'Essentiels',text:'Les Guitares adjacentes gagnent +1 qualité avant les multiplicateurs.'},
 boot:{name:'Botte de tempo',icon:'boot',build:'Essentiels',text:'+1 énergie par Guitare ou Voix adjacente.'},
 lighter:{name:'Briquet cheap',icon:'flame',e:1,build:'Génériques',text:'+1 énergie par autre Briquet sur la grille.'},
 duck:{name:'Canard de scène',icon:'duck',build:'Génériques',text:'+1 fan par sorte de tuile active adjacente différente.'},
 smoke:{name:'Fumée de garage',icon:'cloud',build:'Ça tient avec du tape',text:'+2 énergie par case vide ou tuile désactivée adjacente.'},
 cup:{name:'Gobelet suspect',icon:'cup',build:'Génériques',text:'+2 charges aux tuiles à charges adjacentes. S’épuise après la manche.'},
 refrain:{name:'Refrain parasite',icon:'worm',family:'voice',charge:true,build:'Refrain contagieux',text:'Gagne 1 charge à chaque apparition. Produit autant d’énergie que de charges. Voix : ×2 par Guitare adjacente.'},
 choir:{name:'Chorale du fond',icon:'choir',build:'Refrain contagieux',text:'+1 énergie par Voix active sur la grille.'},
 last:{name:'Une dernière!',icon:'mic',family:'voice',e:1,build:'Refrain contagieux',text:'Voix. 1 énergie ; 6 à la dernière manche. ×2 par Guitare adjacente.'},
 solo:{name:'Solo interminable',icon:'guitar',family:'guitar',q:2,build:'Solo beaucoup trop long',text:'Guitare. 6 qualité si unique Solo interminable sur la grille, sinon 2. ×2 par Voix adjacente.'},
 note:{name:'Note teeeeenue',icon:'note',family:'guitar',charge:true,build:'Solo beaucoup trop long',text:'Gagne 1 charge par apparition. À 3 charges, les dépense et produit 12 qualité. ×2 par Voix adjacente.'},
 pedal:{name:'Bouton interdit',icon:'pedal',build:'Solo beaucoup trop long',text:'Double la production des Guitares adjacentes. S’épuise après la manche.'},
 encore:{name:'Encore! Encore!',icon:'repeat',build:'Solo beaucoup trop long',text:'Redéclenche la production des Guitares adjacentes une fois. S’épuise après la manche.'},
 kamikaze:{name:'Guitare kamikaze',icon:'bomb',family:'guitar',q:8,build:'Ça tient avec du tape',text:'Guitare. 8 qualité, ×2 par Voix adjacente. S’épuise après la manche.'},
 amp:{name:'Ampli à boutte',icon:'amp',e:8,build:'Ça tient avec du tape',text:'8 énergie, puis se désactive pour le show. Reste dans l’inventaire et peut être repigé.'},
 feedback:{name:'Larsen délicieux',icon:'bolt',build:'Ça tient avec du tape',text:'+3 énergie par tuile désactivée adjacente.'}
};
export const SHOWS=[{name:'Le sous-sol',crowd:'Les colocs & deux inconnus',q:24,e:25,rounds:5},{name:'Le petit pub',crowd:'Les habitués veulent du bruit',q:34,e:36,rounds:5},{name:'Le toit pirate',crowd:'Tout le quartier est au courant',q:44,e:46,rounds:5}];
export const STARTER=['guitar','guitar','guitar','voice','voice','voice','pick','boot','lighter','duck','refrain','amp'];
export function random(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function shuffle(a,rng){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function adjacent(i){return [i%3?i-1:-1,i%3<2?i+1:-1,i>=3?i-3:-1,i<6?i+3:-1].filter(x=>x>=0);}
export function tile(kind,id,level=0){return{id,kind,level,charges:0,inactive:false,exhausted:false};}
export function player(id,name){return{id,name,inventory:STARTER.map((k,i)=>tile(k,`${id}-${i}`)),fans:0,q:0,e:0,ready:false,board:[],offers:[],rewarded:false};}
export function newGame(){return{version:1,revision:0,phase:'lobby',players:[],show:0,round:0,q:0,e:0,history:[]};}
export function draw(inventory,rng){let a=shuffle(inventory.filter(t=>!t.exhausted),rng).slice(0,9);while(a.length<9)a.push(null);return shuffle(a,rng);}
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
export function targets(g){const n=g.players.length;return{q:SHOWS[g.show].q*n,e:SHOWS[g.show].e*n};}
function resetShow(g){g.round=0;g.q=0;g.e=0;for(const p of g.players){p.q=0;p.e=0;p.ready=false;p.board=[];p.rewarded=false;for(const t of p.inventory){t.charges=0;t.inactive=false;t.exhausted=false;}}}
function playRound(g,rng){g.round++;for(const p of g.players){const r=resolve(p.inventory,draw(p.inventory,rng),g.round,SHOWS[g.show].rounds);p.board=r.board;p.last=r.totals;p.q+=r.totals.q;p.e+=r.totals.e;p.fans+=r.totals.f;g.q+=r.totals.q;g.e+=r.totals.e;p.ready=false;}
 const target=targets(g);const won=g.q>=target.q&&g.e>=target.e;
 if(won||g.round===SHOWS[g.show].rounds){
  for(const p of g.players){const gain=Math.floor((p.q+p.e)/10);p.fans+=gain;p.showFans=gain;p.offers=shuffle(Object.keys(TILES),rng).slice(0,3);}
  g.history.push({show:g.show,q:g.q,e:g.e,won});g.phase=won?(g.show===SHOWS.length-1?'won':'reward'):'lost';
 }
}
// Commands are guarded by both player identity and revision. Invalid commands never mutate state.
export function command(input,id,msg,seed=1){
 const g=structuredClone(input),p=g.players.find(p=>p.id===id);
 if(!p)throw Error('Musicien introuvable.');
 const sameRoundReady=msg.type==='ready'&&g.phase==='show'&&msg.show===g.show&&msg.round===g.round&&!p.ready;
 if(msg.revision!==g.revision&&!sameRoundReady)throw Error('La partie a avancé. Réessaie.');
 const rng=random(seed);
 if(msg.type==='start'){
  if(g.phase!=='lobby'||g.players[0].id!==id)throw Error('Seul le créateur peut lancer la tournée.');
  g.phase='show';resetShow(g);
 }else if(msg.type==='ready'){
  if(g.phase!=='show'||p.ready)throw Error('Manche déjà validée.');
  p.ready=true;if(g.players.every(p=>p.ready))playRound(g,rng);
 }else if(msg.type==='reward'){
  if(g.phase!=='reward'||p.rewarded)throw Error('Récompense indisponible.');
  if(msg.action==='add'){
   if(!p.offers.includes(msg.kind))throw Error('Tuile non proposée.');
   p.inventory.push(tile(msg.kind,`${id}-reward-${g.show}`));
  }else if(msg.action==='upgrade'){
   const t=p.inventory.find(t=>t.id===msg.tileId);if(!t||t.level>=3)throw Error('Amélioration impossible.');t.level++;
  }else if(msg.action==='remove'){
   if(!p.inventory.some(t=>t.id===msg.tileId))throw Error('Tuile introuvable.');p.inventory=p.inventory.filter(t=>t.id!==msg.tileId);
  }else throw Error('Choix inconnu.');
  p.rewarded=true;if(g.players.every(p=>p.rewarded)){g.show++;g.phase='show';resetShow(g);}
 }else throw Error('Action inconnue.');
 g.revision++;return g;
}
