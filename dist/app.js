import {TILES,showInfo,newGame,player,command,targets,adjacent,normalizeGame,focusCapacity,ROLES} from './engine.js?v=0.7.0';
import {tileCard,tileDetails} from './tile-ui.js?v=0.7.0';
import {inventoryMarkup} from './inventory-ui.js?v=0.7.0';
import {overdriveLevel} from './presentation.js';
import {resolutionPlan,resolutionFrame,electricPath} from './resolution.js?v=0.6.0';
import {ResolutionAudio} from './resolution-audio.js?v=0.6.0';
import {icon} from './icons.js';
import {SERVER_URL} from './config.js';
import {api, BandConnection, credential, inviteCode} from './network.js?v=0.7.0';
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(k,d=null)=>{try{return JSON.parse(localStorage.getItem(k))??d;}catch{return d;}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
let game=null,myId=null,mode=null,view='game',selected=null,rewardAction='add',connection=null,online=[],activities={},connected=false,busy=false,networkReady=false,animating=false,frames=[],generation=0;
let name=read('encore.name',''),sound=read('encore.sound',true),session=read('encore.session'),audioCtx;
let invite=new URL(location.href).searchParams.get('band')?.toUpperCase()||'';
const endpoint=(SERVER_URL||location.origin).replace(/\/$/,'');
const rnd=()=>crypto.getRandomValues(new Uint32Array(1))[0];
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function beep(i=0){if(!sound)return;try{audioCtx??=resolutionAudio.ctx||new AudioContext();audioCtx.resume()?.catch(()=>{});const o=audioCtx.createOscillator(),v=audioCtx.createGain();o.type='square';o.frequency.value=[196,247,294,392,494,587,784,988,1175][i%9];v.gain.setValueAtTime(.022,audioCtx.currentTime);v.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.13);o.connect(v).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.14);}catch{}}
function me(){return game?.players.find(p=>p.id===myId);}
const VERSION='0.7.0 · ENCORE ∞';
let intro=true,resultDismissed=false,step=-1,displayScore=null,resolvingName='';
let lastActivity=null;
let rewardSelection=null,draftSelection=null;
let inventoryScroll=0,activeEvent=null,animationPlayer=null,scoredIds=new Set(),freshDeal=false;
let cinematic=null,resolutionRaf=0;
const resolutionAudio=new ResolutionAudio(()=>sound&&!document.hidden);
let motion=read('encore.motion',true);
let healthTimer=null,checkingServer=false,networkState='checking';
const type=t=>TILES[t?.kind]?.family==='guitar'?'quality':TILES[t?.kind]?.family==='voice'?'energy':t?.kind==='duck'?'fans':'utility';
const points=(t)=>[['q','star','Qualité'],['e','bolt','Énergie'],['f','choir','Fans']].filter(([k])=>t?.[k]).map(([k,i,label])=>`<span aria-label="${label}">${icon(i)}${t[k]*(1+(t.repeats||0))}</span>`).join('');
function header(){return `<header class="masthead"><a href="${esc(location.pathname)}" class="wordmark">ENCORE<span>!</span></a><span class="version">${VERSION}</span>${game?`<button class="sound live-sound" data-action="sound" aria-pressed="${sound}" aria-label="${sound?'Couper':'Activer'} le son">${icon('sound')} ${sound?'SON':'MUET'}</button>`:'<button class="sound" data-action="settings" aria-label="Réglages">'+icon('settings')+'</button>'}</header>`;}
function screen(){const show=showInfo(game?.show||0);return `<div class="lcd"><img src="./stage.png" alt="Concert punk sur écran vert"></div><h2>${esc(show.name)}</h2><p>${esc(show.crowd)}</p>`;}
function nav(){return `<nav class="navigation" aria-label="Navigation" ${animating?'inert':''}>${[['game','amp','Show'],['inventory','bag','Inventaire'],['settings','settings','Réglages']].map(([v,i,l])=>`<button data-action="nav" data-view="${v}" class="${view===v?'active':''}">${icon(i)}<span>${l}${v==='inventory'?' · '+me().inventory.length:''}</span></button>`).join('')}</nav>`;}
function shell(content){document.body.classList.toggle('reduced-motion',!motion);return `${header()}<section class="console ${game?'in-game':'at-home'} ${animating?'resolution-mode':''}"><div class="screen-body" data-screen="${view}">${content}</div>${game?nav():''}</section><dialog id="details"></dialog>`;}
function home(){return `<section class="home"><h1>ENCORE!</h1><label class="field">TON NOM DE SCÈNE<input id="name" maxlength="20" value="${esc(name)}" placeholder="Simon" autocomplete="nickname"></label><button class="secondary" data-action="solo">JOUER EN SOLO</button>${read('encore.solo')?'<button class="text-button" data-action="resume">REPRENDRE MON SOLO</button>':''}<section class="multiplayer-home"><h2>MONTE TON <strong>BAND</strong><span>2 JOUEURS</span></h2><button class="primary" data-action="create" ${!networkReady||busy?'disabled':''}>${busy?'CONNEXION…':'CRÉER UN BAND'}</button><div class="join-band"><label class="field">TU AS UNE INVITATION ?<input id="code" maxlength="180" value="${esc(invite)}" placeholder="Code ou lien d’invitation" autocomplete="off" autocapitalize="characters" spellcheck="false"></label><button class="secondary" data-action="join" ${!networkReady||busy?'disabled':''}>REJOINDRE LE BAND</button></div>${!networkReady?`<p class="network-note" role="status">${networkState==='checking'?'Connexion au multi…':'Le multi ne répond pas.'}</p>${networkState==='offline'?'<button class="secondary" data-action="check-server">RÉESSAYER</button>':''}`:'<p class="network-note online-note">● MULTI DISPONIBLE</p>'}${session&&networkReady?'<button class="secondary" data-action="reconnect">REPRENDRE MON BAND</button>':''}</section></section>`;}
function currentActivity(){
 if(animating)return 'resolving';
 if(view==='rewards')return 'studio-'+rewardAction;
 if(view==='draft')return 'choice';
 if(view==='inventory')return 'inventory';
 return 'board';
}
function updateActivity(){const activity=currentActivity();if(connection&&activity!==lastActivity){lastActivity=activity;queueMicrotask(()=>connection?.sync());}}
function musicianStatus(p){
 if(mode!=='multi')return '';
 if(!connected)return 'RECONNEXION';
 if(!online.includes(p.id))return 'HORS LIGNE';
 if(game.phase==='lobby')return 'EN LIGNE';
 if(game.phase==='draft'&&p.drafted||game.phase==='reward'&&p.rewarded)return 'CHOIX FAIT · ATTEND';
 if(p.ready)return 'PRÊT !';
 const activity=p.id===myId?currentActivity():activities[p.id];
 return {resolving:'JOUE SA CHANSON','studio-add':'STUDIO · CHOISIT UNE TUILE','studio-upgrade':'STUDIO · AMÉLIORE UNE TUILE','studio-remove':'STUDIO · RETIRE UNE TUILE',choice:'CHOISIT SA RÉCOMPENSE',inventory:'AJUSTE SON INVENTAIRE',board:'OBSERVE LE PLATEAU'}[activity]||'SE PRÉPARE';
}
function classPortrait(){return '<img class="class-photo" src="./art/guitarist-singer.png" alt="Portrait du Guitariste-chanteur">';}
function lobbyView(){
 const full=game.players.length===2,host=game.players[0].id===myId,allOnline=full&&game.players.every(p=>online.includes(p.id));
 const code=session.code.match(/.{1,4}/g).join(' ');
 return `<section class="band-lobby"><div class="lobby-heading"><span class="tape">TOURNÉE EN COOP</span><h1>TON BAND<span>${game.players.length}<small>/2</small></span></h1></div><div class="band-seats">${game.players.map(p=>`<div class="band-seat ${online.includes(p.id)?'joined':''}"><span class="seat-avatar">${classPortrait()}</span><div><strong>${esc(p.name)} ${p.id===myId?'<small>TOI</small>':''}</strong><span>${musicianStatus(p)}</span></div></div>`).join('')}${!full?'<div class="band-seat empty-seat"><span class="seat-avatar">+</span><div><strong>UNE PLACE LIBRE</strong><span>Invite ton deuxième musicien.</span></div></div>':''}</div><div class="band-invite"><span>CODE DU BAND</span><button class="band-code" data-action="copy-code" aria-label="Copier le code du band">${esc(code)}</button><button class="primary" data-action="invite">COPIER L’INVITATION</button></div><p class="lobby-message" role="status">${!connected?'Reconnexion en cours…':!full?'Partage le lien. Ton band arrive ici.':!allOnline?'Ton partenaire se reconnecte…':host?'Le band est là. À toi de lancer !':'Le créateur lance la tournée.'}</p><button class="primary start-band" data-action="start" ${!host||!allOnline||!connected||busy?'disabled':''}>${!full?'EN ATTENTE DU 2e':!host?'LE CRÉATEUR LANCE…':'LANCER LA TOURNÉE'}</button></section>`;
}
function settingsView(){return `<section class="settings-screen"><h1>Réglages</h1><button class="secondary" data-action="sound" aria-pressed="${sound}">${icon('sound')} SON : ${sound?'ACTIVÉ':'COUPÉ'}</button><button class="secondary" data-action="motion" aria-pressed="${motion}">ANIMATIONS : ${motion?'COMPLÈTES':'RÉDUITES'}</button><button class="secondary" data-action="rules">COMMENT JOUER</button>${mode==='multi'?'<button class="secondary" data-action="invite">COPIER L’INVITATION</button>':''}<button class="secondary" data-action="${game?'quit':'back'}">${game?'QUITTER LA PARTIE':'RETOUR'}</button><p class="version">${VERSION}</p></section>`;}
function meters(){const t=targets(game),score=displayScore||game;return `<div class="meters" data-overdrive="${overdriveLevel(score,t)}">${[['q','QUALITÉ','star'],['e','ÉNERGIE','bolt']].map(([key,label,ic])=>`<div class="meter ${score[key]>t[key]?'overdrive':''}" data-stat="${key}">${icon(ic)}<div><div class="meter-label">${label}<b><em class="stat-value">${score[key]}</em><span> / ${t[key]}</span></b></div><div class="meter-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${t[key]}" aria-valuenow="${Math.min(score[key],t[key])}"><i style="width:${Math.min(100,score[key]/t[key]*100)}%"></i></div><small class="overdrive-label">${score[key]>t[key]?'OVERDRIVE +'+(score[key]-t[key]):score[key]===t[key]?'OBJECTIF ATTEINT':'OBJECTIF DU SHOW'}</small></div></div>`).join('')}</div><div class="drive-status ${overdriveLevel(score,t)===2?'double-drive':''}" role="status">${overdriveLevel(score,t)===2?'DOUBLE OVERDRIVE':overdriveLevel(score,t)===1?'OVERDRIVE':''}</div>`;}
function tileButton(t,index,extra=''){
 return tileCard(t,{index,resolved:!!t?.m,focused:(animationPlayer||me())?.focusedIds?.includes(t?.id),classes:`${extra} ${animating?'unscored':''} ${freshDeal?'deal-in':''} ${t?.m>1?'lit':''}`});
}
function grid(){
 const p=animationPlayer||me(),b=p?.board.length?p.board:Array(9).fill(null),links=[],seen=new Set();
 b.forEach((t,i)=>t?.links?.forEach(j=>{const key=[i,j].sort((a,b)=>a-b).join(':');if(j===i||seen.has(key))return;seen.add(key);
  links.push(`<g data-from="${i}" data-to="${j}"><path class="arc-halo" d="${electricPath(i,j)}"/><path class="arc-core" d="${electricPath(i,j)}"/><path class="arc-fork" d="${electricPath(i,j,1)}"/></g>`);
 }));
 return `<div class="grid-wrap"><div class="grid ${animating&&motion?'playing':''}">${b.map((t,i)=>tileButton(t,i)).join('')}</div><svg class="connections" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">${links.join('')}</svg></div>`;
}
function resolutionView(){
 const g=cinematic.group;
 return `<div class="resolution-shade" aria-hidden="true"></div><div class="resolution-top"><div><small>SUR SCÈNE · ${g.index+1}/${cinematic.plan.groups.length}</small><strong>${esc(g.player.name)}</strong></div><span class="stage-mark">${String(g.index+1).padStart(2,'0')}</span></div>${meters()}${grid()}<div class="resolution-tally">${[['q','star','QUALITÉ'],['e','bolt','ÉNERGIE']].map(([k,i,label])=>`<div class="charge-counter charge-${k}" data-charge="${k}"><span>${icon(i)} ${label}</span><b>0</b><i></i></div>`).join('')}</div><div class="resolution-caption" role="status"><strong>FAIS DU BRUIT !</strong><span class="resolution-fans"></span></div><div class="resolution-pop" aria-hidden="true"><small>FAIS DU BRUIT POUR</small><strong>${esc(g.player.name)}</strong><span>À TOI DE JOUER.</span></div><div class="resource-flights" aria-hidden="true"></div>`;
}
function players(){return `<div class="bandmates">${game.players.map(p=>`<div class="bandmate ${p.id===(animationPlayer?.id||myId)?'current-musician':''}"><div class="portrait">${classPortrait()}</div><div><strong>${esc(p.name)}${mode==='multi'&&p.id===myId?' · TOI':''}</strong><small class="class-name">${esc(ROLES[p.role]?.name||'Guitariste-chanteur')}</small><span>${icon('choir')} ${animating?'…':p.fans} <small>fans</small></span>${mode==='multi'?`<b class="musician-status ${online.includes(p.id)&&connected?'online':''}">${musicianStatus(p)}</b>`:''}</div></div>`).join('')}</div>`;}
function gameView(){if(animating&&cinematic)return resolutionView();if(mode==='multi'&&game.phase==='lobby')return lobbyView();const p=me();if(!p)return '<p>Connexion…</p>';return `<div class="show-top"><button class="show-name" data-action="show-details" aria-label="Détails du show ${esc(showInfo(game.show).name)}"><small>NIVEAU ${game.show+1} · ∞ ${icon('info')}</small><strong>${esc(showInfo(game.show).name)}</strong></button><div class="round">CHANSON <b>${game.round}</b><span>/ ${showInfo(game.show).rounds}</span></div></div>${meters()}${grid()}<div class="readout" aria-live="polite">${animating?'Pige des tuiles…':mode==='multi'&&!connected?'<strong>RECONNEXION…</strong>':p.last?`<span>DERNIÈRE CHANSON</span> ${points(p.last)}`:'Prêt pour la première chanson'}</div>${players()}<div class="action-slot">${animating?'<button class="primary" disabled>CHANSON EN COURS…</button>':game.phase==='show'||game.phase==='draft'?phaseAction():game.phase==='lobby'?'<button class="primary" data-action="show-details">PRÉPARER LE SHOW</button>':game.phase==='reward'?'<button class="primary" data-action="rewards">CONTINUER</button>':'<button class="primary" data-action="result">CONTINUER</button>'}</div>`;}
function showIntro(){if(animating)return;const dlg=$('#details');dlg.dataset.kind='show';dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button>${screen()}<div class="intro-objectives">${icon('star')} ${targets(game).q} ${icon('bolt')} ${targets(game).e}</div><p>Atteins les deux objectifs en ${showInfo(game.show).rounds} chansons. Le show continue même en overdrive. Chaque niveau réussi ouvre un niveau plus difficile.</p>${game.phase==='lobby'?phaseAction():'<button class="primary" data-action="close">JOUER</button>'}`;dlg.showModal();}
function showResult(){if(animating)return;const dlg=$('#details');dlg.dataset.kind='result';dlg.innerHTML=`<button class="dialog-close" data-action="dismiss-result" aria-label="Fermer">${icon('close')}</button>${phaseAction()}`;dlg.showModal();}
function phaseAction(){const p=me();if(game.phase==='lobby')return `<div class="lobby"><h2>${game.players.length===2?'Le band est là.':'La balance est prête.'}</h2><p>${mode==='multi'?'Partage le lien avant de lancer la tournée.':'Une tournée infinie. Ton inventaire devient de plus en plus fort.'}</p>${mode==='multi'?'<button class="secondary" data-action="invite">COPIER LE LIEN D’INVITATION</button>':''}${game.players[0].id===myId?`<button class="primary" data-action="start" ${busy||mode==='multi'&&!connected?'disabled':''}>LANCER LA TOURNÉE ${icon('arrow')}</button>`:'<p>Le créateur lance la tournée.</p>'}</div>`;
 if(game.phase==='draft')return `<button class="primary" data-action="draft" ${p.drafted||busy?'disabled':''}>${p.drafted?'TON PARTENAIRE CHOISIT…':'CONTINUER'} ${icon('arrow')}</button>`;
 if(game.phase==='show')return `<button class="primary play" data-action="ready" ${busy||animating||p.ready||mode==='multi'&&!connected?'disabled':''}>${icon('bolt')}${p.ready?'TON PARTENAIRE SE PRÉPARE…':game.round?'JOUER LA CHANSON SUIVANTE':'JOUER LA PREMIÈRE CHANSON'}${icon('arrow')}</button>`;
 if(game.phase==='reward')return `<div class="result"><span class="tape">SHOW RÉUSSI</span><h2>La salle en redemande.</h2><p>+${p.showFans} fans de performance, en plus des fans gagnés par tes tuiles.</p><button class="primary" data-action="rewards" ${animating||p.rewarded?'disabled':''}>${p.rewarded?'TON BAND CHOISIT ENCORE…':'PASSER AU STUDIO'} ${icon('arrow')}</button></div>`;
 return `<div class="result"><span class="tape">${game.phase==='won'?'TOURNÉE BOUCLÉE!':'SHOW TERMINÉ'}</span><h2>${game.phase==='won'?p.fans+' fans':'Le show s’arrête ici.'}</h2><p>${game.phase==='won'?'Les trois shows sont réussis.':'Il fallait atteindre les deux objectifs. '}</p><div class="tour-results">${game.history.map(h=>`<span>${h.won?'✓':'×'} ${showInfo(h.show).name} · ${points(h)}</span>`).join('')}</div><button class="primary" data-action="again">NOUVELLE TOURNÉE ${icon('repeat')}</button></div>`;}
function focusButton(t){const p=me();if(p.inventory.find(n=>n.id===t.id)?.exhausted)return '<p class="focus-unavailable">ÉPUISÉE · FOCUS INDISPONIBLE</p>';const focused=p.focusedIds.includes(t.id),locked=animating||busy||p.ready||!['lobby','show','draft','reward'].includes(game.phase);return `<button class="focus-toggle ${focused?'active':''}" data-action="focus" data-id="${esc(t.id)}" aria-pressed="${focused}" ${locked?'disabled':''}>${focused?'FOCUS ACTIF':'FOCUS +'}</button>`;}
function inventoryView(){return inventoryMarkup(me(),{
 locked:animating||busy||me().ready||!['lobby','show','draft','reward'].includes(game.phase),
 draft:game.phase==='draft'&&!me().drafted
});}
function draftView(){
 const p=me(),kind=p.songOffers.includes(draftSelection)?draftSelection:p.songOffers[0],locked=busy||mode==='multi'&&!connected;
 return `<section class="choice-screen song-reward-screen"><div class="choice-toolbar"><button class="back" data-action="back">← PLATEAU</button><button class="skip-reward" data-action="skip-song" ${locked?'disabled':''}>PASSER →</button></div><span class="tape">CHANSON ${game.round} TERMINÉE</span><h1>UNE TUILE EN PLUS ?</h1><p class="screen-help">Sélectionne une tuile pour lire son effet. Tu peux <strong>passer</strong> et garder ton inventaire.</p><div class="tile-gallery reward-gallery">${p.songOffers.map(k=>tileCard({kind:k,level:0},{action:'select-song',attributes:`data-kind="${k}" aria-pressed="${k===kind}"`,classes:k===kind?'chosen':''})).join('')}</div>${kind?`<div class="choice-detail">${tileDetails({kind,level:0})}<button class="primary" data-action="choose-song" data-kind="${kind}" ${locked?'disabled':''}>PRENDRE CETTE TUILE</button></div>`:''}</section>`;
}
function rewardsView(){
 const p=me(),locked=busy||mode==='multi'&&!connected,adding=rewardAction==='add';
 const choices=adding?p.offers.map(kind=>({kind,level:0})):p.inventory;
 const selectedTile=choices.find(t=>(adding?t.kind:t.id)===rewardSelection)||choices[0];
 return `<section class="choice-screen reward-screen"><h2 class="studio-title">STUDIO</h2>${players()}<div class="choice-toolbar"><button class="back" data-action="back">← PLATEAU</button>${!p.rewarded?`<button class="skip-reward" data-action="skip-reward" ${locked?'disabled':''}>PASSER →</button>`:''}</div><span class="tape">${game.retry?'ON REMONTE SUR SCÈNE':'NIVEAU '+(game.show+1)+' RÉUSSI'}</span><h1>${game.retry?'REPRENDS DU SOUFFLE.':'FAIS GROSSIR TON SON.'}</h1><p class="screen-help">${game.retry?'Objectif manqué. Renforce ton inventaire, puis retente le même niveau. Tu gardes tes tuiles et tes fans.':'Choisis une amélioration pour la suite. Le prochain niveau sera plus difficile.'}</p>${p.rewarded?'<p class="waiting-choice">CHOIX FAIT · TON PARTENAIRE CHOISIT…</p>':`<div class="reward-tabs">${[['add','AJOUTER'],['upgrade','AMÉLIORER'],['remove','RETIRER']].map(([k,label])=>`<button class="${rewardAction===k?'active':''}" data-action="reward-tab" data-kind="${k}" aria-pressed="${rewardAction===k}">${label}</button>`).join('')}</div><p class="screen-help">${adding?'Une seule tuile à ajouter.':rewardAction==='upgrade'?'Un niveau permanent en plus. Aucun plafond d’amélioration.':'Retire une tuile pour faire ressortir les autres plus souvent.'} <strong>Touche une tuile pour voir son effet.</strong></p><div class="tile-gallery reward-gallery">${choices.map(t=>tileCard(t,{action:'select-reward',attributes:`data-id="${esc(adding?t.kind:t.id)}" aria-pressed="${t===selectedTile}"`,classes:t===selectedTile?'chosen':''})).join('')}</div>${selectedTile?`<div class="choice-detail">${tileDetails(selectedTile,{upgrade:rewardAction==='upgrade'})}<button class="primary" data-action="choose-${rewardAction}" ${adding?`data-kind="${selectedTile.kind}"`:`data-id="${esc(selectedTile.id)}"`} ${locked?'disabled':''}>${adding?'PRENDRE CETTE TUILE':rewardAction==='upgrade'?'AMÉLIORER +1':'RETIRER CETTE TUILE'}</button></div>`:''}`}</section>`;
}
function render(){
 if(animating&&view==='game'&&$('.grid')){paintResolution();return;}
 if(view==='rewards'&&game?.phase!=='reward')view='game';
 if(view==='draft'&&(game?.phase!=='draft'||me()?.drafted))view='game';
 const oldBody=$('.screen-body'),bodyScroll=oldBody?.dataset.screen===view?oldBody.scrollTop:0;
 const oldDialog=$('#details');const modal=oldDialog?.open?{html:oldDialog.innerHTML,kind:oldDialog.dataset.kind,tileId:oldDialog.dataset.tileId,classes:oldDialog.className}:null;
 const collection=$('.collection');if(collection)inventoryScroll=collection.scrollTop;
 const focusedTile=document.activeElement?.dataset.action==='focus'?document.activeElement.dataset.id:null;
 app.innerHTML=shell(view==='settings'?settingsView():!game?home():view==='inventory'?inventoryView():view==='rewards'?rewardsView():view==='draft'?draftView():gameView());
 if($('.screen-body'))$('.screen-body').scrollTop=bodyScroll;updateActivity();
 if(view==='inventory'){const list=$('.collection');if(list)list.scrollTop=inventoryScroll;if(focusedTile){const target=[...document.querySelectorAll('.collection .focus-toggle')].find(b=>b.dataset.id===focusedTile);target?.focus({preventScroll:true});}}
 if(modal&&!animating){const dlg=$('#details');if(modal.kind==='inspect'){const t=me()?.inventory.find(t=>t.id===modal.tileId)||me()?.board.find(t=>t?.id===modal.tileId);if(t){inspect(t);return;}}else if(['rules','focus','show'].includes(modal.kind)){dlg.innerHTML=modal.html;dlg.className=modal.classes;dlg.dataset.kind=modal.kind;dlg.showModal();return;}}
 if(game&&view==='game'&&!animating){
  if(mode==='multi'&&game.phase==='lobby'){intro=false;return;}
  if(intro){intro=false;showIntro();}
 }
}
function inspect(t){
 const empty=!t||t.kind==='empty',dlg=$('#details');dlg.dataset.kind='inspect';dlg.dataset.tileId=t?.id||'';dlg.className='tile-dialog';
 dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><div class="inspect-preview">${tileCard(t,{action:'noop',resolved:!!t?.m})}</div>${empty?'<h2>Case vide</h2><p>Complète la grille quand moins de 9 tuiles sont disponibles.</p>':tileDetails(t)}${t?.m?`<div class="detail-score"><strong>CETTE CHANSON</strong><span>${points(t)||'Effet de soutien'}</span>${t.m>1?`<b>×${t.m}</b>`:''}${t.repeats?'<b>Rejouée '+t.repeats+' fois</b>':''}</div>`:''}${!empty&&me()?.inventory.some(x=>x.id===t.id)?focusButton(t):''}<button class="secondary" data-action="close">FERMER</button>`;
 dlg.showModal();
}
function rules(){const dlg=$('#details');dlg.dataset.kind='rules';dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><h2>Comment jouer</h2><ol><li>Le guitariste-chanteur commence avec 5 tuiles et 1 focus.</li><li>Chaque chanson pige jusqu’à 9 tuiles distinctes. Les cases restantes sont vides.</li><li>Les synergies touchent les quatre côtés, sauf les effets qui concernent toute la grille. Une guitare entre deux voix vaut ×4; les voix valent ×2.</li><li>Entre les chansons, observe le plateau, puis appuie sur Continuer pour choisir parmi 3 tuiles différentes. Tu peux obtenir une sorte déjà présente dans ton inventaire.</li><li>Dans l’inventaire, affecte ton focus à une copie pour doubler son poids de pige. Déplace-le librement avant de te déclarer prêt. Le focus temporaire expire à la fin du show.</li><li>Joue les 5 chansons et atteins les deux objectifs. Dépasse-les pour entrer en overdrive; le surplus contribue aux fans de performance.</li><li>Entre les shows, ajoute, améliore ou retire une tuile, ou passe. Les améliorations sont permanentes, sans plafond. Après un échec, garde ton inventaire et retente le niveau. La tournée continue sans dernier niveau. En coop, les points s’additionnent; chacun choisit sa tuile et son focus.</li></ol><p>Épuisée : sortie du show. Désactivée : encore pigée, sans effet. Ces états et les charges se réinitialisent au prochain show.</p><button class="primary" data-action="close">FERMER</button>`;dlg.showModal();}
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
 document.querySelectorAll('.connections g').forEach(el=>el.classList.toggle('linked-active',!!activeEvent&&[Number(el.dataset.from),Number(el.dataset.to)].every(i=>activeEvent.related.includes(i))));
 if(activeEvent&&$('.readout'))$('.readout').innerHTML=`<span>${esc(activeEvent.name)} · ${esc(TILES[activeEvent.kind].name)}</span> ${points(activeEvent)||'<span>SYNERGIE</span>'}`;
}
function stopResolution(){
 cancelAnimationFrame(resolutionRaf);frames.forEach(clearTimeout);frames=[];resolutionAudio.stop();
 animating=false;activeEvent=null;animationPlayer=null;displayScore=null;cinematic=null;
 document.body.classList.remove('resolving');
}
function transferPackets(g){
 if(cinematic.plan.reduced)return;
 const layer=$('.resource-flights');if(!layer)return;
 for(const [key,ic] of [['q','star'],['e','bolt']]){
  if(!g.total[key])continue;
  const source=$(`[data-charge="${key}"]`).getBoundingClientRect(),target=$(`[data-stat="${key}"]`).getBoundingClientRect();
  const x=source.x+source.width/2,y=source.y+source.height/2,dx=target.x+target.width/2-x,dy=target.y+target.height/2-y;
  const packet=document.createElement('div');packet.className=`resource-packet packet-${key}`;
  packet.style.cssText=`left:${x}px;top:${y}px;--dx:${dx}px;--dy:${dy}px`;
  packet.innerHTML=`${icon(ic)}<b>+${g.total[key]}</b>`;layer.append(packet);
 }
}
function paintCinematic(frame){
 const c=cinematic,g=frame.group,changed=c.mounted!==g.index;
 if(changed){
  c.group=g;c.mounted=g.index;animationPlayer=g.player;activeEvent=null;scoredIds=new Set();
  app.innerHTML=shell(gameView());
  const consoleEl=$('.console');consoleEl.style.setProperty('--stage-color',['#baff42','#ff5aae','#60e9ff','#ffba42'][g.index%4]);
 }
 const phaseKey=g.index+':'+frame.phase,eventKey=frame.event?g.index+':'+frame.event.index:null;
 const phaseChanged=c.phaseKey!==phaseKey;c.phaseKey=phaseKey;
 $('.console').dataset.resolution=frame.phase;
 if(phaseChanged){
  if(frame.phase==='intro'){resolutionAudio.announce(g.player.name);$('.resolution-caption strong').textContent='FAIS DU BRUIT !';}
  if(frame.phase==='hold')$('.resolution-caption strong').textContent='ENVOIE LA SAUCE !';
  if(frame.phase==='transfer'){resolutionAudio.transfer();transferPackets(g);$('.resolution-caption strong').textContent='POUR LE BAND !';}
  if(frame.phase==='impact'){resolutionAudio.boom();$('.resolution-caption strong').textContent='BOOM !';}
 }
 if(eventKey!==c.eventKey){c.eventKey=eventKey;if(frame.event){resolutionAudio.hit(frame.event.index);$('.resolution-caption strong').textContent=TILES[frame.event.kind].name;}}
 activeEvent=frame.event;
 for(const event of g.events.slice(0,frame.completed))scoredIds.add(g.player.id+':'+event.index);
 if(frame.event&&frame.progress>=1)scoredIds.add(g.player.id+':'+frame.event.index);
 const oldLevel=overdriveLevel(displayScore,targets(game));displayScore=frame.score;paintResolution();
 if(overdriveLevel(displayScore,targets(game))>oldLevel)overdriveHit(overdriveLevel(displayScore,targets(game)));
 for(const key of ['q','e']){
  const el=$(`[data-charge="${key}"]`),num=el.querySelector('b');
  if(num.textContent!==String(frame.local[key])){num.textContent=frame.local[key];el.classList.add('counter-tick');}
  el.querySelector('i').style.width=(g.total[key]?frame.local[key]/g.total[key]*100:0)+'%';
 }
 const fans=$('.resolution-fans');fans.textContent=frame.local.f?'+'+frame.local.f+' FANS':'';
 const value=frame.local.q+frame.local.e+frame.local.f;
 if(value!==c.lastValue&&frame.phase==='charge'&&performance.now()-c.lastTick>65){resolutionAudio.tick(value);c.lastTick=performance.now();}
 c.lastValue=value;
}
function animate(previous){
 stopResolution();
 const reduced=!motion||matchMedia('(prefers-reduced-motion: reduce)').matches,plan=resolutionPlan(game.players,previous,reduced);
 if(!plan.groups.length){render();return;}
 animating=true;displayScore={q:previous.q,e:previous.e};view='game';
 cinematic={plan,group:plan.groups[0],mounted:-1,phaseKey:null,eventKey:null,lastValue:0,lastTick:0};
 document.body.classList.add('resolving');updateActivity();
 const started=performance.now();
 function tick(now){
  if(!animating)return;
  const frame=resolutionFrame(plan,now-started);
  if(frame.done){stopResolution();render();return;}
  paintCinematic(frame);resolutionRaf=requestAnimationFrame(tick);
 }
 tick(started);
}
function accept(g){const previous=game;game=normalizeGame(g);busy=false;if(mode==='solo')save('encore.solo',{game,myId});if(previous&&(g.show!==previous.show||previous.phase==='lobby'&&g.phase==='show')){intro=true;resultDismissed=false;}if(previous&&g.round>previous.round&&g.show===previous.show){resultDismissed=false;animate(previous);}else render();}
function receive(data){
 if(mode!=='multi')return;
 const changed=JSON.stringify(online)!==JSON.stringify(data.online)||JSON.stringify(activities)!==JSON.stringify(data.activities||{})||!connected;activities=data.activities||{};
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
function clearNetwork(){lastActivity=null;activities={};stopResolution();generation++;connection?.close();connection=null;connected=false;busy=false;}
function solo(){inventoryScroll=0;intro=true;resultDismissed=false;getName();clearNetwork();mode='solo';myId='solo';game=newGame();game.players=[player(myId,name)];view='game';save('encore.solo',{game,myId});render();}
async function connect(code,newSession=false){
 getName();clearNetwork();game=null;myId=null;online=[];inventoryScroll=0;intro=true;resultDismissed=false;mode='multi';view='game';
 if(newSession||!session||session.code!==code){session={code,token:credential(),name};save('encore.session',session);}
 const gen=generation;busy=true;render();
 connection=new BandConnection(endpoint,session,{
  state:data=>{if(gen!==generation)return;if(!game)busy=false;receive(data);},
  status:ok=>{if(gen!==generation)return;connected=ok;render();},
  error:error=>{if(gen!==generation)return;busy=false;toast(error.message);if(!game){clearNetwork();mode=null;}render();},
  revision:()=>game?.revision,activity:()=>currentActivity()
 });
 await connection.open();
}
app.addEventListener('input',e=>{if(e.target.id==='name'){name=e.target.value;save('encore.name',name);}if(e.target.id==='code')invite=e.target.value;});
app.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;if(a==='noop')return;
 if(a==='sound'){sound=!sound;save('encore.sound',sound);if(sound){resolutionAudio.unlock();beep();if(animating)resolutionAudio.announce(animationPlayer.name);}else resolutionAudio.stop();const control=$('.live-sound');if(control){control.setAttribute('aria-pressed',sound);control.setAttribute('aria-label',sound?'Couper le son':'Activer le son');control.innerHTML=icon('sound')+' '+(sound?'SON':'MUET');}if(!animating)render();return;}
 resolutionAudio.unlock();
 if(animating)return;
 if(a==='focus-help'){const dlg=$('#details');dlg.dataset.kind='focus';dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><h2>FOCUS : PIGE ×2</h2><p>Double le <strong>poids de pige</strong> d’une copie. Avec <strong>9 tuiles disponibles ou moins</strong>, elles sont toutes pigées.</p><p>Le focus se déplace librement avant de te déclarer prêt. Le bonus temporaire expire à la fin du show.</p><button class="secondary" data-action="close">COMPRIS</button>`;dlg.showModal();}
 if(a==='focus'){await send('focus',{tileId:b.dataset.id});}
 if(a==='draft'&&game.phase==='draft'&&!me().drafted){view='draft';render();}
 if(a==='inspect-offer')inspect({kind:b.dataset.kind});
 if(a==='select-song'){draftSelection=b.dataset.kind;render();}
 if(a==='select-reward'){rewardSelection=b.dataset.id;render();$('.choice-detail')?.scrollIntoView({block:'nearest',behavior:motion?'smooth':'instant'});}
 if(a==='choose-song'){await send('draft',{kind:b.dataset.kind});}
 if(a==='skip-song'){await send('draft',{action:'skip'});}
 if(a==='skip-reward'){await send('reward',{action:'skip'});}
 if(a==='nav'){view=b.dataset.view;render();} if(a==='settings'){view='settings';render();} if(a==='motion'){motion=!motion;save('encore.motion',motion);render();} if(a==='show-details')showIntro(); if(a==='result')showResult(); if(a==='dismiss-result')$('#details').close();
 if(a==='rules')rules();if(a==='close')$('#details').close();
 if(a==='solo')solo();if(a==='resume'){intro=false;resultDismissed=false;const s=read('encore.solo');if([1,2].includes(s?.game?.version)){clearNetwork();mode='solo';myId=s.myId;game=normalizeGame(s.game);view='game';render();}else toast('Sauvegarde incompatible. Lance une nouvelle tournée.');}
 if(a==='start'||a==='ready'){if($('#details').open)$('#details').close();send(a);}
 if(a==='inventory'){if($('#details').open)$('#details').close();view='inventory';render();}
 if(a==='back'){view='game';render();}
 if(a==='rewards'){view='rewards';rewardAction='add';rewardSelection=null;render();}
 if(a==='reward-tab'){rewardAction=b.dataset.kind;rewardSelection=null;render();}
 if(a==='choose-add')send('reward',{action:'add',kind:b.dataset.kind});
 if(a==='choose-upgrade')send('reward',{action:'upgrade',tileId:b.dataset.id});
 if(a==='choose-remove'){selected=b.dataset.id;const t=me().inventory.find(t=>t.id===selected);const dlg=$('#details');dlg.innerHTML=`<h2>Retirer ${esc(TILES[t.kind].name)}?</h2><p>Cette tuile quitte ton inventaire pour le reste de la tournée. C’est ton unique récompense pour ce show.</p><button class="primary" data-action="confirm-remove">RETIRER LA TUILE</button><button class="secondary" data-action="close">GARDER</button>`;dlg.showModal();}
 if(a==='confirm-remove'){$('#details').close();send('reward',{action:'remove',tileId:selected});}
 if(a==='tile')inspect(me()?.board[Number(b.dataset.index)]);
 if(a==='inspect-inventory')inspect(me().inventory[Number(b.dataset.index)]);
 if(a==='quit'||a==='again'){inventoryScroll=0;animationPlayer=null;activeEvent=null;displayScore=null;intro=true;resultDismissed=false;clearNetwork();frames.forEach(clearTimeout);animating=false;game=null;mode=null;view='game';render();}
 if(a==='create'){
  getName();busy=true;render();const token=credential();
  try{const d=await api(endpoint,'create',token,{name});session={code:d.code,token,name};save('encore.session',session);await connect(d.code);}
  catch(e){busy=false;toast(e.message);render();}
 }
 if(a==='join'){const code=inviteCode($('#code')?.value||invite);if(!code){toast('Colle le lien ou les 12 caractères du code.');return;}await connect(code);}
 if(a==='check-server')checkServer();
 if(a==='copy-code'){try{await navigator.clipboard.writeText(session.code);toast('Code copié !');}catch{toast('Code : '+session.code);}}
 if(a==='reconnect'&&session)await connect(session.code);
 if(a==='invite'){const u=new URL(location.href);u.search='';u.searchParams.set('band',session.code);try{await navigator.clipboard.writeText(u.href);toast('Lien copié. Envoie-le à ton band!');}catch{toast('Copie ce code : '+session.code);}}
});
render();
async function checkServer(){
 if(checkingServer)return;checkingServer=true;clearTimeout(healthTimer);networkState='checking';if(!game)render();
 try{const r=await fetch(endpoint+'/health',{signal:AbortSignal.timeout(12000)});const d=await r.json();networkReady=!!(r.ok&&d.ok&&d.protocol===2&&d.rules===3);}
 catch{networkReady=false;}
 finally{checkingServer=false;networkState=networkReady?'online':'offline';if(!game)render();}
 if(!networkReady)healthTimer=setTimeout(checkServer,15000);
}
checkServer();
window.addEventListener('online',()=>{if(connection)connection.sync();else if(!networkReady)checkServer();});
window.addEventListener('offline',()=>{if(connection){connected=false;render();}});
window.addEventListener('visibilitychange',()=>{if(document.hidden){resolutionAudio.stop();}else{if(animating){stopResolution();render();}connection?.sync();}});
window.addEventListener('pagehide',()=>stopResolution());
window.addEventListener('pageshow',e=>{if(e.persisted)render();});
