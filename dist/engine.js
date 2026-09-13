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
 feedback:{name:'Larsen délicieux',icon:'bolt',build:'Ça tient avec du tape',text:'+3 énergie par case vide ou tuile désactivée adjacente.'},
 perc_kick:{"name":"Grosse caisse","icon":"kick","family":"percussion","build":"Fondations","text":"Produit 1 énergie par tuile active de sa rangée, elle-même comprise.","summary":"RANGÉE : +1 É / ACTIVE","scope":"row","upgradeStat":"e","charge":false},
 perc_snare:{"name":"Caisse claire","icon":"snare","family":"percussion","build":"Fondations","text":"Produit 1 qualité par tuile active de sa colonne, elle-même comprise.","summary":"COLONNE : +1 Q / ACTIVE","scope":"column","upgradeStat":"q","charge":false},
 perc_hihat:{"name":"Charleston","icon":"hihat","family":"utility","build":"Fondations","text":"Les autres Percussions actives de sa rangée ou de sa colonne gagnent +1 qualité et +1 énergie avant les multiplicateurs.","summary":"ALIGNÉES : +1 Q / +1 É","scope":"cross","upgradeStat":"e","charge":false},
 perc_floor_tom:{"name":"Tom de plancher","icon":"floor_tom","family":"percussion","build":"Fondations","text":"Produit 2 qualité, puis +1 qualité par autre Percussion active de sa rangée.","summary":"2 Q + PERC. EN RANGÉE","scope":"row","upgradeStat":"q","charge":false},
 perc_ride:{"name":"Ride de traverse","icon":"ride","family":"percussion","build":"Fondations","text":"Produit 2 énergie, puis +1 énergie par autre Percussion active de sa colonne.","summary":"2 É + PERC. EN COLONNE","scope":"column","upgradeStat":"e","charge":false},
 perc_crash:{"name":"Crash final","icon":"crash","family":"percussion","build":"Fondations","text":"Produit 2 qualité et 2 énergie. Si toutes les cases de sa rangée OU de sa colonne sont actives, gagne +2 qualité et +2 énergie, une seule fois.","summary":"2 Q / 2 É · BONUS AXE PLEIN","scope":"cross","upgradeStat":"q","charge":false},
 perc_roll:{"name":"Roulement tenace","icon":"roll","family":"percussion","build":"Montée","text":"Gagne 1 charge à chaque apparition active. Produit autant d’énergie que son nombre de charges après tous les gains. Ne dépense pas ses charges.","summary":"+1 CHARGE · É = CHARGES","scope":"self","upgradeStat":"e","charge":true},
 perc_measure:{"name":"Mesure explosive","icon":"measure","family":"percussion","build":"Montée","text":"Gagne 1 charge à chaque apparition active. Après les gains, si elle possède au moins 3 charges, en dépense 3 et produit 12 qualité. Sinon, produit 0 qualité de base. Une seule dépense par apparition.","summary":"+1 CHARGE · 3 → 12 Q","scope":"self","upgradeStat":"q","charge":true},
 perc_metronome:{"name":"Métronome trafiqué","icon":"metronome","family":"utility","build":"Montée","text":"Donne +1 charge aux autres tuiles actives à charge de sa rangée ou de sa colonne, avant leur production et leurs dépenses. Toutes familles admissibles.","summary":"ALIGNÉES : +1 CHARGE","scope":"cross","upgradeStat":"e","charge":false},
 perc_double_pedal:{"name":"Double pédale","icon":"double_pedal","family":"utility","build":"Montée","text":"Double l’énergie produite par les autres Percussions actives de sa rangée, après les bonus additifs.","summary":"RANGÉE : PERC. É ×2","scope":"row","upgradeStat":"e","charge":false},
 perc_rimshot:{"name":"Rimshot précis","icon":"rimshot","family":"utility","build":"Montée","text":"Double la qualité produite par les autres Percussions actives de sa colonne, après les bonus additifs.","summary":"COLONNE : PERC. Q ×2","scope":"column","upgradeStat":"q","charge":false},
 perc_fill:{"name":"Fill de panique","icon":"fill","family":"utility","build":"Montée","text":"Fait rejouer une fois la production finale des autres Percussions actives de sa rangée ou de sa colonne. S’épuise après la chanson.","summary":"ALIGNÉES : PERC. REJOUE ×1","scope":"cross","upgradeStat":"e","charge":false},
 perc_riff_bridge:{"name":"Riff en cadence","icon":"riff_bridge","family":"percussion","build":"Maillage","text":"Produit 1 qualité, puis +2 qualité par Guitare active de sa rangée ou de sa colonne.","summary":"1 Q +2 / GUITARE ALIGNÉE","scope":"cross","upgradeStat":"q","charge":false},
 perc_voice_bridge:{"name":"Chant scandé","icon":"voice_bridge","family":"percussion","build":"Maillage","text":"Produit 1 énergie, puis +2 énergie par Voix active de sa rangée ou de sa colonne.","summary":"1 É +2 / VOIX ALIGNÉE","scope":"cross","upgradeStat":"e","charge":false},
 perc_brushes:{"name":"Balais de garage","icon":"brushes","family":"percussion","build":"Maillage","text":"Produit 1 qualité, puis +2 qualité par case vide ou désactivée de sa rangée.","summary":"RANGÉE : 1 Q +2 / ESPACE","scope":"row","upgradeStat":"q","charge":false},
 perc_silence:{"name":"Silence qui cogne","icon":"silence","family":"percussion","build":"Maillage","text":"Produit 1 énergie, puis +2 énergie par case vide ou désactivée de sa colonne.","summary":"COLONNE : 1 É +2 / ESPACE","scope":"column","upgradeStat":"e","charge":false},
 perc_patch:{"name":"Patch de répétition","icon":"patch","family":"utility","build":"Maillage","text":"Les autres tuiles actives de sa rangée gagnent +1 qualité. Celles de sa colonne gagnent +1 énergie. Toutes familles admissibles; bonus avant multiplicateurs.","summary":"RANGÉE +1 Q · COLONNE +1 É","scope":"cross","upgradeStat":"e","charge":false},
 perc_backstage:{"name":"Bracelet des loges","icon":"backstage","family":"utility","build":"Maillage","text":"Produit 1 fan par famille différente parmi les autres tuiles actives de sa rangée ou de sa colonne.","summary":"+1 FAN / FAMILLE ALIGNÉE","scope":"cross","upgradeStat":"f","charge":false}
};
export const SHOWS=[{name:'Le sous-sol',crowd:'Les colocs & deux inconnus',q:34,e:32,rounds:5},{name:'Le petit pub',crowd:'Les habitués veulent du bruit',q:70,e:64,rounds:5},{name:'Le toit pirate',crowd:'Tout le quartier est au courant',q:122,e:110,rounds:5}];
export function showInfo(index=0){
 const stage=Math.max(0,Math.floor(index)),venue=SHOWS[stage%SHOWS.length],tour=Math.floor(stage/SHOWS.length)+1;
 return {...venue,name:venue.name+(tour>1?' · Tour '+tour:''),level:stage+1,tour,
  q:34+28*stage+8*stage*stage,e:32+25*stage+7*stage*stage};
}
// Pack eligibility is separate from scoring families. Neutral is intentionally empty.
export const TILE_PACKS={guitarist:Object.keys(TILES).filter(k=>!k.startsWith('perc_')),drummer:Object.keys(TILES).filter(k=>k.startsWith('perc_')),neutral:[]};
export const ROLES={
 'drummer-percussionist':{name:'Batteur-percussionniste',promise:'Fais circuler le rythme dans tes rangées et tes colonnes. Même les trous travaillent pour toi.',startingCount:5,starter:['perc_kick','perc_kick','perc_snare','perc_snare','perc_hihat'],focus:1,pack:'drummer',pool:[...TILE_PACKS.drummer,...TILE_PACKS.neutral]},
 'guitarist-singer':{promise:'Relie les Guitares et les Voix pour amplifier ton son.',name:'Guitariste-chanteur',startingCount:5,starter:['guitar','guitar','voice','voice','pick'],focus:1,pack:'guitarist',pool:[...TILE_PACKS.guitarist,...TILE_PACKS.neutral]}
};
export const STARTER=ROLES['guitarist-singer'].starter;
export const STUDIO_CATEGORIES=['add','upgrade','remove'];
export const studioComplete=p=>STUDIO_CATEGORIES.every(k=>!!p.studio?.[k]);
export function studioChoices(p,category){return category==='add'?(p.offers||[]).map(kind=>({kind,level:0})):category==='upgrade'?p.inventory.filter(t=>Number.isSafeInteger(t.level+1)):category==='remove'?p.inventory:[];}
function normalizeStudio(g,p){
 const visit=g.show+':'+g.attempt;
 if(!p.studio||p.studio.visit!==visit)p.studio={visit,departed:false,...Object.fromEntries(STUDIO_CATEGORIES.map(k=>[k,p.rewarded?{status:'legacy'}:null]))};
 p.rewarded=studioComplete(p);
}
export const focusCapacity=p=>(p.focusBase??1)+(p.focusTemporary??0);
function advanceFocus(p,show){const credited=p.focusShow??0;p.focusBase=(p.focusBase??1)+Math.max(0,show-credited);p.focusShow=Math.max(credited,show);}
export function normalizeGame(input){
 const g=structuredClone(input);g.version=2;g.attempt??=0;
 // Preserve the current show's goal for saves created before the rebalance.
 if(!g.stageTarget&&g.round>0&&!g.balanceVersion){const legacy=[[24,25],[34,36],[44,46]][g.show];if(legacy)g.stageTarget={q:legacy[0]*g.players.length,e:legacy[1]*g.players.length};}
 g.balanceVersion=3;
 // Legacy victories may continue into the endless tour; defeats stay terminal.
 if(g.phase==='won')g.phase='reward';
 if(g.phase==='reward'&&g.retry)g.phase='lost';
 if(g.phase==='lost')g.retry=false;

 for(const p of g.players){p.role=Object.hasOwn(ROLES,p.classId||p.role)?(p.classId||p.role):'guitarist-singer';p.classId??=p.classConfirmed===false?null:p.role;p.classConfirmed??=true;p.lobbyReady??=true;p.focusBase??=ROLES[p.role]?.focus??1;advanceFocus(p,g.show);p.focusTemporary??=0;p.focusedIds??=[];p.songOffers??=[];p.drafted??=false;if(g.phase==='reward'&&!p.offers?.length)p.offers=ROLES[p.role].pool.slice(0,3);if(g.phase==='reward')normalizeStudio(g,p);pruneFocus(p);if(p.songOffers.length){const pool=ROLES[p.role].pool;p.songOffers=[...new Set([...p.songOffers,...pool])].filter(k=>pool.includes(k)).slice(0,3);}}
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
 return{id,name,role,classId:role,classConfirmed:true,lobbyReady:true,inventory:config.starter.slice(0,config.startingCount).map((k,i)=>tile(k,`${id}-${i}`)),fans:0,q:0,e:0,focusBase:config.focus,focusShow:0,focusTemporary:0,focusedIds:[],ready:false,board:[],offers:[],rewarded:false,songOffers:[],drafted:false};
}
// New lobbies have no starter until the authoritative start command.
export function lobbyPlayer(id,name){return {...player(id,name),classId:null,classConfirmed:false,lobbyReady:false,starterPending:true,inventory:[]};}
export const upgradeStat=d=>d.upgradeStat||(d.family==='guitar'?'q':d===TILES.duck?'f':'e');
export function axis(index,scope){return Array.from({length:9},(_,i)=>i).filter(i=>scope==='row'?Math.floor(i/3)===Math.floor(index/3):scope==='column'?i%3===index%3:Math.floor(i/3)===Math.floor(index/3)||i%3===index%3);}
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
 const active=t=>t.kind!=='empty'&&!t.inactive&&!t.exhausted;
 const space=t=>t.kind==='empty'||!!t.inactive;
 const onAxis=(t,scope=TILES[t.kind].scope)=>axis(t.index,scope).map(i=>board[i]);
 const others=(t,scope)=>onAxis(t,scope).filter(n=>n.index!==t.index&&active(n));
 const percussion=t=>TILES[t.kind]?.family==='percussion';
 const link=(t,ns)=>{t.links.push(...ns.filter(n=>n.index!==t.index).map(n=>n.index));return ns.length;};
 const near=i=>adjacent(i).map(j=>board[j]);
 // Movement and transformations are reserved phases, unused by the first 18 types.
 // Charges first. Cups grant all their charges before threshold powers run.
 for(const t of board.filter(active))if(TILES[t.kind].charge)t.charges++;
 for(const t of board.filter(t=>active(t)&&['cup','perc_metronome'].includes(t.kind)))for(const n of (t.kind==='cup'?near(t.index):others(t)).filter(n=>active(n)&&TILES[n.kind].charge)){n.charges+=t.kind==='cup'?2:1;t.links.push(n.index);}
 for(const t of board.filter(active)){
  const d=TILES[t.kind], ns=near(t.index), live=ns.filter(active);t.q=d.q||0;t.e=d.e||0;
  if(['refrain','perc_roll'].includes(t.kind))t.e=t.charges;
  if(['note','perc_measure'].includes(t.kind)&&t.charges>=3){t.charges-=3;t.q=12;t.notes.push('3 charges dépensées');}
  if(t.kind==='last'&&round===rounds)t.e=6;
  if(t.kind==='solo'&&board.filter(n=>active(n)&&n.kind==='solo').length===1)t.q=6;
  if(t.kind==='lighter')t.e+=board.filter(n=>active(n)&&n.kind==='lighter').length-1;
  if(t.kind==='boot')t.e=live.filter(n=>['guitar','voice'].includes(TILES[n.kind].family)).length;
  if(t.kind==='choir')t.e=board.filter(n=>active(n)&&TILES[n.kind].family==='voice').length;
  if(t.kind==='duck')t.f=new Set(live.map(n=>n.kind)).size;
  if(t.kind==='smoke')t.e=2*ns.filter(n=>n.kind==='empty'||n.inactive).length;
  if(t.kind==='feedback')t.e=3*ns.filter(space).length;
  if(t.kind==='perc_kick')t.e=link(t,onAxis(t).filter(active));
  if(t.kind==='perc_snare')t.q=link(t,onAxis(t).filter(active));
  if(t.kind==='perc_floor_tom')t.q=2+link(t,others(t).filter(percussion));
  if(t.kind==='perc_ride')t.e=2+link(t,others(t).filter(percussion));
  if(t.kind==='perc_crash'){const full=['row','column'].filter(a=>onAxis(t,a).every(active));t.q=t.e=full.length?4:2;for(const a of full)link(t,others(t,a));}
  if(t.kind==='perc_riff_bridge')t.q=1+2*link(t,others(t).filter(n=>TILES[n.kind].family==='guitar'));
  if(t.kind==='perc_voice_bridge')t.e=1+2*link(t,others(t).filter(n=>TILES[n.kind].family==='voice'));
  if(t.kind==='perc_brushes')t.q=1+2*link(t,onAxis(t).filter(space));
  if(t.kind==='perc_silence')t.e=1+2*link(t,onAxis(t).filter(space));
  if(t.kind==='perc_backstage'){const ns=others(t);t.f=new Set(ns.map(n=>TILES[n.kind].family||'utility')).size;link(t,ns);}
  // Upgrade boosts production, not the scope/power of utility tiles.
  t[upgradeStat(d)]+=t.level||0;
 }
 // Additive bonuses before multipliers, independent of board traversal.
 for(const t of board.filter(t=>active(t)&&t.kind==='pick'))for(const n of near(t.index).filter(n=>active(n)&&TILES[n.kind].family==='guitar')){n.q++;t.links.push(n.index);}
 for(const t of board.filter(active)){
  if(t.kind==='perc_hihat')for(const n of others(t).filter(percussion)){n.q++;n.e++;link(t,[n]);}
  if(t.kind==='perc_patch')for(const a of ['row','column'])for(const n of others(t,a)){n[a==='row'?'q':'e']++;link(t,[n]);}
 }
 for(const t of board.filter(active)){
  const f=TILES[t.kind].family;
  for(const n of near(t.index).filter(active)){
   const nf=TILES[n.kind].family;
   if((f==='guitar'&&nf==='voice')||(f==='voice'&&nf==='guitar')||(f==='guitar'&&n.kind==='pedal')){t.m*=2;t.links.push(n.index);}
   if(f==='guitar'&&n.kind==='encore'){t.repeats++;t.links.push(n.index);}
  }
  t.q*=t.m;t.e*=t.m;t.f*=t.m;
  if(f==='percussion'){
   const boosts=others(t,'cross');t.mq=2**boosts.filter(n=>n.kind==='perc_rimshot'&&n.index%3===t.index%3).length;t.me=2**boosts.filter(n=>n.kind==='perc_double_pedal'&&Math.floor(n.index/3)===Math.floor(t.index/3)).length;
   t.repeats+=boosts.filter(n=>n.kind==='perc_fill').length;t.q*=t.mq;t.e*=t.me;t.m=Math.max(t.mq,t.me);
   link(t,boosts.filter(n=>n.kind==='perc_fill'||n.kind==='perc_rimshot'&&n.index%3===t.index%3||n.kind==='perc_double_pedal'&&Math.floor(n.index/3)===Math.floor(t.index/3)));
  }
 }
 // Visual links include additive, charge and global contributors, without changing scores.
 for(const t of board.filter(active)){
  let contributors=[];const ns=near(t.index),live=ns.filter(active);
  if(t.kind==='boot')contributors=live.filter(n=>['guitar','voice'].includes(TILES[n.kind].family));
  if(t.kind==='duck')contributors=live;
  if(t.kind==='smoke')contributors=ns.filter(n=>n.kind==='empty'||n.inactive);
  if(t.kind==='feedback')contributors=ns.filter(space);
  if(t.kind==='choir')contributors=board.filter(n=>active(n)&&TILES[n.kind].family==='voice');
  if(t.kind==='lighter')contributors=board.filter(n=>active(n)&&n.kind==='lighter'&&n.index!==t.index);
  t.links=[...new Set([...t.links,...contributors.map(n=>n.index)])];
 }
 const totals=board.reduce((a,t)=>({q:a.q+t.q*(1+(t.repeats||0)),e:a.e+t.e*(1+(t.repeats||0)),f:a.f+t.f*(1+(t.repeats||0))}),{q:0,e:0,f:0});
 // Exhaust/inactivity apply after production and become relevant next draw.
 for(const t of board.filter(active)){
  const original=inventory.find(n=>n.id===t.id);if(!original)continue;
  original.charges=t.charges;
  if(['cup','pedal','encore','kamikaze','perc_fill'].includes(t.kind)){original.exhausted=true;t.after='Épuisée';}
  if(t.kind==='amp'){original.inactive=true;t.after='Désactivée';}
 }
 return{board,totals};
}
export function targets(g){const n=g.players.length,s=showInfo(g.show);return g.stageTarget?{...g.stageTarget}:{q:s.q*n,e:s.e*n};}
function resetShow(g){
 g.revealOrder=[];g.round=0;g.q=0;g.e=0;g.retry=false;const stage=showInfo(g.show);g.stageTarget={q:stage.q*g.players.length,e:stage.e*g.players.length};
 for(const p of g.players){advanceFocus(p,g.show);p.q=0;p.e=0;p.last=null;p.ready=false;p.board=[];p.rewarded=false;p.studio=null;p.songOffers=[];p.drafted=false;p.focusTemporary=0;pruneFocus(p);for(const t of p.inventory){t.charges=0;t.inactive=false;t.exhausted=false;}}
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
  for(const p of g.players){const gain=Math.floor((p.q+p.e)/10);p.fans+=gain;p.showFans=gain;p.career.bonusFans+=gain;const row=song.players.find(r=>r.id===p.id);row.bonusFans=gain;row.fans=p.fans;p.offers=songOffers(p,rng);p.focusTemporary=0;pruneFocus(p);p.songOffers=[];}
  g.history.push({show:g.show,attempt:g.attempt,q:g.q,e:g.e,won,target});g.retry=false;g.phase=won?'reward':'lost';if(won)for(const p of g.players)normalizeStudio(g,p);
 }else{
  g.phase='draft';for(const p of g.players){p.songOffers=songOffers(p,rng);p.drafted=false;}
 }
 g.revealOrder=shuffle(g.players.map(p=>p.id),rng);song.revealOrder=[...g.revealOrder];
 g.songs??=[];g.songs.push(song);if(g.songs.length>250)g.songs.splice(0,g.songs.length-250);
}
// Commands are guarded by both player identity and revision. Invalid commands never mutate state.
export function command(input,id,msg,seed=1){
 const g=normalizeGame(input),p=g.players.find(p=>p.id===id);
 if(!p)throw Error('Musicien introuvable.');
 const sameRoundReady=msg.type==='ready'&&g.phase==='show'&&msg.show===g.show&&msg.round===g.round&&!p.ready;
 const independentChoice=msg.show===g.show&&msg.round===g.round&&((msg.type==='draft'&&g.phase==='draft'&&!p.drafted)||(msg.type==='reward'&&g.phase==='reward'&&!p.studio?.[msg.category||msg.action])||(msg.type==='studio-depart'&&g.phase==='reward'&&!p.studio?.departed));
 const independentLobby=g.phase==='lobby'&&((msg.type==='select-class'&&Object.hasOwn(msg,'previousClassId')&&msg.previousClassId===p.classId)||(msg.type==='lobby-ready'&&msg.classId===p.classId&&p.classConfirmed));
 if(msg.revision!==g.revision&&!sameRoundReady&&!independentChoice&&!independentLobby)throw Error('La partie a avancé. Réessaie.');
 const rng=random(seed);
 if(msg.type==='select-class'){
  if(g.phase!=='lobby'||!Object.hasOwn(ROLES,msg.classId)||!p.starterPending&&p.classConfirmed&&msg.classId!==p.classId)throw Error('Choix de classe indisponible.');
  if(p.classId!==msg.classId||!p.classConfirmed){p.role=p.classId=msg.classId;p.classConfirmed=true;p.lobbyReady=false;if(p.starterPending)p.inventory=[];}
 }else if(msg.type==='lobby-ready'){
  if(g.phase!=='lobby'||!p.classConfirmed||!p.classId)throw Error('Choisis ta classe avant de te déclarer prêt.');
  p.lobbyReady=true;
 }else if(msg.type==='start'){
  if(g.phase!=='lobby'||g.players[0].id!==id)throw Error('Seul le créateur peut lancer la tournée.');
  if(!g.players.every(p=>p.classConfirmed&&p.lobbyReady))throw Error('Chaque musicien doit choisir sa classe et être prêt.');
  for(const p of g.players)if(p.starterPending){p.inventory=ROLES[p.role].starter.map((k,i)=>tile(k,`${p.id}-${i}`));p.focusBase=ROLES[p.role].focus;p.starterPending=false;}
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
  const category=msg.category||msg.action;
  if(g.phase!=='reward'||!STUDIO_CATEGORIES.includes(category)||p.studio?.[category]||p.studio?.departed)throw Error('Catégorie du Studio déjà complétée ou indisponible.');
  if(msg.action!==category&&msg.action!=='skip')throw Error('Action de catégorie invalide.');
  if(msg.action==='add'){
   if(!p.offers.includes(msg.kind)||!ROLES[p.role].pool.includes(msg.kind))throw Error('Tuile non proposée.');
   p.inventory.push(tile(msg.kind,`${id}-reward-${g.show}-${g.attempt}`));
  }else if(msg.action==='upgrade'){
   const t=studioChoices(p,'upgrade').find(t=>t.id===msg.tileId);if(!t)throw Error('Amélioration impossible.');t.level++;
  }else if(msg.action==='remove'){
   if(!studioChoices(p,'remove').some(t=>t.id===msg.tileId))throw Error('Tuile introuvable.');p.inventory=p.inventory.filter(t=>t.id!==msg.tileId);pruneFocus(p);
  }
  p.studio[category]={status:msg.action==='skip'?'skipped':'applied',...(msg.kind?{kind:msg.kind}:{}),...(msg.tileId?{tileId:msg.tileId}:{})};p.rewarded=studioComplete(p);
 }else if(msg.type==='studio-depart'){
  if(g.phase!=='reward'||!studioComplete(p)||p.studio.departed)throw Error('Complète les trois catégories avant de partir.');
  p.studio.departed=true;
  if(g.players.every(p=>studioComplete(p)&&p.studio.departed)){g.show++;g.attempt++;g.phase='show';resetShow(g);}
 }else throw Error('Action inconnue.');
 g.revision++;return g;
}
