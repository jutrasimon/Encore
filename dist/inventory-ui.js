import {TILES,focusCapacity} from './engine.js';
import {sticker} from './art.js';
import {icon} from './icons.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const family=kind=>TILES[kind].family==='guitar'?'quality':TILES[kind].family==='voice'?'energy':kind==='duck'?'fans':'utility';
const ref=(symbol,label,color='utility')=>`<span class="effect-ref ref-${color}" role="img" aria-label="${label}" title="${label}">${icon(symbol)}</span>`;
const guitar=()=>ref('guitar','Guitare','quality');
const voice=()=>ref('mic','Voix','energy');

export function inventoryEffect(t){
 const level=t.level||0;
 const effects={
  guitar:[`+${1+level}`,'star','QUALITÉ',`<b>×2</b> / ${voice()} <strong>voisine</strong>`,'quality'],
  voice:[`+${1+level}`,'bolt','ÉNERGIE',`<b>×2</b> / ${guitar()} <strong>voisine</strong>`,'energy'],
  pick:['+1','star','QUALITÉ',`→ ${guitar()} <strong>voisines</strong>`,'quality'],
  boot:['+1','bolt','ÉNERGIE',`/ ${guitar()} ${voice()} <strong>voisine</strong>`,'energy'],
  lighter:[`+${1+level}`,'bolt','ÉNERGIE',`<b>+1</b> / ${ref('flame','Autre briquet','energy')}`,'energy'],
  duck:['+1','choir','FAN',`/ <strong>type voisin</strong>`,'fans'],
  smoke:['+2','bolt','ÉNERGIE',`/ <strong>vide ou inactive</strong>`,'energy'],
  cup:['+2','charge','CHARGES',`→ <strong>voisines</strong>`,'utility','1 USAGE'],
  refrain:['+1','charge','CHARGE',`${ref('charge','Charges')} = ${ref('bolt','Énergie','energy')}`,'energy'],
  choir:['+1','bolt','ÉNERGIE',`/ ${voice()} <strong>sur la grille</strong>`,'energy'],
  last:[`${6+level}`,'bolt','AU FINAL',`<strong>Sinon ${1+level}</strong> ${ref('bolt','Énergie','energy')}`,'energy'],
  solo:[`${6+level}`,'star','SI UNIQUE',`<strong>Sinon ${2+level}</strong> ${ref('star','Qualité','quality')}`,'quality'],
  note:[`${12+level}`,'star','QUALITÉ',`<b>3</b> ${ref('charge','Charges')} <strong>requises</strong>`,'quality'],
  pedal:['×2','star','PRODUCTION',`→ ${guitar()} <strong>voisines</strong>`,'quality','1 USAGE'],
  encore:['×1','repeat','REJOUE',`→ ${guitar()} <strong>voisines</strong>`,'quality','1 USAGE'],
  kamikaze:[`${8+level}`,'star','QUALITÉ',`<b>×2</b> / ${voice()} <strong>voisine</strong>`,'quality','1 USAGE'],
  amp:[`${8+level}`,'bolt','ÉNERGIE',`<strong>Puis hors service</strong>`,'energy'],
  feedback:['+3','bolt','ÉNERGIE',`/ <strong>voisine inactive</strong>`,'energy']
 };
 const [value,symbol,label,synergy,color,limit]=effects[t.kind];
 return `<span class="card-effect"><span class="effect-hit hit-${color}"><b>${value}</b>${icon(symbol)}<strong>${label}</strong></span><span class="effect-synergy">${synergy}</span>${limit?`<span class="effect-limit">${limit}</span>`:''}</span>`;
}

export function inventoryMarkup(p,{locked=false,draft=false}={}){
 return `<section class="inventory-screen"><div class="section-title"><h1>Inventaire</h1><b>${p.inventory.length} TUILES</b></div><div class="focus-summary"><strong>FOCUS <b>${p.focusedIds.length}/${focusCapacity(p)}</b></strong><span class="focus-rule">PIGE <b>×2</b></span>${p.focusTemporary?`<span class="temp-focus">+${p.focusTemporary} ce show</span>`:''}<button class="focus-info" data-action="focus-help" aria-label="Comment fonctionne le focus ?">?</button></div><div class="inventory-list collection" tabindex="0" role="region" aria-label="Toutes tes tuiles, inventaire défilant">${p.inventory.map((t,i)=>{
 const focused=p.focusedIds.includes(t.id);
 const name=t.kind==='guitar'?'Six-cordes':t.kind==='voice'?'Micro':TILES[t.kind].name;
 return `<article class="inventory-item type-${family(t.kind)} ${t.exhausted?'exhausted':''} ${focused?'focused':''}"><button class="inspect-card" data-action="inspect-inventory" data-index="${i}" aria-label="${esc(TILES[t.kind].name+'. '+TILES[t.kind].text+' Toucher pour les détails.')}" title="${esc(TILES[t.kind].text)}"><span class="card-heading"><span class="item-icon">${sticker(t.kind)}</span><strong>${esc(name)}</strong>${t.level?`<span class="card-level">+${t.level}</span>`:''}</span>${inventoryEffect(t)}</button>${t.exhausted||t.inactive||t.charges?`<small class="card-state">${t.exhausted?'ÉPUISÉE':t.inactive?'INACTIVE':t.charges+' CHARGES'}</small>`:''}<button class="focus-toggle ${focused?'active':''}" data-action="focus" data-id="${esc(t.id)}" aria-label="${focused?'Retirer le focus de':'Mettre le focus sur'} ${esc(TILES[t.kind].name)}" aria-pressed="${focused}" ${locked?'disabled':''}>${focused?'✓ FOCUS':'FOCUS +'}</button></article>`;
 }).join('')}</div>${draft?'<button class="primary" data-action="draft">CHOISIR UNE TUILE</button>':''}</section>`;
}
