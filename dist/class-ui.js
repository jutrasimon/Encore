import {ROLES,TILES} from './engine.js?v=0.10.0';
import {classArt} from './show-art.js?v=0.10.0';
import {sticker} from './art.js?v=0.10.0';
import {esc} from './tile-ui.js?v=0.10.0';
export function classChoices(p,locked=false){
 return `<section class="class-choices" aria-label="Choisir sa classe"><h2>CHOISIS TON SON</h2><p>Un pack de tuiles propre à chaque classe.</p>${['guitarist-singer','drummer-percussionist'].map(id=>{const role=ROLES[id],chosen=p.classConfirmed&&p.classId===id;return `<article class="class-choice ${chosen?'selected':''}"><header><img src="${classArt(id).portrait}" alt="${esc(role.name)}"><div><h3>${role.name}</h3><p>${role.promise}</p></div></header><div class="starter-preview" aria-label="Les cinq tuiles de départ">${role.starter.map(k=>`<span title="${esc(TILES[k].name)}">${sticker(k)}<small>${TILES[k].name}</small></span>`).join('')}</div><button class="action-button ${chosen?'primary':'secondary'}" data-action="select-class" data-class="${id}" aria-pressed="${chosen}" ${locked||chosen||!p.starterPending&&p.classConfirmed?'disabled':''}>${chosen?'✓ CLASSE CHOISIE':'CHOISIR CETTE CLASSE'}</button></article>`;}).join('')}</section>`;
}
