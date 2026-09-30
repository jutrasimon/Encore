import {TILES} from './engine.js?v=0.10.12';
import {stickerMasks} from './art-masks.js?v=0.10.12';
// Clip atlas pixels explicitly; a wide SVG viewport otherwise reveals adjacent stickers.
const boxes={
 guitar:[31,10,254,289],voice:[348,15,212,282],pick:[627,55,228,227],
 boot:[31,299,255,261],lighter:[366,284,150,284],duck:[627,311,234,246],
 smoke:[55,561,215,289],cup:[362,555,178,281],refrain:[611,572,248,259],
 choir:[11,856,298,250],last:[351,834,191,294],solo:[609,827,259,301],
 note:[62,1116,201,293],pedal:[328,1131,228,264],encore:[618,1133,231,236],
 kamikaze:[13,1393,295,358],amp:[324,1430,251,289],feedback:[616,1413,251,317]
};
let stickerId=0;
export function sticker(kind){
 if(kind.startsWith('perc_')&&TILES[kind])return `<img class="sticker percussion-art" data-art-kind="${kind}" src="${new URL('./art/drummer/tiles/'+TILES[kind].icon+'.webp',import.meta.url).href}" decoding="async" alt="" aria-hidden="true">`;
 const box=boxes[kind];if(!box)return '';
 const id=`sticker-crop-${++stickerId}`;
 return `<svg class="sticker" viewBox="${box.join(' ')}" aria-hidden="true" focusable="false"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${stickerMasks[kind]}"/></clipPath></defs><g clip-path="url(#${id})"><image href="./art/punk-stickers-v1.webp" width="887" height="1774"/></g></svg>`;
}

// One atlas and one family mapping, shared by cards, rules and effect references.
export const FAMILY_ART={percussion:{kind:'perc_kick',label:'PERCUSSION',color:'percussion'},guitar:{kind:'guitar',label:'GUITARE',color:'quality'},voice:{kind:'voice',label:'VOIX',color:'energy'},utility:{kind:'pedal',label:'EFFET',color:'utility'}};
export const hasTileArt=kind=>kind.startsWith('perc_')&&!!TILES[kind]||Object.hasOwn(boxes,kind)&&Object.hasOwn(stickerMasks,kind);

// Stage poses are still keyed at load time (show-art.js); tile art ships pre-keyed.
export function keyDrummerPixels(data){for(let i=0;i<data.length;i+=4)if(Math.min(data[i],data[i+2])-data[i+1]>80)data[i+3]=0;return data;}
