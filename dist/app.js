import {studioMarkup,studioConfirmation} from './studio-ui.js?v=0.9.18';
import {paintDeal} from './deal-ui.js?v=0.9.18';
import {finishedShow,lastSong,songCounter,songDecor,verdictMarkup,SongEffects} from './song-ui.js?v=0.9.18';
import {ShowVisual,showVisualMarkup,showAsset,classArt,preloadShowCover} from './show-art.js?v=0.9.18';
import {Juice,scoreCallout} from './juice.js?v=0.9.18';
import {mountScreen,ScreenMotion} from './screen-ui.js?v=0.9.18';
import {RewardAdvance} from './autoplay.js?v=0.9.18';
import {statsMarkup} from './stats-ui.js?v=0.9.18';
import {installTooltips,hideTooltip} from './tooltips.js?v=0.9.18';
import {TILES,showInfo,newGame,player,command,targets,adjacent,normalizeGame,focusCapacity,ROLES} from './engine.js?v=0.9.18';
import {tileCard,tileDetails} from './tile-ui.js?v=0.9.18';
import {inventoryMarkup} from './inventory-ui.js?v=0.9.18';
import {overdriveLevel} from './presentation.js';
import {resolutionPlan,resolutionFrame,electricPath} from './resolution.js?v=0.9.18';
import {StageAudio,audioScene,musicSettings} from './stage-audio.js?v=0.9.18';
import {icon} from './icons.js?v=0.9.18';
import {SERVER_URL} from './config.js?v=0.9.18';
import {api, BandConnection, credential, inviteCode} from './network.js?v=0.9.18';
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE_PREFIX=location.pathname.split('/').includes('audio-test')?'audio-preview.':'';
const read=(k,d=null)=>{try{return JSON.parse(localStorage.getItem(STORAGE_PREFIX+k))??d;}catch{return d;}};
const save=(k,v)=>{try{localStorage.setItem(STORAGE_PREFIX+k,JSON.stringify(v));}catch{}};
let game=null,myId=null,mode=null,view='game',selected=null,rewardAction='add',connection=null,online=[],activities={},connected=false,busy=false,networkReady=false,animating=false,frames=[],generation=0;
let name=read('encore.name',''),sound=read('encore.sound',true),session=read('encore.session');
let invite=new URL(location.href).searchParams.get('band')?.toUpperCase()||'';
const endpoint=(SERVER_URL||location.origin).replace(/\/$/,'');
const rnd=()=>crypto.getRandomValues(new Uint32Array(1))[0];
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function beep(i=0){resolutionAudio.tone([196,247,294,392,494,587,784,988,1175][i%9],160,.13,.022,'square');}
function me(){return game?.players.find(p=>p.id===myId);}
const VERSION='0.9.18 · ENCORE ∞';
let intro=true,resultDismissed=false,step=-1,displayScore=null,resolvingName='';
let lastActivity=null;
let rewardSelection=null,draftSelection=null;
const studioSelections={};let studioReturn=false,studioLastConfirm=-Infinity;
let inventoryScroll=0,activeEvent=null,animationPlayer=null,scoredIds=new Set(),freshDeal=false;
let cinematic=null,resolutionRaf=0;
const resolutionAudio=new StageAudio(()=>sound&&!document.hidden);
const audioLevels=read('encore.mix.v2')??musicSettings(read('encore.mix'));
resolutionAudio.setLevels(audioLevels);
function syncAudio(){resolutionAudio.setScene(audioScene(game,view,animating));}
let motion=read('encore.motion',true);
const juice=new Juice(app,()=>motion),advance=new RewardAdvance();
const screenMotion=new ScreenMotion(app,()=>motion);
const showVisual=new ShowVisual();
const songEffects=new SongEffects(app,()=>!motion||matchMedia('(prefers-reduced-motion: reduce)').matches);
function showingVerdict(){return !!game&&view==='game'&&!animating&&finishedShow(game)&&!resultDismissed;}
function syncShowVisual(frame){
 const p=animationPlayer||me(),score=displayScore||game;
 const ending=!animating||frame&&['impact','outro'].includes(frame.phase)&&frame.group.index===cinematic.plan.groups.length-1;
 showVisual.update($('.show-visual canvas'),{show:game?.show||0,role:p?.role,players:game?.players,activePlayerId:p?.id,performanceLayout:!showingVerdict(),resultLayout:showingVerdict(),
  performance:frame?.phase==='charge'?TILES[frame.event?.kind]?.family:null,
  result:ending?(game?.phase==='lost'?'sad':game?.phase==='reward'||game?.phase==='won'?'happy':null):null,
  overdrive:!!game&&overdriveLevel(score,targets(game))>0,intensity:frame?Math.min(1,(frame.local.q+frame.local.e)/40):0,
  hit:frame?.phase==='charge'&&frame.event&&(frame.event.q+frame.event.e+frame.event.f>=10)?frame.group.index+':'+frame.event.index:null,
  reduced:!motion||matchMedia('(prefers-reduced-motion: reduce)').matches,paused:!animating||document.hidden||!!$('#details')?.open});
}
function fitDialogs(){const r=$('.console')?.getBoundingClientRect();if(!r)return;for(const [k,v] of Object.entries({x:r.x,y:r.y,w:r.width,h:r.height}))document.documentElement.style.setProperty('--phone-'+k,v+'px');}
new ResizeObserver(fitDialogs).observe(app);
window.addEventListener('resize',fitDialogs);
function mount(content,preserveDialog=false){
 const key=!game?'home':`${view}:${animating?'performance-'+cinematic.group.index:game.phase==='lobby'?'lobby':'board'}`;
 const before=screenMotion.capture(key);
 juice.release();mountScreen(app,shell(content),preserveDialog);fitBoard();fitDialogs();screenMotion.settle(before);syncShowVisual();songEffects.sync(game);
}
let autoReadyScheduled=false;
function maybeAutoReady(){
 if(mode==='multi'&&game?.round===0)return;
 if(autoReadyScheduled||busy||animating||document.hidden||!game||mode==='multi'&&!connected||!advance.pending)return;
 autoReadyScheduled=true;queueMicrotask(async()=>{
  autoReadyScheduled=false;if(busy||animating||document.hidden||!game||mode==='multi'&&!connected||!advance.take(game,myId))return;
  intro=false;view='game';$('#details')?.close();
  const gen=generation;if(!await send('ready')&&gen===generation)advance.clear();
 });
}
let healthTimer=null,checkingServer=false,networkState='checking';
const type=t=>TILES[t?.kind]?.family==='guitar'?'quality':TILES[t?.kind]?.family==='voice'?'energy':t?.kind==='duck'?'fans':'utility';
const points=(t)=>[['q','star','Qualité'],['e','bolt','Énergie'],['f','choir','Fans']].filter(([k])=>t?.[k]).map(([k,i,label])=>`<span aria-label="${label}">${icon(i)}${t[k]*(1+(t.repeats||0))}</span>`).join('');
function header(){return '';}
function nav(){return `<nav class="navigation" aria-label="Navigation" ${animating?'inert':''}>${[['game','amp','Show'],['inventory','bag','Inventaire'],['stats','star','Stats'],['settings','settings','Réglages']].map(([v,i,l])=>`<button data-action="nav" data-view="${v}" class="${view===v?'active':''}">${icon(i)}<span>${l}${v==='inventory'?' · '+me().inventory.length:''}</span></button>`).join('')}</nav>`;}
function shell(content){document.body.classList.toggle('reduced-motion',!motion);return `${header()}<section class="console ${game?'in-game':'at-home'} ${animating?'resolution-mode':''} ${view==='rewards'?'studio-mode':''} ${lastSong(game)&&!showingVerdict()&&view!=='rewards'?'last-song':''}">${game&&!showingVerdict()&&view!=='rewards'?songDecor():''}<div class="screen-body" data-screen="${view}">${content}</div>${game&&view==='game'&&!animating&&!showingVerdict()&&!(mode==='multi'&&game.phase==='lobby')?playAction():''}${game?nav():''}<span class="case-version">v0.9.18</span></section><dialog id="details"></dialog>`;}
function home(){return `<section class="home"><h1>ENCORE!</h1><div class="home-content content-box" data-scroll="home" role="region" aria-label="Accès au jeu" tabindex="0"><label class="field">TON NOM DE SCÈNE<input id="name" maxlength="20" value="${esc(name)}" placeholder="Simon" autocomplete="nickname"></label><button class="action-button secondary" data-action="solo">JOUER EN SOLO</button>${read('encore.solo')?'<button class="action-button text-button" data-action="resume">REPRENDRE MON SOLO</button>':''}<section class="multiplayer-home"><h2>MONTE TON <strong>BAND</strong><span>2 JOUEURS</span></h2><button class="action-button primary" data-action="create" ${!networkReady||busy?'disabled':''}>${busy?'CONNEXION…':'CRÉER UN BAND'}</button><div class="join-band"><label class="field">TU AS UNE INVITATION ?<input id="code" maxlength="180" value="${esc(invite)}" placeholder="Code ou lien d’invitation" autocomplete="off" autocapitalize="characters" spellcheck="false"></label><button class="action-button secondary" data-action="join" ${!networkReady||busy?'disabled':''}>REJOINDRE LE BAND</button></div>${!networkReady?`<p class="network-note" role="status">${networkState==='checking'?'Connexion au multi…':'Le multi ne répond pas.'}</p>${networkState==='offline'?'<button class="action-button secondary" data-action="check-server">RÉESSAYER</button>':''}`:'<p class="network-note online-note">● MULTI DISPONIBLE</p>'}${session&&networkReady?'<button class="action-button secondary" data-action="reconnect">REPRENDRE MON BAND</button>':''}</section></div></section>`;}
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
function classPortrait(p){return `<img class="class-photo" src="${classArt(p?.role).portrait}" alt="Portrait du ${esc(ROLES[p?.role]?.name||'Guitariste-chanteur')}">`;}
function lobbyView(){
 const full=game.players.length===2,host=game.players[0].id===myId,allOnline=full&&game.players.every(p=>online.includes(p.id));
 const code=session.code.match(/.{1,4}/g).join(' ');
 return `<section class="band-lobby"><div class="lobby-heading"><span class="tape">TOURNÉE EN COOP</span><h1>TON BAND<span>${game.players.length}<small>/2</small></span></h1></div><div class="lobby-content content-box" data-scroll="lobby" role="region" aria-label="Musiciens et invitation" tabindex="0"><div class="band-seats">${game.players.map(p=>`<div class="band-seat ${online.includes(p.id)?'joined':''}"><span class="seat-avatar">${classPortrait(p)}</span><div><strong>${esc(p.name)} ${p.id===myId?'<small>TOI</small>':''}</strong><span>${musicianStatus(p)}</span></div></div>`).join('')}${!full?'<div class="band-seat empty-seat"><span class="seat-avatar">+</span><div><strong>UNE PLACE LIBRE</strong><span>Invite ton deuxième musicien.</span></div></div>':''}</div><div class="band-invite"><span>CODE DU BAND</span><button class="band-code" data-action="copy-code" aria-label="Copier le code du band">${esc(code)}</button><button class="action-button primary" data-action="invite">COPIER L’INVITATION</button></div><p class="lobby-message" role="status">${!connected?'Reconnexion en cours…':!full?'Partage le lien. Ton band arrive ici.':!allOnline?'Ton partenaire se reconnecte…':host?'Le band est là. À toi de lancer !':'Le créateur lance la tournée.'}</p></div><button class="action-button primary start-band" data-action="start" ${!host||!allOnline||!connected||busy?'disabled':''}>${!full?'EN ATTENTE DU 2e':!host?'LE CRÉATEUR LANCE…':'PRÉPARER LE SHOW'}</button></section>`;
}
function settingsView(){return `<section class="settings-screen"><h1>Réglages</h1><div class="settings-content content-box" data-scroll="settings" role="region" aria-label="Options du jeu" tabindex="0"><button class="action-button secondary" data-action="sound" aria-pressed="${sound}">${icon('sound')} SON : ${sound?'ACTIVÉ':'COUPÉ'}</button><div class="audio-mix">${[['music','MUSIQUE'],['effects','EFFETS'],['voice','VOIX']].map(([key,label])=>`<label>${label}<input type="range" min="0" max="100" value="${Math.round(resolutionAudio.levels[key]*100)}" data-mix="${key}" aria-label="${label}"></label>`).join('')}</div><button class="action-button secondary" data-action="motion" aria-pressed="${motion}">ANIMATIONS : ${motion?'COMPLÈTES':'RÉDUITES'}</button><button class="action-button secondary" data-action="rules">COMMENT JOUER</button>${mode==='multi'?'<button class="action-button secondary" data-action="invite">COPIER L’INVITATION</button>':''}<button class="action-button secondary" data-action="${game?'finish-tour':'back'}">${game?'BILAN AVANT DE QUITTER':'RETOUR'}</button><p class="version">${VERSION}</p><p class="audio-credits">Musique : DJARTMUSIC · Sons : JDSherbert</p></div></section>`;}
function meters(){const t=targets(game),score=displayScore||game;return `<div class="meters" data-overdrive="${overdriveLevel(score,t)}">${[['q','QUALITÉ','star'],['e','ÉNERGIE','bolt']].map(([key,label,ic])=>`<div class="meter ${score[key]>t[key]?'overdrive':''}" data-stat="${key}">${icon(ic)}<div><div class="meter-label">${label}<b><em class="stat-value">${score[key]}</em><span> / ${t[key]}</span></b></div><div class="meter-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${t[key]}" aria-valuenow="${Math.min(score[key],t[key])}"><i style="width:${Math.min(100,score[key]/t[key]*100)}%"></i></div><small class="overdrive-label">${score[key]>=t[key]?'ATTEINT':'OBJECTIF DU SHOW'}</small>${!animating&&me()?.last?`<small class="last-song-stat">Dernière chanson ${icon(ic)} <b>${me().last[key]||0}</b></small>`:''}</div></div>`).join('')}</div><div class="drive-status ${overdriveLevel(score,t)===2?'double-drive':''}" role="status">${overdriveLevel(score,t)===2?'DOUBLE OVERDRIVE':overdriveLevel(score,t)===1?'OVERDRIVE':''}</div>`;}
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
 return `<div class="resolution-shade" aria-hidden="true"></div><div class="resolution-top"><div><small>SUR SCÈNE · ${g.index+1}/${cinematic.plan.groups.length}</small><strong>${esc(g.player.name)}</strong></div>${songCounter(game)}<button class="live-sound" data-action="sound" aria-pressed="${sound}" aria-label="${sound?'Couper le son':'Activer le son'}">${icon('sound')} ${sound?'SON':'MUET'}</button></div>${meters()}${grid()}<div class="resolution-tally">${[['q','star','QUALITÉ'],['e','bolt','ÉNERGIE']].map(([k,i,label])=>`<div class="charge-counter charge-${k}" data-charge="${k}"><span>${icon(i)} ${label}</span><b>0</b><i></i></div>`).join('')}</div><div class="resolution-caption" role="status"><strong>FAIS DU BRUIT !</strong><span class="resolution-fans"></span></div>${showVisualMarkup()}<div class="resolution-pop" aria-hidden="true"><strong>${esc(g.player.name)}</strong></div><div class="resource-flights" aria-hidden="true"></div>`;
}
function players(){return `<div class="bandmates">${game.players.map(p=>`<button class="bandmate ${p.id===myId?'current-musician':''}" data-action="profile" data-id="${esc(p.id)}" aria-label="Profil de ${esc(p.name)}"><span class="portrait">${classPortrait(p)}</span><span class="musician-mini"><strong>${esc(p.name)}</strong><span>${icon('choir')}${p.fans} FANS</span>${mode==='multi'?`<small class="musician-status">${musicianStatus(p)}</small>`:''}</span></button>`).join('')}<button class="band-total" data-action="stats"><b>${icon('choir')}${game.players.reduce((n,p)=>n+p.fans,0)}</b><span>FANS DU BAND</span></button></div>`;}
let statsPlayer='band',statsRange='all',statsMode='production';
function statsView(){return statsMarkup(game,{playerId:statsPlayer,range:statsRange,chartMode:statsMode,returnLabel:studioReturn&&game?.phase==='reward'?'RETOUR AU STUDIO':'RETOUR SUR SCÈNE'});}
function profile(id){statsPlayer=id;statsRange='all';view='stats';render();}

function showHeader(){return `<div class="show-top"><button class="show-name" data-action="show-details" aria-label="Détails du show ${esc(showInfo(game.show).name)}"><small>NIVEAU ${game.show+1} · ∞ ${icon('info')}</small><strong>${esc(showInfo(game.show).name)}</strong></button>${songCounter(game)}</div>`;}
function gameView(){if(animating&&cinematic)return resolutionView();if(showingVerdict())return verdictMarkup(game,me());if(mode==='multi'&&game.phase==='lobby')return lobbyView();const p=me();if(!p)return '<p>Connexion…</p>';return `${showHeader()}${meters()}${players()}${grid()}<div class="readout connection-readout" aria-live="polite">${animating?'Pige des tuiles…':mode==='multi'&&!connected?'<strong>RECONNEXION…</strong>':!p.last?'Prêt pour la première chanson':''}</div>`;}
function playAction(){if(finishedShow(game))return '<div class="action-slot"><button class="action-button primary" data-action="result">RETOUR AU VERDICT</button></div>';return `<div class="action-slot">${animating?'<button class="action-button primary" disabled>CHANSON EN COURS…</button>':game.phase==='show'||game.phase==='draft'?phaseAction():game.phase==='lobby'?'<button class="action-button primary" data-action="show-details">PRÉPARER LE SHOW</button>':game.phase==='reward'?'<button class="action-button primary" data-action="rewards">PASSER AU STUDIO</button>':'<button class="action-button primary" data-action="result">VOIR LE BILAN</button>'}</div>`;}
function showIntro(){
 if(animating)return;const dlg=$('#details'),show=showInfo(game.show),goal=targets(game);preloadShowCover(game.show);
 dlg.className='';dlg.dataset.kind='show';dlg.setAttribute('aria-label','Présentation du show '+show.name);
 const entry=mode==='multi'&&game.phase==='show'&&game.round===0;
 const action=entry?`<p class="entry-status" role="status">${game.players.map(p=>esc(p.name)+(p.ready?' : PRÊT':' : EN ATTENTE')).join(' · ')}</p><button class="action-button primary" data-action="ready" ${me().ready||busy||!connected?'disabled':''}>${me().ready?'EN ATTENTE DU PARTENAIRE…':'MONTER SUR SCÈNE'} ${icon('arrow')}</button>`:game.phase==='lobby'?phaseAction().replace('LANCER LA TOURNÉE','MONTER SUR SCÈNE'):'<button class="action-button primary" data-action="close">MONTER SUR SCÈNE '+icon('arrow')+'</button>';
 dlg.innerHTML=`<header class="show-intro-header"><span class="intro-brand">ENCORE!<small>PUNK MUSIC ROGUELITE</small></span><button class="dialog-close" data-action="close" aria-label="Fermer la présentation">${icon('close')}</button></header><div class="show-intro-heading"><span class="tape">SHOW ${String(game.show+1).padStart(2,'0')}</span><h2>${esc(show.name)}</h2><p>${esc(show.crowd)}</p></div><div class="show-intro-art"><img src="${showAsset(game.show,'cover')}" alt="${esc(show.name)} — salle avant le concert" fetchpriority="high" decoding="async" width="1536" height="1024"></div><section class="show-goals" aria-label="Objectifs du show"><h3>OBJECTIFS DU SHOW</h3><div class="show-goal-grid">${[['q','QUALITÉ','star'],['e','ÉNERGIE','bolt']].map(([key,label,ic])=>`<div class="show-goal goal-${key}">${icon(ic)}<span>${label}<b>${goal[key]}</b></span></div>`).join('')}</div></section><p class="show-entry-note">${show.rounds} CHANSONS</p><div class="show-entry">${action}</div>`;dlg.showModal();
}
function showResult(){if(animating)return;resultDismissed=false;view='game';render();}
function phaseAction(){const p=me();if(game.phase==='lobby')return `<div class="lobby"><h2>${game.players.length===2?'Le band est là.':'La balance est prête.'}</h2><p>${mode==='multi'?'Partage le lien avant de lancer la tournée.':'Une tournée infinie. Ton inventaire devient de plus en plus fort.'}</p>${mode==='multi'?'<button class="action-button secondary" data-action="invite">COPIER LE LIEN D’INVITATION</button>':''}${game.players[0].id===myId?`<button class="action-button primary" data-action="start" ${busy||mode==='multi'&&!connected?'disabled':''}>LANCER LA TOURNÉE ${icon('arrow')}</button>`:'<p>Le créateur lance la tournée.</p>'}</div>`;
 if(game.phase==='draft')return `<button class="action-button primary" data-action="draft" ${p.drafted||busy?'disabled':''}>${p.drafted?'TON PARTENAIRE CHOISIT…':'CONTINUER'} ${icon('arrow')}</button>`;
 if(game.phase==='show')return `<button class="action-button primary play" data-action="ready" ${busy||animating||p.ready||mode==='multi'&&!connected?'disabled':''}>${icon('bolt')}${p.ready?'TON PARTENAIRE SE PRÉPARE…':game.round?'JOUER LA CHANSON SUIVANTE':'MONTER SUR SCÈNE'}${icon('arrow')}</button>`;
 if(game.phase==='reward')return `<div class="result"><span class="tape">SHOW RÉUSSI</span><h2>La salle en redemande.</h2><p>+${p.showFans} fans de performance, en plus des fans gagnés par tes tuiles.</p><button class="action-button primary" data-action="rewards" ${animating||p.rewarded?'disabled':''}>${p.rewarded?'TON BAND CHOISIT ENCORE…':'PASSER AU STUDIO'} ${icon('arrow')}</button></div>`;
 return `<div class="result"><span class="tape">${game.phase==='won'?'TOURNÉE BOUCLÉE!':'FIN DE TOURNÉE'}</span><h2>${game.phase==='won'?p.fans+' fans':'Le band quitte la scène.'}</h2><p>${game.phase==='won'?'Les trois shows sont réussis.':'Il fallait atteindre les deux objectifs. '}</p><div class="tour-results">${game.history.map(h=>`<span>${h.won?'✓':'×'} ${showInfo(h.show).name} · ${points(h)}</span>`).join('')}</div><button class="action-button secondary" data-action="stats">BILAN DU BAND</button><button class="action-button primary" data-action="again">NOUVELLE TOURNÉE ${icon('repeat')}</button></div>`;}
function focusButton(t){const p=me();if(p.inventory.find(n=>n.id===t.id)?.exhausted)return '<p class="focus-unavailable">ÉPUISÉE · FOCUS INDISPONIBLE</p>';const focused=p.focusedIds.includes(t.id),locked=animating||busy||p.ready||!['lobby','show','draft','reward'].includes(game.phase);return `<button class="focus-toggle ${focused?'active':''}" data-action="focus" data-id="${esc(t.id)}" aria-pressed="${focused}" ${locked?'disabled':''}>${focused?'FOCUS ACTIF':'FOCUS +'}</button>`;}
function inventoryView(){return inventoryMarkup(me(),{
 locked:animating||busy||me().ready||!['lobby','show','draft','reward'].includes(game.phase),
 draft:game.phase==='draft'&&!me().drafted
});}
function draftView(){
 const p=me(),kind=p.songOffers.includes(draftSelection)?draftSelection:p.songOffers[0],locked=busy||mode==='multi'&&!connected;
 return `${showHeader()}${meters()}<section class="choice-screen song-reward-screen" aria-label="Choisir une tuile"><div class="tile-gallery reward-gallery" role="group" aria-label="Tuiles proposées">${p.songOffers.map(k=>tileCard({kind:k,level:0},{action:'select-song',attributes:`data-kind="${k}" aria-pressed="${k===kind}"`,classes:k===kind?'chosen':''})).join('')}</div><div class="choice-detail content-box" role="region" aria-label="Effet de la tuile" tabindex="0">${kind?tileDetails({kind,level:0}):''}</div><div class="choice-actions">${kind?`<button class="action-button primary" data-action="choose-song" data-kind="${kind}" ${locked?'disabled':''}>PRENDRE & JOUER →</button>`:''}<button class="action-button skip-reward" data-action="skip-song" ${locked?'disabled':''}>PASSER →</button></div></section>`;
}
function rewardsView(){return studioMarkup(game,me(),{category:rewardAction,selection:rewardSelection,locked:busy||mode==='multi'&&!connected});}
function fitBoard(){
 const body=$('.screen-body[data-screen="game"]'),board=body?.querySelector(':scope > .grid-wrap');if(!board)return;
 const css=getComputedStyle(body),gap=parseFloat(css.rowGap)||0,children=[...body.children].filter(el=>el!==board&&getComputedStyle(el).display!=='none'&&!['absolute','fixed'].includes(getComputedStyle(el).position));
 const used=children.reduce((n,el)=>{const c=getComputedStyle(el);return n+el.getBoundingClientRect().height+(parseFloat(c.marginTop)||0)+(parseFloat(c.marginBottom)||0);},0)+children.length*gap;
 const size=Math.max(0,Math.min(body.clientWidth-6,body.clientHeight-used-6));body.style.setProperty('--board-size',size+'px');
 const stage=body.querySelector('.show-visual'),tally=body.querySelector('.resolution-tally');
 if(stage&&tally){const bottom=body.closest('.console').getBoundingClientRect().bottom;stage.style.setProperty('--scene-height',Math.max(0,bottom-tally.getBoundingClientRect().bottom-6)+'px');body.closest('.console').style.setProperty('--deal-name-top',(tally.getBoundingClientRect().bottom-body.closest('.console').getBoundingClientRect().top+6)+'px');}
}
new ResizeObserver(()=>fitBoard()).observe(app);
window.addEventListener('resize',fitBoard);
document.fonts?.ready.then(fitBoard);
function render(){
 hideTooltip();syncAudio();maybeAutoReady();if(game)preloadShowCover(game.show);
 if(animating&&view==='game'&&$('.grid')){paintResolution();return;}
 if(view==='rewards'&&game?.phase!=='reward')view='game';
 if(view==='draft'&&(game?.phase!=='draft'||me()?.drafted))view='game';
 const oldBody=$('.screen-body'),scrolls=oldBody?.dataset.screen===view?[...oldBody.querySelectorAll('[data-scroll]')].map(el=>[el.dataset.scroll,el.scrollTop]):[];
 const oldDialog=$('#details');const modal=oldDialog?.open?{html:oldDialog.innerHTML,kind:oldDialog.dataset.kind,tileId:oldDialog.dataset.tileId,classes:oldDialog.className}:null;
 const collection=$('.collection');if(collection)inventoryScroll=collection.scrollTop;
 const focusedTile=document.activeElement?.dataset.action==='focus'?document.activeElement.dataset.id:null;
 mount(view==='settings'?settingsView():!game?home():view==='stats'?statsView():view==='inventory'?inventoryView():view==='rewards'?rewardsView():view==='draft'?draftView():gameView(),!!modal&&!animating&&['rules','inspect','focus','show'].includes(modal.kind));
 for(const [key,top] of scrolls){const el=app.querySelector(`[data-scroll="${key}"]`);if(el)el.scrollTop=top;}fitBoard();updateActivity();
 if(view==='inventory'){const list=$('.collection');if(list)list.scrollTop=inventoryScroll;if(focusedTile){const target=[...document.querySelectorAll('.collection .focus-toggle')].find(b=>b.dataset.id===focusedTile);target?.focus({preventScroll:true});}}
 if(modal&&!animating){const dlg=$('#details');if(modal.kind==='show'){if(game?.phase==='show'&&game.round===0||game?.phase==='lobby'){showIntro();return;}if(!animating){showIntro();return;}}if(modal.kind==='inspect'){const t=me()?.inventory.find(t=>t.id===modal.tileId)||me()?.board.find(t=>t?.id===modal.tileId);if(t){inspect(t);return;}}else if(['rules','focus','show'].includes(modal.kind)){dlg.innerHTML=modal.html;dlg.className=modal.classes;dlg.dataset.kind=modal.kind;dlg.showModal();return;}}
 if(game&&view==='game'&&!animating){
  if(mode==='multi'&&game.phase==='lobby'){intro=false;return;}
  if(intro){intro=false;if(game.phase==='lobby'||mode==='multi'&&game.phase==='show'&&game.round===0)showIntro();}
 }
}
function inspect(t){
 const empty=!t||t.kind==='empty',dlg=$('#details');dlg.dataset.kind='inspect';dlg.dataset.tileId=t?.id||'';dlg.className='tile-dialog';
 mountScreen(dlg,`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><div class="inspect-preview">${tileCard(t,{action:'noop',resolved:!!t?.m})}</div>${empty?'<h2>Case vide</h2><p>Complète la grille quand moins de 9 tuiles sont disponibles.</p>':tileDetails(t)}${t?.m?`<div class="detail-score"><strong>CETTE CHANSON</strong><span>${points(t)||'Effet de soutien'}</span>${t.m>1?`<b>×${t.m}</b>`:''}${t.repeats?'<b>Rejouée '+t.repeats+' fois</b>':''}</div>`:''}${!empty&&me()?.inventory.some(x=>x.id===t.id)?focusButton(t):''}<button class="action-button secondary" data-action="close">FERMER</button>`);
 dlg.showModal();
}
function rules(){const dlg=$('#details');dlg.dataset.kind='rules';dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><h2>Comment jouer</h2><ol><li>Le guitariste-chanteur commence avec 5 tuiles et 1 focus.</li><li>Chaque chanson pige jusqu’à 9 tuiles distinctes. Les cases restantes sont vides.</li><li>Les synergies touchent les quatre côtés, sauf les effets qui concernent toute la grille. Une guitare entre deux voix vaut ×4; les voix valent ×2.</li><li>Entre les chansons, observe le plateau, puis appuie sur Continuer pour choisir parmi 3 tuiles différentes. Tu peux obtenir une sorte déjà présente dans ton inventaire.</li><li>Dans l’inventaire, affecte ton focus à une copie pour doubler son poids de pige. Déplace-le librement avant de te déclarer prêt. Le focus temporaire expire à la fin du show.</li><li>Joue les 5 chansons et atteins les deux objectifs. Dépasse-les pour entrer en overdrive; le surplus contribue aux fans de performance.</li><li>Entre les shows, fais un choix dans chacune des catégories Ajouter, Améliorer et Retirer, ou passe la catégorie. Après les trois confirmations, pars en show. Les améliorations sont permanentes, sans plafond. Un objectif manqué termine la tournée. Une nouvelle tournée repart avec les cinq tuiles de départ. La tournée continue sans dernier niveau. En coop, les points s’additionnent; chacun choisit sa tuile et son focus.</li></ol><p>Épuisée : sortie du show. Désactivée : encore pigée, sans effet. Ces états et les charges se réinitialisent au prochain show.</p><button class="action-button primary" data-action="close">FERMER</button>`;dlg.showModal();}
function overdriveHit(level){
 resolutionAudio.overdrive(level);juice.overdrive(level);
 if(motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches){$('.console')?.classList.add('drive-impact');frames.push(setTimeout(()=>$('.console')?.classList.remove('drive-impact'),400));try{navigator.vibrate?.(level===2?[35,35,60]:30);}catch{}}
 if(sound){[0,2,4,6].forEach((n,i)=>frames.push(setTimeout(()=>beep(n),i*65)));}
}
function paintResolution(){
 if(!animating||!displayScore)return;
 const target=targets(game),level=overdriveLevel(displayScore,target),metersEl=$('.meters');
 if(metersEl)metersEl.dataset.overdrive=level;
 for(const key of ['q','e']){
  const el=$('[data-stat="'+key+'"]');if(!el)continue;
  const previous=Number(el.querySelector('.stat-value').textContent);
  if(previous<target[key]&&displayScore[key]>=target[key]&&motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches)el.animate([{boxShadow:'0 0 0 transparent'},{boxShadow:'0 0 22px #baff42',offset:.4},{boxShadow:'0 0 0 transparent'}],{duration:350});
  el.querySelector('.stat-value').textContent=displayScore[key];
  el.querySelector('.meter-track i').style.width=Math.min(100,displayScore[key]/target[key]*100)+'%';
  el.querySelector('.meter-track').setAttribute('aria-valuenow',Math.min(displayScore[key],target[key]));
  el.classList.toggle('overdrive',displayScore[key]>target[key]);
  el.querySelector('.overdrive-label').textContent=displayScore[key]>=target[key]?'ATTEINT':'OBJECTIF DU SHOW';
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
 juice.clear();cancelAnimationFrame(resolutionRaf);frames.forEach(clearTimeout);frames=[];resolutionAudio.stop();
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
  packet.style.cssText=`left:${x}px;top:${y}px;--dx:${dx}px;--dy:${dy}px;--flight-time:${g.impact-g.transfer}ms`;
  packet.innerHTML=`${icon(ic)}<b>+${g.total[key]}</b>`;layer.append(packet);
 }
}
function paintCinematic(frame,elapsed){
 const c=cinematic,g=frame.group,changed=c.mounted!==g.index;
 if(changed){
  c.group=g;c.mounted=g.index;c.overdriveAnnounced=false;animationPlayer=g.player;activeEvent=null;scoredIds=new Set();
  mount(gameView());
  const consoleEl=$('.console');consoleEl.style.setProperty('--stage-color',['#baff42','#ff5aae','#60e9ff','#ffba42'][g.index%4]);
 }
 const phaseKey=g.index+':'+frame.phase,eventKey=frame.event?g.index+':'+frame.event.index:null;
 const phaseChanged=c.phaseKey!==phaseKey,eventChanged=c.eventKey!==eventKey;c.phaseKey=phaseKey;
 $('.console').dataset.resolution=frame.phase;$('.console').style.setProperty('--beat-time',frame.beat+'ms');
 $('.console').style.setProperty('--reveal-opacity',frame.opacity);
 if(phaseChanged){
  if(frame.phase==='intro'){c.dealtCount=0;resolutionAudio.announce(g.player.name);$('.resolution-caption strong').textContent='FAIS DU BRUIT !';}
  if(frame.phase==='hold')$('.resolution-caption strong').textContent='ENVOIE LA SAUCE !';
  if(frame.phase==='transfer'){resolutionAudio.transfer();transferPackets(g);$('.resolution-caption strong').textContent='POUR LE BAND !';}
  if(frame.phase==='impact'){resolutionAudio.boom();juice.impact(g.total);const verdict=scoreCallout(g.total);if(verdict&&!c.overdriveAnnounced)resolutionAudio.verdict(verdict.text);$('.resolution-caption strong').textContent='POINTS AJOUTÉS AU SHOW';}
 }
 if(eventKey!==c.eventKey){c.eventKey=eventKey;if(frame.event){resolutionAudio.hit(frame.event.index);juice.hit(frame.event,frame.beat);const praise=scoreCallout(frame.event);if(praise){resolutionAudio.critical(praise.rank);songEffects.burst();}$('.resolution-caption strong').textContent=TILES[frame.event.kind].name;}}
 const dealt=paintDeal(app,g.player.board,elapsed-g.start,g.intro,cinematic.plan.reduced);
 if(frame.phase==='intro'&&dealt>(c.dealtCount||0)&&!cinematic.plan.reduced)resolutionAudio.deal();
 c.dealtCount=dealt;
 activeEvent=frame.event;
 for(const event of g.events.slice(0,frame.completed))scoredIds.add(g.player.id+':'+event.index);
 if(frame.event&&frame.progress>=1)scoredIds.add(g.player.id+':'+frame.event.index);
 const oldLevel=overdriveLevel(displayScore,targets(game));displayScore=frame.score;paintResolution();
 if(overdriveLevel(displayScore,targets(game))>oldLevel){c.overdriveAnnounced=true;overdriveHit(overdriveLevel(displayScore,targets(game)));}
 for(const key of ['q','e']){
  const el=$(`[data-charge="${key}"]`),num=el.querySelector('b');
  const ticking=num.textContent!==String(frame.local[key]);if(ticking)num.textContent=frame.local[key];el.classList.toggle('counter-tick',ticking);
  el.querySelector('i').style.width=(g.total[key]?frame.local[key]/g.total[key]*100:0)+'%';
 }
 const fans=$('.resolution-fans');fans.innerHTML=frame.local.f?icon('choir')+' +'+frame.local.f+' FANS':'';
 const value=frame.local.q+frame.local.e+frame.local.f;
 if(value!==c.lastValue&&frame.phase==='charge'&&performance.now()-c.lastTick>65){resolutionAudio.tick(value);c.lastTick=performance.now();}
 c.lastValue=value;syncShowVisual(frame);
 if(changed||phaseChanged||eventChanged||oldLevel!==overdriveLevel(displayScore,targets(game)))fitBoard();
}
function animate(previous){
 stopResolution();
 const reduced=!motion||matchMedia('(prefers-reduced-motion: reduce)').matches,plan=resolutionPlan(game.players,previous,reduced);
 if(!plan.groups.length){render();return;}
 animating=true;displayScore={q:previous.q,e:previous.e};view='game';
 cinematic={plan,group:plan.groups[0],mounted:-1,phaseKey:null,eventKey:null,lastValue:0,lastTick:0};
 document.body.classList.add('resolving');updateActivity();
 animationPlayer=plan.groups[0].player;mount(gameView());syncAudio();
 $('.resolution-caption strong').textContent='SONG '+game.round;
 resolutionAudio.song(game.round,lastSong(game));
 const prelude=1200,started=performance.now();
 function tick(now){
  if(!animating)return;
  if(now-started<prelude){paintDeal(app,animationPlayer.board,-1,plan.groups[0].intro,reduced);resolutionRaf=requestAnimationFrame(tick);return;}
  const frame=resolutionFrame(plan,now-started-prelude);
  if(frame.done){
   const current=cinematic,finish=()=>{if(cinematic!==current||!animating)return;stopResolution();render();$('.show-verdict h1')?.focus({preventScroll:true});};
   if(finishedShow(game)&&!reduced){const fade=$('.grid-wrap')?.animate([{opacity:1},{opacity:0}],{duration:180,fill:'forwards'});if(fade)fade.finished.catch(()=>{}).then(finish);else finish();}else finish();return;
  }
  paintCinematic(frame,now-started-prelude);resolutionRaf=requestAnimationFrame(tick);
 }
 tick(started);
}
function accept(g){const previous=game;game=normalizeGame(g);const oldStudio=previous?.players.find(p=>p.id===myId)?.studio,newStudio=me()?.studio,confirmed=['add','upgrade','remove'].some(k=>!oldStudio?.[k]&&newStudio?.[k]);if(confirmed){rewardAction=['add','upgrade','remove'].find(k=>!newStudio[k])||rewardAction;rewardSelection=studioSelections[rewardAction]||null;}advance.observe(previous,game,myId);if(mode==='multi'&&game.phase==='show'&&game.round===0)advance.clear();busy=false;if(mode==='solo')save('encore.solo',{game,myId});if(previous&&(g.show!==previous.show||previous.phase==='lobby'&&g.phase==='show')){intro=true;resultDismissed=false;}if(previous&&g.round>previous.round&&g.show===previous.show){resultDismissed=false;animate(previous);}else render();if(confirmed&&view==='rewards')studioConfirmation(app,!motion||matchMedia('(prefers-reduced-motion: reduce)').matches);maybeAutoReady();}
function receive(data){
 if(mode!=='multi')return;
 const changed=JSON.stringify(online)!==JSON.stringify(data.online)||JSON.stringify(activities)!==JSON.stringify(data.activities||{})||!connected;activities=data.activities||{};
 myId=data.id;online=data.online;connected=true;
 if(data.game&&(!game||data.game.revision>game.revision)){const pending=busy;accept(data.game);busy=pending;}
 else if(changed)render();
}
async function send(type,extra={}){
 if(busy||animating||!game)return false;
 const msg={type,revision:game.revision,show:game.show,round:game.round,...extra};
 if(mode==='solo'){try{accept(command(game,myId,msg,rnd()));return true;}catch(e){toast(e.message);return false;}}
 if(!connection||!connected){toast('Connexion en cours. Ta partie est conservée.');return;}
 busy=true;render();const current=connection;
 try{const data=await current.send(msg);if(current!==connection)return false;receive(data);return true;}
 catch(e){if(current===connection)toast(e.message);return false;}
 finally{if(current===connection){busy=false;render();current.sync();}}
}
function getName(){name=$('#name')?.value.trim()||name||'Sans nom';save('encore.name',name);return name;}
function clearNetwork(){advance.clear();lastActivity=null;activities={};stopResolution();generation++;connection?.close();connection=null;connected=false;busy=false;}
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
app.addEventListener('input',e=>{if(e.target.dataset.mix){resolutionAudio.setLevels({[e.target.dataset.mix]:Number(e.target.value)/100});save('encore.mix.v2',resolutionAudio.levels);return;}if(e.target.id==='name'){name=e.target.value;save('encore.name',name);}if(e.target.id==='code')invite=e.target.value;});
installTooltips(app,()=>animating);
app.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;if(a==='noop')return;
 if(['choose-add','choose-upgrade','choose-remove','skip-reward'].includes(a)){const now=performance.now();if(now-studioLastConfirm<400)return;studioLastConfirm=now;}
 if(a==='sound'){sound=!sound;save('encore.sound',sound);if(sound){resolutionAudio.unlock();beep();if(animating)resolutionAudio.announce(animationPlayer.name);}else resolutionAudio.suspend();const control=$('.live-sound');if(control){control.setAttribute('aria-pressed',sound);control.setAttribute('aria-label',sound?'Couper le son':'Activer le son');control.innerHTML=icon('sound')+' '+(sound?'SON':'MUET');}if(!animating)render();return;}
 resolutionAudio.unlock();
 if(animating)return;
 resolutionAudio.ui(a);
 if(a==='profile'){profile(b.dataset.id);return;}
 if(a==='stats'){$('#details')?.close();statsPlayer='band';view='stats';render();return;}
 if(a==='stats-player'){statsPlayer=b.dataset.id;render();return;}
 if(a==='stats-range'){statsRange=b.dataset.range;render();return;}
 if(a==='stats-mode'){statsMode=b.dataset.mode;render();return;}
 if(a==='finish-tour'){statsPlayer='band';statsRange='all';view='stats';render();return;}
 if(a==='focus-help'){const dlg=$('#details');dlg.dataset.kind='focus';dlg.innerHTML=`<button class="dialog-close" data-action="close" aria-label="Fermer">${icon('close')}</button><h2>FOCUS : PIGE ×2</h2><p>Double le <strong>poids de pige</strong> d’une copie. Avec <strong>9 tuiles disponibles ou moins</strong>, elles sont toutes pigées.</p><p>Le focus se déplace librement avant de te déclarer prêt. Le bonus temporaire expire à la fin du show.</p><button class="action-button secondary" data-action="close">COMPRIS</button>`;dlg.showModal();}
 if(a==='focus'){await send('focus',{tileId:b.dataset.id});}
 if(a==='draft'&&game.phase==='draft'&&!me().drafted){view='draft';render();}
 if(a==='inspect-offer')inspect({kind:b.dataset.kind});
 if(a==='select-song'){draftSelection=b.dataset.kind;render();const detail=$('.choice-detail');if(detail)detail.scrollTop=0;}
 if(a==='select-reward'){rewardSelection=b.dataset.id;studioSelections[rewardAction]=rewardSelection;render();const detail=$('.choice-detail');if(detail)detail.scrollTop=0;}
 if(a==='choose-song'){await send('draft',{kind:b.dataset.kind});}
 if(a==='skip-song'){await send('draft',{action:'skip'});}
 if(a==='skip-reward'){await send('reward',{action:'skip',category:rewardAction});}
 if(a==='result-detail'){resultDismissed=true;view='game';render();return;}
 if(a==='nav'){view=b.dataset.view;if(view==='stats')statsPlayer='band';render();} if(a==='settings'){view='settings';render();} if(a==='motion'){motion=!motion;save('encore.motion',motion);render();} if(a==='show-details')showIntro(); if(a==='result')showResult(); if(a==='dismiss-result')$('#details').close();
 if(a==='rules')rules();if(a==='close')$('#details').close();
 if(a==='solo')solo();if(a==='resume'){intro=false;resultDismissed=false;const s=read('encore.solo');if([1,2].includes(s?.game?.version)){clearNetwork();mode='solo';myId=s.myId;game=normalizeGame(s.game);view='game';render();}else toast('Sauvegarde incompatible. Lance une nouvelle tournée.');}
 if(a==='start'||a==='ready'){if($('#details').open&&!(a==='ready'&&mode==='multi'&&game.round===0))$('#details').close();send(a);}
 if(a==='inventory'){if($('#details').open)$('#details').close();view='inventory';render();}
 if(a==='studio-bilan'){studioReturn=true;statsPlayer='band';statsRange='show';view='stats';render();}
 if(a==='back'){view=studioReturn&&game?.phase==='reward'?'rewards':'game';studioReturn=false;render();}
 if(a==='rewards'&&game?.phase==='reward'){view='rewards';rewardAction=['add','upgrade','remove'].find(k=>!me().studio?.[k])||rewardAction;rewardSelection=studioSelections[rewardAction]||null;render();}
 if(a==='reward-tab'){rewardAction=b.dataset.kind;rewardSelection=studioSelections[rewardAction]||null;render();}
 if(a==='choose-add')send('reward',{action:'add',kind:b.dataset.kind});
 if(a==='choose-upgrade')send('reward',{action:'upgrade',tileId:b.dataset.id});
 if(a==='choose-remove')send('reward',{action:'remove',tileId:b.dataset.id});
 if(a==='studio-depart')send('studio-depart');
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
 try{const r=await fetch(endpoint+'/health',{signal:AbortSignal.timeout(12000)});const d=await r.json();networkReady=!!(r.ok&&d.ok&&d.protocol===2&&d.rules===5);}
 catch{networkReady=false;}
 finally{checkingServer=false;networkState=networkReady?'online':'offline';if(!game)render();}
 if(!networkReady)healthTimer=setTimeout(checkServer,15000);
}
checkServer();
window.addEventListener('online',()=>{if(connection)connection.sync();else if(!networkReady)checkServer();});
window.addEventListener('offline',()=>{if(connection){connected=false;render();}});
window.addEventListener('visibilitychange',()=>{if(document.hidden){resolutionAudio.suspend();}else{if(animating){stopResolution();render();}syncAudio();maybeAutoReady();connection?.sync();}});
window.addEventListener('pagehide',()=>{stopResolution();resolutionAudio.suspend();});
window.addEventListener('pageshow',e=>{if(e.persisted)render();});
