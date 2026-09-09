import {focusCapacity} from './engine.js?v=0.7.1';
import {tileCard,esc} from './tile-ui.js?v=0.7.1';
export {tileDetails as inventoryEffect} from './tile-ui.js?v=0.7.1';
export function orderedInventory(inventory){return inventory.map((t,i)=>({t,i})).sort((a,b)=>Number(!!a.t.exhausted)-Number(!!b.t.exhausted));}
export function inventoryMarkup(p,{locked=false,draft=false}={}){
 return `<section class="inventory-screen"><div class="section-title"><h1>Inventaire</h1><b>${p.inventory.length} TUILES</b></div><div class="focus-summary"><strong>FOCUS <b>${p.focusedIds.length}/${focusCapacity(p)}</b></strong><span class="focus-rule">PIGE <b>×2</b></span><button class="focus-info" data-action="focus-help" aria-label="Comment fonctionne le focus ?">?</button></div><p class="screen-help">Touche une tuile pour lire son <strong>effet complet</strong>.</p><div class="inventory-list collection tile-gallery" role="region" aria-label="Toutes tes tuiles, inventaire défilant">${orderedInventory(p.inventory).map(({t,i})=>{
 const focused=!t.exhausted&&p.focusedIds.includes(t.id);
 return `<article class="tile-slot ${t.exhausted?'exhausted':''}">${tileCard(t,{action:'inspect-inventory',index:i,focused})}${t.exhausted?'<span class="focus-unavailable">ÉPUISÉE</span>':`<button class="focus-toggle ${focused?'active':''}" data-action="focus" data-id="${esc(t.id)}" aria-pressed="${focused}" ${locked?'disabled':''}>${focused?'✓ FOCUS':'FOCUS +'}</button>`}</article>`;
 }).join('')}</div>${draft?'<button class="primary" data-action="draft">CONTINUER</button>':''}</section>`;
}
