import {showInfo,targets} from './engine.js';
import {icon} from './icons.js?v=0.10.4';
import {showVisualMarkup} from './show-art.js?v=0.10.4';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const finishedShow=g=>!!g&&['reward','lost','won'].includes(g.phase);
export const lastSong=g=>!!g&&g.round===showInfo(g.show).rounds;
export function songCounter(g){const n=showInfo(g.show).rounds;return `<div class="round song-counter ${lastSong(g)?'song-final':''}" data-song="${g.show}:${g.round}" aria-label="${lastSong(g)?'Dernière chanson. ':''}Chanson ${g.round} sur ${n}">CHANSON <b>${g.round}</b><span>/ ${n}</span></div>`;}
export const songDecor=()=>'<div class="song-decor" aria-hidden="true"><i class="splat splat-a"></i><i class="splat splat-b"></i><i class="splat splat-c"></i><i class="splat splat-d"></i></div>';
export function verdictMarkup(g,p){
 const won=g.phase!=='lost',goal=targets(g),show=showInfo(g.show),fans=g.players.reduce((n,p)=>n+p.fans,0);
 return `<section class="show-verdict ${won?'verdict-won':'verdict-lost'}" aria-label="Résultat du show"><header><small>SHOW TERMINÉ</small><h1 tabindex="-1">${won?'SHOW RÉUSSI !':'SHOW RATÉ'}${won?'':'<span>FIN DE TOURNÉE</span>'}</h1><h2>${esc(show.name)}</h2></header>${showVisualMarkup()}<div class="verdict-goals">${[['q','QUALITÉ','star'],['e','ÉNERGIE','bolt']].map(([k,label,ic])=>{const met=g[k]>=goal[k],missing=Math.max(0,goal[k]-g[k]);return `<section class="verdict-goal ${met?'goal-met':'goal-missed'}" aria-label="${label} : ${g[k]} sur ${goal[k]}, ${met?'atteint':'il manquait '+missing}"><span>${label}</span><div>${icon(ic)}<b>${g[k]}<small> / ${goal[k]}</small></b></div><progress max="${goal[k]}" value="${Math.min(g[k],goal[k])}"></progress><strong>${met?'✓ ATTEINT':'✕ IL MANQUAIT '+missing}</strong></section>`;}).join('')}</div><p class="verdict-message">${won?'Les deux objectifs sont atteints.':'La tournée s’arrête ici.'}</p><div class="verdict-summary"><span>${icon('choir')}${fans} FANS DU BAND</span><span>DERNIÈRE CHANSON ${icon('star')} ${p.last?.q||0} ${icon('bolt')} ${p.last?.e||0}</span></div><button class="action-button primary" data-action="${g.phase==='reward'?'rewards':'stats'}">${g.phase==='reward'?'PASSER AU STUDIO':'VOIR LE BILAN'} ${icon('arrow')}</button><button class="action-button text-button verdict-detail" data-action="result-detail">Voir le détail</button></section>`;
}
export class SongEffects{
 constructor(root,reduced){this.root=root;this.reduced=reduced;this.song=null;this.lastBurst=-Infinity;}
 sync(g){if(!g){this.song=null;return;}const key=g.show+':'+g.round;if(this.song===key)return;this.song=key;if(this.reduced()||!g.round)return;}
 burst(){
  const now=performance.now();if(this.reduced()||now-this.lastBurst<500)return;this.lastBurst=now;
  const decor=this.root.querySelector('.song-decor');if(!decor)return;
  for(const side of ['left','right']){
   if(decor.querySelectorAll('.frame-comic').length>=2)break;
   const el=document.createElement('i');el.className='frame-comic comic-'+side;decor.append(el);
   el.animate([{opacity:0,transform:'scale(.8)'},{opacity:.85,transform:'scale(1)',offset:.3},{opacity:0,transform:'scale(1.12)'}],{duration:350}).finished.catch(()=>{}).then(()=>el.remove());
  }
 }
}
