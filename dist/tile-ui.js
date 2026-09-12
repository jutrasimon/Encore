import {getLanguage,translate} from './i18n.js?v=0.9.23';
import {TILES} from './engine.js?v=0.9.18';
import {sticker,FAMILY_ART} from './art.js?v=0.8.2';
import {icon} from './icons.js?v=0.9.18';
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
 if(t.kind==='solo')return `${icon('star')} ${2+l} / ${6+l}`;
 if(t.kind==='last')return `${icon('bolt')} ${1+l} / ${6+l}`;
 if(t.kind==='lighter')return `${icon('bolt')} ${1+l}+`;
 if(d.q)return `${icon('star')} ${d.q+l}`;
 if(d.e)return `${icon('bolt')} ${d.e+l}`;
 return ({pick:'GUITARES +1',boot:'+1 / VOISIN',duck:'+1 / SORTE',smoke:'VIDES +2',cup:'CHARGES +2',choir:'+1 / VOIX',pedal:'GUITARES ×2',encore:'REJOUE ×1',feedback:'+3 / INACTIF'})[t.kind]||'EFFET';
}
export function tileCard(t,{action='tile',index,attributes='',classes='',focused=false,resolved=false}={}){
 const empty=!t||t.kind==='empty',d=empty?null:TILES[t.kind],f=empty?null:tileFamily(t);
 const production=resolved&&!empty?[['q','star'],['e','bolt'],['f','choir']].filter(([k])=>t[k]).map(([k,i])=>`<span>${icon(i)}${t[k]*(1+(t.repeats||0))}</span>`).join(''):'';
 return `<button class="tile square-tile type-${tileColor(t)} ${empty?'empty':''} ${t?.inactive?'inactive':''} ${t?.exhausted?'exhausted':''} ${focused?'focused':''} ${classes}" data-action="${action}" ${empty?'':`data-tile="${esc(JSON.stringify(t))}"`} ${index===undefined?'':`data-index="${index}"`} ${attributes} aria-label="${empty?'Case vide':esc(d.name+' · '+f.label+'. '+d.text)}" ${index===undefined?'':`style="--i:${index}"`}>
 ${empty?'<span class="empty-mark">−</span>':`<span class="tile-family">${f.label}</span>${sticker(t.kind)}<span class="tile-name">${esc(shortNames[t.kind]||d.name)}</span><span class="tile-points">${production||tileSummary(t)}</span>${t.level?`<span class="level">+${t.level}</span>`:''}${t.m>1?`<span class="mult">×${t.m}</span>`:''}${focused?'<span class="focus-badge">'+icon('focus')+'</span>':''}${t.exhausted?'<span class="tile-state">ÉPUISÉE</span>':t.inactive?'<span class="tile-state">INACTIVE</span>':''}`}
 </button>`;
}
export function tileDetails(t,{upgrade=false}={}){
 const d=TILES[t.kind],f=tileFamily(t),level=t.level||0,stat=d.family==='guitar'?'qualité':t.kind==='duck'?'fan':'énergie';
 const rule=t.kind==='lighter'?'1 énergie de base. '+d.text:d.text;
 const related=d.family==='guitar'?'voice':d.family==='voice'?'guitar':null;
 return `<section class="tile-explanation type-${tileColor(t)}"><div class="explanation-heading"><strong>${esc(d.name)}</strong><span>${f.label}${level?' · NIVEAU +'+level:''}</span></div>
 ${d.family==='voice'?'<p class="family-explainer">Cette tuile est une <strong>VOIX</strong>. Les micros comptent comme des voix.</p>':d.family==='guitar'?'<p class="family-explainer">Cette tuile est une <strong>GUITARE</strong>.</p>':''}
 <p class="tile-rule">${richText(related?rule.replace(', ×2','. ×2').replace(/(?:Voix : )?×2 par (Voix|Guitare) adjacente[.,]?/,'').replace(/,\s*\./g,'.'):rule)}</p>
 ${related?`<p class="tile-rule family-rule">${familyReference(d.family)} <strong>×2</strong> ${getLanguage()==='en'?'per adjacent':'par'} ${familyReference(related)} ${getLanguage()==='en'?'':'<strong>voisine</strong>'}.</p>`:''}
 ${level?`<p class="tile-rule upgrade-current"><strong>${icon(stat==='qualité'?'star':stat==='fan'?'choir':'bolt')}+${level} ${stat}</strong> de niveau, avant les multiplicateurs.</p>`:''}
 ${d.charge?`<p class="tile-rule"><strong>${t.charges||0} charge${t.charges===1?'':'s'}</strong> actuellement. Les charges restent jusqu’à la fin du show.</p>`:''}
 ${upgrade?`<p class="upgrade-preview">NIVEAU +${level} → <strong>+${level+1}</strong><br><strong>${icon(stat==='qualité'?'star':stat==='fan'?'choir':'bolt')}+1 ${stat}</strong> par apparition, avant les multiplicateurs.</p>`:''}
 ${t.exhausted?'<p class="state-explainer">Épuisée : revient au prochain show. Aucun focus possible.</p>':t.inactive?'<p class="state-explainer">Inactive : peut encore être pigée, mais ne produit rien.</p>':''}
 <small class="adjacency-help">Voisine = en haut, en bas, à gauche ou à droite. Jamais en diagonale.</small></section>`;
}
