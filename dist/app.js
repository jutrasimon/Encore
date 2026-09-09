import {TILES,SHOWS,newGame,player,command,targets,adjacent,normalizeGame,focusCapacity,ROLES} from './engine.js';
import {sticker} from './art.js';
import {inventoryMarkup} from './inventory-ui.js';
import {resolutionEvents,overdriveLevel} from './presentation.js';
import {icon} from './icons.js';
import {SERVER_URL} from './config.js';
import {api, BandConnection, credential} from './network.js';
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(k,d=null)=>{try{return JSON.parse(localStorage.getItem(k))??d;}catch{return d;}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
let game=null,myId=null,mode=null,view='game',selected=null,rewardAction='add',connection=null,online=[],connected=false,busy=false,networkReady=false,animating=false,frames=[],generation=0;
let name=read('encore.name',''),sound=read('encore.sound',false),session=read('encore.session'),audioCtx;
let invite=new URL(location.href).searchParams.get('band')?.toUpperCase()||'';
const endpoint=(SERVER_URL||location.origin).replace(/\/$/,'');
const rnd=()=>crypto.getRandomValues(new Uint32Array(1))[0];
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function beep(i=0){if(!sound)return;try{audioCtx??=new AudioContext();audioCtx.resume();const o=audioCtx.createOscillator(),v=audioCtx.createGain();o.type='square';o.frequency.value=[196,247,294,392,494,587,784,988,1175][i%9];v.gain.setValueAtTime(.022,audioCtx.currentTime);v.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.13);o.connect(v).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.14);}catch{}}
function me(){return game?.players.find(p=>p.id===myId);}
const VERSION='0.4.2 · OVERDRIVE';
let intro=true,resultDismissed=false,step=-1,displayScore=null,resolvingName='';
let inventoryScroll=0,draftSeen='',activeEvent=null,animationPlayer=null,scoredIds=new Set(),freshDeal=false;
let motion=read('encore.motion',true);
const type=t=>TILES[t?.kind]?.family==='guitar'?'quality':TILES[t?.kind]?.family==='voice'?'energy':t?.kind==='duck'?'fans':'utility';
const points=(t)=>[['q','star','Qualité'],['e','bolt','Énergie'],['f','choir','Fans']].filter(([k])=>t?.[k]).map(([k,i,label])=>`<span aria-label="${label}">${icon(i)}${t[k]*(1+(t.repeats||0))}</span>`).join('');
function header(){return `<header class="masthead"><a href="${esc(location.pathname)}" class="wordmark">ENCORE<span>!</span></a><span class="version">${VERSION}</span>${!game?'<button class="sound" data-action="settings" aria-label="Réglages">'+icon('settings')+'</button>':''}</header>`;}
function screen(){const show=SHOWS[game?.show||0];return `<div class="lcd"><img src="./stage.png" alt="Concert punk sur écran vert"></div><h2>${esc(show.name)}</h2><p>${esc(show.crowd)}</p>`;}
function nav(){return `<nav class="navigation" aria-label="Navigation">${[['game','amp','Show'],['inventory','bag','Inventaire'],['settings','settings','Réglages']].map(([v,i,l])=>`<button data-action="nav" data-view="${v}" class="${view===v?'active':''}">${icon(i)}<span>${l}${v==='inventory'?' · '+me().inventory.length:''}</span></button>`).join('')}</nav>`;}
function shell(content){document.body.classList.toggle('reduced-motion',!motion);return `${header()}<section class="console ${game?'in-game':'at-home'}">${content}${game?nav():''}</section><dialog id="details"></dialog>`;}
function home(){return `<section class="home"><h1>ENCORE!</h1><label class="field">PSEUDO<input id="name" maxlength="20" value="${esc(name)}" placeholder="Simon" autocomplete="nickname"></label><button class="primary" data-action="solo">${icon('bolt')} JOUER EN SOLO</button>${read('encore.solo')?'<button class="secondary" data-action="resume">REPRENDRE EN SOLO</button>':''}<div class="multi-start"><button class="secondary" data-action="create" ${!networkReady||busy?'disabled':''}>CRÉER UN BAND</button><button class="secondary" data-action="join" ${!networkReady||busy?'disabled':''}>REJOINDRE</button></div><label class="field">CODE D’INVITATION<input id="code" maxlength="12" value="${esc(invite)}" placeholder="12 caractères" autocomplete="off"></label>${!networkReady?'<p class="network-note">Connexion multijoueur en cours…</p>':''}${session&&networkReady?'<button class="secondary" data-action="reconnect">REPRENDRE MON BAND</button>':''}</section>`;}
function settingsView(){return `<section class="settings-screen"><h1>Réglages</h1><button class="secondary" data-action="sound" aria-pressed="${sound}">${icon('sound')} SON : ${sound?'ACTIVÉ':'COUPÉ'}</button><button class="secondary" data-action="motion" aria-pressed="${motion}">ANIMATIONS : ${motion?'COMPLÈTES':'RÉDUITES'}</button><button class="secondary" data-action="rules">COMMENT JOUER</button>${mode==='multi'?'<button class="secondary" data-action="invite">COPIER L’INVITATION</button>':''}<button class="secondary" data-action="${game?'quit':'back'}">${game?'QUITTER LA PARTIE':'RETOUR'}</button><p class="version">${VERSION}</p></section>`;}
function meters(){const t=targets(game),score=displayScore||game;return `<div class="meters" data-overdrive="${overdriveLevel(score,t)}">${[['q','QUALITÉ','star'],['e','ÉNERGIE','bolt']].map(([key,label,ic])=>`<div class="meter ${score[key]>t[key]?'overdrive':''}" data-stat="${key}">${icon(ic)}<div><div class="meter-label">${label}<b><em class="stat-value">${score[key]}</em><span> / ${t[key]}</span></b></div><div class="meter-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${t[key]}" aria-valuenow="${Math.min(score[key],t[key])}"><i style="width:${Math.min(100,score[key]/t[key]*100)}%"></i></div><small class="overdrive-label">${score[key]>t[key]?'OVERDRIVE +'+(score[key]-t[key]):score[key]===t[key]?'OBJECTIF ATTEINT':'OBJECTIF DU SHOW'}</small></div></div>`).join('')}</div><div class="drive-status ${overdriveLevel(score,t)===2?'double-drive':''}" role="status">${overdriveLevel(score,t)===2?'DOUBLE OVERDRIVE':overdriveLevel(score,t)===1?'OVERDRIVE':''}</div>`;}
function tileButton(t,index,extra=''){const empty=!t||t.kind==='empty',d=empty?{name:'Case vide',icon:'empty'}:TILES[t.kind];const lit=!empty&&!t.inactive&&t.m>1;return `<button class="tile ${empty?'empty':''} ${t?.inactive?'inactive':''} ${lit?'lit':''} ${extra} type-${type(t)} ${freshDeal?'deal-in':''} ${animating?'unscored':''} ${(animationPlayer||me())?.focusedIds?.includes(t?.id)?'focused':''}" data-action="tile" data-index="${index}" aria-label="${esc(d.name)}${lit?`, multiplicateur ${t.m}`:''}" style="--i:${index}">${t?.level?`<span class="level">+${t.level}</span>`:''}${empty?icon(d.icon):sticker(t.kind)}${(animationPlayer||me())?.focusedIds?.includes(t?.id)?'<span class="focus-badge" aria-label="Focus actif">'+icon('focus')+'</span>':''}<span class="tile-name">${esc(d.name)}</span>${t?.charges?`<span class="charge">${t.charges} CH.</span>`:''}${lit?`<span class="mult">×${t.m}</span>`:''}${t?.inactive?'<span class="dead">HORS SERVICE</span>':''}${t?.after?'<span class="after">'+esc(t.after)+'</span>':''}${t?.q||t?.e||t?.f?`<span class="tile-points">${points(t)}</span>`:''}${t?.m?`<span class="score-tooltip" role="tooltip"><strong>${esc(d.name)}</strong><span>${points(t)||'Aucun point direct'}</span><small>×${t.m}${t.repeats?' · rejoué '+t.repeats+' fois':''}</small>${esc(d.text)}</span>`:''}</button>`;}
function grid(){const p=animationPlayer||me(),b=p?.board.length?p.board:Array(9).fill(null);const links=[];b.forEach((t,i)=>t?.links?.forEach(j=>{if(j!==i){const x=i%3*100+50,y=Math.floor(i/3)*100+50;links.push(`<line data-from="${i}" data-to="${j}" x1="${x}" y1="${y}" x2="${j%3*100+50}" y2="${Math.floor(j/3)*100+50}"/>`);}}));return `<div class="grid-wrap"><div class="grid ${animating&&motion?'playing':''}">${b.map((t,i)=>tileButton(t,i)).join('')}</div><svg class="connections" viewBox="0 0 300 300" aria-hidden="true">${links.join('')}</svg></div>`;}
function players(){return `<div class="bandmates">${game.players.map(p=>`<div class="bandmate"><div class="portrait">${icon('user')}</div><div><strong>${esc(p.name)}</strong><span>${icon('choir')} ${animating?'…':p.fans} <small>fans</small> ${p.ready?' · Prêt':''}</span></div></div>`).join('')}</div>`;}
function gameView(){const p=me();if(!p)return '<p>Connexion…</p>';return `<div class="show-top"><button class="show-name" data-action="show-details" aria-label="Détails du show ${esc(SHOWS[game.show].name)}"><small>SHOW ${game.show+1}/${SHOWS.length} ${icon('info')}</small><strong>${esc(SHOWS[game.show].name)}</strong></button><div class="round">CHANSON <b>${game.round}</b><span>/ ${SHOWS[game.show].rounds}</span></div></div>${meters()}${grid()}<div class="readout" aria-live="polite">${animating?'Pige des tuiles…':p.last?`<span>DERNIÈRE CHANSON</span> ${points(p.last)}`:'Prêt pour la première chanson'}</div>${players()}<div class="action-slot">${animating?'<button class="primary" disabled>CHANSON EN COURS…</button>':game.phase==='show'||game.phase==='draft'?phaseAction():game.phase==='lobby'?'<button class="primary" data-action="show-details">PRÉPARER LE SHOW</button>':'<button class="primary" data-action="result">RÉSULTAT DU SHOW</button>'}</div>`;}
function showIntro(){if(animating)return;const dlg=$('#details');dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button>${screen()}<div class="intro-objectives">${icon('star')} ${targets(game).q} ${icon('bolt')} ${targets(game).e}</div><p>Atteins les deux objectifs en ${SHOWS[game.show].rounds} chansons. Le show continue même en overdrive.</p>${game.phase==='lobby'?phaseAction():'<button class="primary" data-action="close">JOUER</button>'}`;dlg.showModal();}
function showResult(){if(animating)return;const dlg=$('#details');dlg.innerHTML=`<button class="dialog-close" data-action="dismiss-result" aria-label="Fermer">${icon('close')}</button>${phaseAction()}`;dlg.showModal();}
function phaseAction(){const p=me();if(game.phase==='lobby')return `<div class="lobby"><h2>${game.players.length===2?'Le band est là.':'La balance est prête.'}</h2><p>${mode==='multi'?'Partage le lien avant de lancer la tournée.':'Trois salles. Un inventaire. À toi de jouer.'}</p>${mode==='multi'?'<button class="secondary" data-action="invite">COPIER LE LIEN D’INVITATION</button>':''}${game.players[0].id===myId?`<button class="primary" data-action="start" ${busy||mode==='multi'&&!connected?'disabled':''}>LANCER LA TOURNÉE ${icon('arrow')}</button>`:'<p>Le créateur lance la tournée.</p>'}</div>`;
 if(game.phase==='draft')return `<button class="primary" data-action="draft" ${p.drafted||busy?'disabled':''}>${p.drafted?'LE BAND CHOISIT…':'CHOISIR UNE TUILE'} ${icon('arrow')}</button>`;
 if(game.phase==='show')return `<button class="primary play" data-action="ready" ${busy||animating||p.ready||mode==='multi'&&!connected?'disabled':''}>${icon('bolt')}${p.ready?'EN ATTENTE DU BAND…':game.round?'JOUER LA CHANSON SUIVANTE':'JOUER LA PREMIÈRE CHANSON'}${icon('arrow')}</button>`;
 if(game.phase==='reward')return `<div class="result"><span class="tape">SHOW RÉUSSI</span><h2>La salle en redemande.</h2><p>+${p.showFans} fans de performance, en plus des fans gagnés par tes tuiles.</p><button class="primary" data-action="rewards" ${animating||p.rewarded?'disabled':''}>${p.rewarded?'TON BAND CHOISIT ENCORE…':'PASSER EN COULISSES'} ${icon('arrow')}</button></div>`;
 return `<div class="result"><span class="tape">${game.phase==='won'?'TOURNÉE BOUCLÉE!':'SHOW TERMINÉ'}</span><h2>${game.phase==='won'?p.fans+' fans':'Le show s’arrête ici.'}</h2><p>${game.phase==='won'?'Les trois shows sont réussis.':'Il fallait atteindre les deux objectifs. '}</p><div class="tour-results">${game.history.map(h=>`<span>${h.won?'✓':'×'} ${SHOWS[h.show].name} · ${points(h)}</span>`).join('')}</div><button class="primary" data-action="again">NOUVELLE TOURNÉE ${icon('repeat')}</button></div>`;}
function focusButton(t){const p=me(),focused=p.focusedIds.includes(t.id),locked=animating||busy||p.ready||!['lobby','show','draft','reward'].includes(game.phase);return `<button class="focus-toggle ${focused?'active':''}" data-action="focus" data-id="${esc(t.id)}" aria-pressed="${focused}" ${locked?'disabled':''}>${focused?'FOCUS ACTIF':'FOCUS +'}</button>`;}
function inventoryView(){return inventoryMarkup(me(),{
 locked:animating||busy||me().ready||!['lobby','show','draft','reward'].includes(game.phase),
 draft:game.phase==='draft'&&!me().drafted
});}
function draftDialog(){if(animating||game.phase!=='draft'||me().drafted)return;draftSeen=game.show+':'+game.round;const dlg=$('#details');dlg.classList.add('draft-dialog');dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><small>CHANSON ${game.round}/${SHOWS[game.show].rounds} TERMINÉE</small><h2>Une nouvelle tuile</h2><div class="draft-cards">${me().songOffers.map(kind=>`<button class="draft-card type-${type({kind})}" data-action="choose-song" data-kind="${kind}" ${busy?'disabled':''}>${sticker(kind)}<strong>${esc(TILES[kind].name)}</strong><p>${esc(TILES[kind].text)}</p><span>CHOISIR +</span></button>`).join('')}</div><button class="secondary" data-action="inventory">INVENTAIRE ET FOCUS</button>`;dlg.showModal();}
function rewardsView(){const p=me();return `<section class="reward-screen"><button class="back" data-action="back">← REVOIR LE SHOW</button><span class="tape">LES COULISSES / SHOW ${game.show+1}</span><h1>Coulisses</h1><p>Choisis une seule action. Chaque membre choisit pour son inventaire.</p><div class="reward-tabs">${[['add','AJOUTER'],['upgrade','AMÉLIORER'],['remove','RETIRER']].map(([k,label])=>`<button class="${rewardAction===k?'active':''}" data-action="reward-tab" data-kind="${k}">${label}</button>`).join('')}</div>${p.rewarded?'<p>Choix enregistré. En attente du band…</p>':rewardAction==='add'?`<div class="reward-cards">${p.offers.map(k=>`<button class="reward-card" data-action="choose-add" data-kind="${k}" ${busy?'disabled':''}><span class="item-icon">${sticker(k)}</span><small>${esc(TILES[k].build)}</small><strong>${esc(TILES[k].name)}</strong><p>${esc(TILES[k].text)}</p><span class="choose">CHOISIR +</span></button>`).join('')}</div>`:`<p>${rewardAction==='upgrade'?'+1 qualité pour une Guitare, +1 fan pour le Canard, +1 énergie pour les autres. Permanent pour la tournée, maximum +3.':'Retire définitivement une tuile de ton inventaire. Les autres ressortiront plus souvent.'}</p><div class="inventory-list">${p.inventory.map(t=>`<button class="inventory-item" data-action="choose-${rewardAction}" data-id="${esc(t.id)}" ${busy||rewardAction==='upgrade'&&t.level>=3?'disabled':''}><span class="item-icon">${sticker(t.kind)}</span><span><strong>${esc(TILES[t.kind].name)}</strong><small>Niveau +${t.level}</small></span><b>${rewardAction==='upgrade'?'+1':'−'}</b></button>`).join('')}</div>`}</section>`;}
function render(){
 if(animating&&view==='game'&&$('.grid')){paintResolution();return;}
 if(view==='rewards'&&game?.phase!=='reward')view='game';
 const collection=$('.collection');if(collection)inventoryScroll=collection.scrollTop;
 const focusedTile=document.activeElement?.dataset.action==='focus'?document.activeElement.dataset.id:null;
 app.innerHTML=shell(view==='settings'?settingsView():!game?home():view==='inventory'?inventoryView():view==='rewards'?rewardsView():gameView());
 if(view==='inventory'){const list=$('.collection');if(list)list.scrollTop=inventoryScroll;if(focusedTile){const target=[...document.querySelectorAll('.collection .focus-toggle')].find(b=>b.dataset.id===focusedTile);target?.focus({preventScroll:true});}}
 if(game&&view==='game'&&!animating){
  if(intro){intro=false;showIntro();}
  else if(game.phase==='draft'&&!me().drafted&&draftSeen!==game.show+':'+game.round)draftDialog();
  else if(['reward','won','lost'].includes(game.phase)&&!resultDismissed){resultDismissed=true;showResult();}
 }
}
function inspect(t){const empty=!t||t.kind==='empty',d=empty?{name:'Case vide',text:'Ajoutée à la pige si moins de 9 tuiles sont disponibles, puis mélangée aux autres cases. Elle ne rejoint pas l’inventaire.',icon:'empty',build:'Grille'}:TILES[t.kind];const dlg=$('#details');dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><div class="detail-icon type-${type(t)}">${empty?icon(d.icon):sticker(t.kind)}</div><small>${esc(d.build)}</small><h2>${esc(d.name)}</h2><p>${esc(d.text)}</p>${t?.inactive?'<p class="warning">Désactivée : aucun effet, aucune synergie normale. Occupe toujours une case.</p>':''}${t?.exhausted?'<p>Épuisée : ne sera plus pigée avant le prochain show.</p>':''}${t?.level?'<p>Amélioration permanente : +'+t.level+' à sa production de base.</p>':''}${t?.charges?'<p>'+t.charges+' charges. Réinitialisées au prochain show.</p>':''}${t?.m?`<div class="detail-score"><span>BASE ${points({q:t.q/t.m,e:t.e/t.m,f:t.f/t.m})}</span><b>×${t.m}${t.repeats?' · '+t.repeats+' redéclenchement(s)':''}</b><span>PRODUCTION ${points(t)}</span></div>`:''}${!empty&&me()?.inventory.some(x=>x.id===t.id)?focusButton(t):''}<button class="secondary" data-action="close">FERMER</button>`;dlg.showModal();}
function rules(){const dlg=$('#details');dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><h2>Comment jouer</h2><ol><li>Le guitariste-chanteur commence avec 5 tuiles et 1 focus.</li><li>Chaque chanson pige jusqu’à 9 tuiles distinctes. Les cases restantes sont vides.</li><li>Les synergies touchent les quatre côtés, sauf les effets qui concernent toute la grille. Une guitare entre deux voix vaut ×4; les voix valent ×2.</li><li>Entre les chansons, choisis 1 tuile parmi 3. Les doublons sont permis.</li><li>Dans l’inventaire, affecte ton focus à une copie pour doubler son poids de pige. Déplace-le librement avant de te déclarer prêt. Le focus temporaire expire à la fin du show.</li><li>Joue les 5 chansons et atteins les deux objectifs. Dépasse-les pour entrer en overdrive; le surplus contribue aux fans de performance.</li><li>Entre les shows, ajoute, améliore ou retire une tuile. En coop, les points s’additionnent; chacun choisit sa tuile et son focus.</li></ol><p>Épuisée : sortie du show. Désactivée : encore pigée, sans effet. Ces états et les charges se réinitialisent au prochain show.</p><button class="primary" data-action="close">FERMER</button>`;dlg.showModal();}
function overdriveHit(level){
 if(motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches){$('.console')?.classList.add('drive-impact');frames.push(setTimeout(()=>$('.console')?.classList.remove('drive-impact'),400));try{navigator.vibrate?.(level===2?[35,35,60]:30);}catch{}}
 if(sound){[0,2,4,6].forEach((n,i)=>frames.push(setTimeout(()=>beep(n),i*65)));}
}
function paintResolution(){
 if(!animating||!displayScore)return;
 const target=targets(game),level=overdriveLevel(displayScore,target),metersEl=$('.meters');
 if(metersEl)metersEl.dataset.overdrive=level;
 for(const key of ['q','e']){
  const el=$('[data-stat="'+key+'"]');if(!el)continue;
  el.querySelector('.stat-value').textContent=displayScore[key];
  el.querySelector('.meter-track i').style.width=Math.min(100,displayScore[key]/target[key]*100)+'%';
  el.querySelector('.meter-track').setAttribute('aria-valuenow',Math.min(displayScore[key],target[key]));
  el.classList.toggle('overdrive',displayScore[key]>target[key]);
  el.querySelector('.overdrive-label').textContent=displayScore[key]>target[key]?'OVERDRIVE +'+(displayScore[key]-target[key]):displayScore[key]===target[key]?'OBJECTIF ATTEINT':'OBJECTIF DU SHOW';
 }
 const status=$('.drive-status');if(status){status.textContent=level===2?'DOUBLE OVERDRIVE':level===1?'OVERDRIVE':'';status.classList.toggle('double-drive',level===2);}
 document.querySelectorAll('.grid .tile').forEach((el,i)=>{
  el.classList.toggle('scoring',!!activeEvent&&i===activeEvent.index);
  el.classList.toggle('synergy-active',!!activeEvent&&i!==activeEvent.index&&activeEvent.related.includes(i));
  el.classList.toggle('unscored',!scoredIds.has((animationPlayer?.id||myId)+':'+i));
 });
 document.querySelectorAll('.connections line').forEach(el=>el.classList.toggle('linked-active',!!activeEvent&&[Number(el.dataset.from),Number(el.dataset.to)].every(i=>activeEvent.related.includes(i))));
 if(activeEvent&&$('.readout'))$('.readout').innerHTML=`<span>${esc(activeEvent.name)} · ${esc(TILES[activeEvent.kind].name)}</span> ${points(activeEvent)||'<span>SYNERGIE</span>'}`;
}
function animate(previous){
 frames.forEach(clearTimeout);frames=[];animating=true;activeEvent=null;displayScore={q:previous.q,e:previous.e};scoredIds=new Set();view='game';animationPlayer=me();freshDeal=true;
 // Mount once for the new draw. Subsequent scoring only changes classes and counters.
 app.innerHTML=shell(gameView());freshDeal=false;
 const queue=resolutionEvents(game.players,myId),delay=motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches?580:85;
 frames.push(setTimeout(()=>document.querySelectorAll('.deal-in').forEach(el=>el.classList.remove('deal-in')),600));
 queue.forEach((event,n)=>frames.push(setTimeout(()=>{
  if(!animating)return;
  if(animationPlayer.id!==event.playerId){animationPlayer=game.players.find(p=>p.id===event.playerId);$('.grid-wrap')?.insertAdjacentHTML('afterend',grid());$('.grid-wrap')?.remove();}
  const oldLevel=overdriveLevel(displayScore,targets(game));activeEvent=event;
  displayScore.q+=event.q;displayScore.e+=event.e;scoredIds.add(event.playerId+':'+event.index);paintResolution();beep(event.index);
  const level=overdriveLevel(displayScore,targets(game));if(level>oldLevel)overdriveHit(level);
 },650+n*delay)));
 frames.push(setTimeout(()=>{animating=false;activeEvent=null;animationPlayer=null;displayScore=null;render();},1000+queue.length*delay));
}
function accept(g){const previous=game;game=normalizeGame(g);busy=false;if(mode==='solo')save('encore.solo',{game,myId});if(previous&&g.show!==previous.show){intro=true;resultDismissed=false;}if(previous&&g.round>previous.round&&g.show===previous.show){resultDismissed=false;animate(previous);}else render();}
function receive(data){
 if(mode!=='multi')return;
 const changed=JSON.stringify(online)!==JSON.stringify(data.online)||!connected;
 myId=data.id;online=data.online;connected=true;
 if(data.game&&(!game||data.game.revision>game.revision)){const pending=busy;accept(data.game);busy=pending;}
 else if(changed)render();
}
async function send(type,extra={}){
 if(busy||animating||!game)return;
 const msg={type,revision:game.revision,show:game.show,round:game.round,...extra};
 if(mode==='solo'){try{accept(command(game,myId,msg,rnd()));}catch(e){toast(e.message);}return;}
 if(!connection||!connected){toast('Connexion en cours. Ta partie est conservée.');return;}
 busy=true;render();const current=connection;
 try{const data=await current.send(msg);if(current===connection)receive(data);}
 catch(e){if(current===connection)toast(e.message);}
 finally{if(current===connection){busy=false;render();current.sync();}}
}
function getName(){name=$('#name')?.value.trim()||name||'Sans nom';save('encore.name',name);return name;}
function clearNetwork(){generation++;connection?.close();connection=null;connected=false;busy=false;}
function solo(){draftSeen='';inventoryScroll=0;intro=true;resultDismissed=false;getName();clearNetwork();mode='solo';myId='solo';game=newGame();game.players=[player(myId,name)];view='game';save('encore.solo',{game,myId});render();}
async function connect(code,newSession=false){
 getName();clearNetwork();game=null;myId=null;online=[];draftSeen='';inventoryScroll=0;intro=true;resultDismissed=false;mode='multi';view='game';
 if(newSession||!session||session.code!==code){session={code,token:credential(),name};save('encore.session',session);}
 const gen=generation;busy=true;render();
 connection=new BandConnection(endpoint,session,{
  state:data=>{if(gen!==generation)return;if(!game)busy=false;receive(data);},
  status:ok=>{if(gen!==generation)return;connected=ok;render();},
  error:error=>{if(gen!==generation)return;busy=false;toast(error.message);if(!game){clearNetwork();mode=null;}render();},
  revision:()=>game?.revision
 });
 await connection.open();
}
app.addEventListener('input',e=>{if(e.target.id==='name'){name=e.target.value;save('encore.name',name);}if(e.target.id==='code')invite=e.target.value.toUpperCase();});
app.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;
 if(animating)return;
 if(a==='focus-help'){const dlg=$('#details');dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><h2>FOCUS : PIGE ×2</h2><p>Double le <strong>poids de pige</strong> d’une copie. Avec <strong>9 tuiles disponibles ou moins</strong>, elles sont toutes pigées.</p><p>Le focus se déplace librement avant de te déclarer prêt. Le bonus temporaire expire à la fin du show.</p><button class="secondary" data-action="close">COMPRIS</button>`;dlg.showModal();}
 if(a==='focus'){await send('focus',{tileId:b.dataset.id});}
 if(a==='draft')draftDialog();
 if(a==='choose-song'){await send('draft',{kind:b.dataset.kind});}
 if(a==='nav'){view=b.dataset.view;render();} if(a==='settings'){view='settings';render();} if(a==='motion'){motion=!motion;save('encore.motion',motion);render();} if(a==='show-details')showIntro(); if(a==='result')showResult(); if(a==='dismiss-result')$('#details').close();
 if(a==='sound'){sound=!sound;save('encore.sound',sound);beep();render();}
 if(a==='rules')rules();if(a==='close')$('#details').close();
 if(a==='solo')solo();if(a==='resume'){intro=false;resultDismissed=false;const s=read('encore.solo');if([1,2].includes(s?.game?.version)){clearNetwork();mode='solo';myId=s.myId;game=normalizeGame(s.game);view='game';render();}else toast('Sauvegarde incompatible. Lance une nouvelle tournée.');}
 if(a==='start'||a==='ready'){if($('#details').open)$('#details').close();send(a);}
 if(a==='inventory'){view='inventory';render();}
 if(a==='back'){view='game';render();}
 if(a==='rewards'){view='rewards';rewardAction='add';render();}
 if(a==='reward-tab'){rewardAction=b.dataset.kind;render();}
 if(a==='choose-add')send('reward',{action:'add',kind:b.dataset.kind});
 if(a==='choose-upgrade')send('reward',{action:'upgrade',tileId:b.dataset.id});
 if(a==='choose-remove'){selected=b.dataset.id;const t=me().inventory.find(t=>t.id===selected);const dlg=$('#details');dlg.innerHTML=`<h2>Retirer ${esc(TILES[t.kind].name)}?</h2><p>Cette tuile quitte ton inventaire pour le reste de la tournée. C’est ton unique récompense pour ce show.</p><button class="primary" data-action="confirm-remove">RETIRER LA TUILE</button><button class="secondary" data-action="close">GARDER</button>`;dlg.showModal();}
 if(a==='confirm-remove'){$('#details').close();send('reward',{action:'remove',tileId:selected});}
 if(a==='tile')inspect(me()?.board[Number(b.dataset.index)]);
 if(a==='inspect-inventory')inspect(me().inventory[Number(b.dataset.index)]);
 if(a==='quit'||a==='again'){draftSeen='';inventoryScroll=0;animationPlayer=null;activeEvent=null;displayScore=null;intro=true;resultDismissed=false;clearNetwork();frames.forEach(clearTimeout);animating=false;game=null;mode=null;view='game';render();}
 if(a==='create'){
  getName();busy=true;render();const token=credential();
  try{const d=await api(endpoint,'create',token,{name});session={code:d.code,token,name};save('encore.session',session);await connect(d.code);}
  catch(e){busy=false;toast(e.message);render();}
 }
 if(a==='join'){const code=($('#code')?.value||invite).trim().toUpperCase();if(!/^[A-F0-9]{12}$/.test(code)){toast('Entre les 12 caractères du code d’invitation.');return;}await connect(code);}
 if(a==='reconnect'&&session)await connect(session.code);
 if(a==='invite'){const u=new URL(location.href);u.search='';u.searchParams.set('band',session.code);try{await navigator.clipboard.writeText(u.href);toast('Lien copié. Envoie-le à ton band!');}catch{toast('Copie ce code : '+session.code);}}
});
render();
async function checkServer(){
 try{const r=await fetch(endpoint+'/health',{signal:AbortSignal.timeout(12000)});const d=await r.json();const ready=!!(r.ok&&d.ok&&d.protocol===2&&d.rules===2);if(ready!==networkReady){networkReady=ready;if(!game)render();}}
 catch{}
 if(!networkReady)setTimeout(checkServer,15000);
}
checkServer();
window.addEventListener('online',()=>connection?.sync());
window.addEventListener('visibilitychange',()=>{if(!document.hidden)connection?.sync();});
