import {getLanguage,translate} from './i18n.js?v=0.10.5';
import {TILES,upgradeStat} from './engine.js?v=0.10.5';
import {sticker,FAMILY_ART} from './art.js?v=0.10.5';
import {icon} from './icons.js?v=0.10.5';
const shortNames={guitar:'Six-cordes',voice:'Micro cabossé',pick:'Médiator',boot:'Botte de tempo',lighter:'Briquet',duck:'Canard',smoke:'Fumée',cup:'Gobelet',refrain:'Refrain',choir:'Chorale',last:'Une dernière!',solo:'Solo',note:'Note tenue',pedal:'Bouton interdit',encore:'Encore!',kamikaze:'Kamikaze',amp:'Ampli à boutte',feedback:'Larsen'};
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const tileFamily=t=>FAMILY_ART[TILES[t?.kind]?.family||'utility'];
export const tileColor=t=>t?.kind==='duck'?'fans':tileFamily(t).color;
export function familyReference(family,label){const f=FAMILY_ART[family];return `<span class="tile-reference type-${f.color}">${sticker(f.kind)}<strong>${label||f.label}</strong></span>`;}
function richText(text){
 return esc(translate(text)).replace(/\b(Guitares?|Voix|Guitars?|Vocals?)\b/g,m=>familyReference(m.startsWith('Guitar')?'guitar':'voice',m.toUpperCase()))
  .replace(/(\d+ (qualité|énergie|quality|energy|fans?))/g,(m,all,stat)=>icon(['qualité','quality'].includes(stat)?'star':['énergie','energy'].includes(stat)?'bolt':'choir')+all)
  .replace(/(×2|\+\d+|\b\d+ (?:qualité|énergie|charges?|fans?)\b)/g,'<strong>$1</strong>');
}
export function tileSummary(t){
 const d=TILES[t.kind],l=t.level||0;
 if(t.inactive)return 'INACTIVE';
 if(d.charge)return t.charges?`${t.charges} CHARGES`:'+1 CHARGE';
 if(d.summary){
  const values={perc_kick:icon('bolt')+'+1',perc_snare:icon('star')+'+1',perc_hihat:icon('star')+'+1 '+icon('bolt')+'+1',perc_floor_tom:icon('star')+'2+',perc_ride:icon('bolt')+'2+',perc_crash:icon('star')+'2 '+icon('bolt')+'2+',perc_metronome:'+1 CHARGE',perc_double_pedal:icon('bolt')+'×2',perc_rimshot:icon('star')+'×2',perc_fill:'REJOUE ×1',perc_riff_bridge:icon('star')+'1+',perc_voice_bridge:icon('bolt')+'1+',perc_brushes:icon('star')+'1+',perc_silence:icon('bolt')+'1+',perc_patch:icon('star')+'+1 '+icon('bolt')+'+1',perc_backstage:icon('choir')+'+1'};
  const scope={row:'RANGÉE',column:'COLONNE',cross:'ALIGNÉES'}[d.scope]||'';
  return `<span class="percussion-summary"><span>${values[t.kind]||'EFFET'}</span><small>${translate(scope)}</small></span>`;
 }
 if(t.kind==='solo')return `${icon('star')} ${2+l} / ${6+l}`;
 if(t.kind==='last')return `${icon('bolt')} ${1+l} / ${6+l}`;
 if(t.kind==='lighter')return `${icon('bolt')} ${1+l}+`;
 if(d.q)return `${icon('star')} ${d.q+l}`;
 if(d.e)return `${icon('bolt')} ${d.e+l}`;
 return ({pick:'GUITARES +1',boot:'+1 / VOISIN',duck:'+1 / SORTE',smoke:'VIDES +2',cup:'CHARGES +2',choir:'+1 / VOIX',pedal:'GUITARES ×2',encore:'REJOUE ×1',feedback:'ESPACES +3'})[t.kind]||'EFFET';
}
export const tileMultiplier=t=>t.mq||t.me?[['mq','star'],['me','bolt']].filter(([key])=>t[key]>1).map(([key,stat])=>icon(stat)+'×'+t[key]).join(' '):'×'+t.m;
export function tileProduction(t,includeZeros=false){
 return [['q','star'],['e','bolt'],['f','choir']].filter(([k])=>includeZeros||t[k]).map(([k,i])=>`<span>${icon(i)}${(t[k]||0)*(1+(t.repeats||0))}</span>`).join('')||'<span>0</span>';
}
export function tileCard(t,{action='tile',index,attributes='',classes='',focused=false,resolved=false,settled=false}={}){
 const empty=!t||t.kind==='empty',d=empty?null:TILES[t.kind],f=empty?null:tileFamily(t);
 const total=((t?.q||0)+(t?.e||0)+(t?.f||0))*(1+(t?.repeats||0));
 const dominant=(t?.q||0)>(t?.e||0)?'quality':(t?.f||0)>(t?.e||0)?'fans':'energy';
 const production=settled&&!empty?`<span class="tile-total-value ${total?'total-'+dominant:'total-zero'}">${total}</span>`:resolved&&!empty?tileProduction(t):'';
 return `<button class="tile square-tile type-${tileColor(t)} ${empty?'empty':''} ${t?.kind?.startsWith('perc_')?'drummer-tile':''} ${t?.inactive?'inactive':''} ${t?.exhausted?'exhausted':''} ${focused?'focused':''} ${classes}" data-action="${action}" ${resolved?'data-resolved="true"':''} ${empty?'':`data-tile="${esc(JSON.stringify(t))}"`} ${index===undefined?'':`data-index="${index}"`} ${attributes} aria-label="${empty?'Case vide':esc(d.name+' · '+f.label+'. '+d.text)}" ${index===undefined?'':`style="--i:${index}"`}>
 ${empty?'<span class="empty-mark">−</span>':`<span class="tile-family">${f.label}</span>${sticker(t.kind)}<span class="tile-name">${esc(shortNames[t.kind]||d.name)}</span><span class="tile-points">${production||tileSummary(t)}</span>${t.level?`<span class="level">+${t.level}</span>`:''}${t.m>1?`<span class="mult">${tileMultiplier(t)}</span>`:''}${focused?'<span class="focus-badge">'+icon('focus')+'</span>':''}${t.exhausted?'<span class="tile-state">ÉPUISÉE</span>':t.inactive?'<span class="tile-state">INACTIVE</span>':''}`}
 </button>`;
}
export function tileDetails(t,{upgrade=false,resolved=false}={}){
 const d=TILES[t.kind],f=tileFamily(t),level=t.level||0,stat={q:'qualité',e:'énergie',f:'fan'}[upgradeStat(d)];
 const rule=t.kind==='lighter'?'1 énergie de base. '+d.text:d.text;
 const related=d.family==='guitar'?'voice':d.family==='voice'?'guitar':null;
 return `<section class="tile-explanation type-${tileColor(t)}"><div class="explanation-heading"><strong>${esc(d.name)}</strong><span>${f.label}${level?' · NIVEAU +'+level:''}</span></div>
 ${resolved?`<div class="tile-result"><strong>CETTE CHANSON</strong><div class="tile-result-values">${tileProduction(t,true)}</div>${t.m>1?`<span>${tileMultiplier(t)}</span>`:''}${t.repeats?`<p>Rejouée ${t.repeats} fois</p>`:''}</div>`:''}
 ${d.family==='voice'?'<p class="family-explainer">Cette tuile est une <strong>VOIX</strong>. Les micros comptent comme des voix.</p>':d.family==='guitar'?'<p class="family-explainer">Cette tuile est une <strong>GUITARE</strong>.</p>':''}
 <p class="tile-rule">${richText(related?rule.replace(', ×2','. ×2').replace(/(?:Voix : )?×2 par (Voix|Guitare) adjacente[.,]?/,'').replace(/,\s*\./g,'.'):rule)}</p>
 ${related?`<p class="tile-rule family-rule">${familyReference(d.family)} <strong>×2</strong> ${getLanguage()==='en'?'per adjacent':'par'} ${familyReference(related)} ${getLanguage()==='en'?'':'<strong>voisine</strong>'}.</p>`:''}
 ${level?`<p class="tile-rule upgrade-current"><strong>${icon(stat==='qualité'?'star':stat==='fan'?'choir':'bolt')}+${level} ${stat}</strong> de niveau, avant les multiplicateurs.</p>`:''}
 ${d.charge?`<p class="tile-rule"><strong>${t.charges||0} charge${t.charges===1?'':'s'}</strong> actuellement. Les charges restent jusqu’à la fin du show.</p>`:''}
 ${upgrade?`<p class="upgrade-preview">NIVEAU +${level} → <strong>+${level+1}</strong><br><strong>${icon(stat==='qualité'?'star':stat==='fan'?'choir':'bolt')}+1 ${stat}</strong> par apparition, avant les multiplicateurs.</p>`:''}
 ${t.exhausted?'<p class="state-explainer">Épuisée : revient au prochain show. Aucun focus possible.</p>':t.inactive?'<p class="state-explainer">Inactive : peut encore être pigée, mais ne produit rien.</p>':''}
 <small class="adjacency-help">${d.scope?'Rangée = horizontale. Colonne = verticale. Alignée = même rangée ou colonne, sans diagonale. Les espaces ne bloquent pas la portée.':'Voisine = en haut, en bas, à gauche ou à droite. Jamais en diagonale.'}</small></section>`;
}
