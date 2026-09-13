import {TILES} from './engine.js?v=0.10.5';
import {stickerMasks} from './art-masks.js';
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
 if(kind.startsWith('perc_')&&TILES[kind])return `<img class="sticker percussion-art" data-art-kind="${kind}" alt="" aria-hidden="true">`;
 const box=boxes[kind];if(!box)return '';
 const id=`sticker-crop-${++stickerId}`;
 return `<svg class="sticker" viewBox="${box.join(' ')}" aria-hidden="true" focusable="false"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${stickerMasks[kind]}"/></clipPath></defs><g clip-path="url(#${id})"><image href="./art/punk-stickers-v1.png" width="887" height="1774"/></g></svg>`;
}

// One atlas and one family mapping, shared by cards, rules and effect references.
export const FAMILY_ART={percussion:{kind:'perc_kick',label:'PERCUSSION',color:'percussion'},guitar:{kind:'guitar',label:'GUITARE',color:'quality'},voice:{kind:'voice',label:'VOIX',color:'energy'},utility:{kind:'pedal',label:'EFFET',color:'utility'}};
export const hasTileArt=kind=>kind.startsWith('perc_')&&!!TILES[kind]||Object.hasOwn(boxes,kind)&&Object.hasOwn(stickerMasks,kind);

const tileTextures=new Map();
export function keyDrummerPixels(data){for(let i=0;i<data.length;i+=4)if(Math.min(data[i],data[i+2])-data[i+1]>80)data[i+3]=0;return data;}
export function loadTileTexture(kind){
 if(!tileTextures.has(kind))tileTextures.set(kind,new Promise(resolve=>{
  const image=new Image();image.onload=()=>{try{
   const source=document.createElement('canvas');source.width=image.naturalWidth;source.height=image.naturalHeight;
   const ctx=source.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
   if(kind!=='perc_patch'){const pixels=ctx.getImageData(0,0,source.width,source.height);keyDrummerPixels(pixels.data);ctx.putImageData(pixels,0,0);}
   // Trim only transparent margins, retaining all original artwork pixels.
   const rgba=ctx.getImageData(0,0,source.width,source.height).data;
   let left=source.width,top=source.height,right=0,bottom=0;
   for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(rgba[(y*source.width+x)*4+3]>16){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   const cropped=document.createElement('canvas');cropped.width=right-left+1;cropped.height=bottom-top+1;
   cropped.getContext('2d').drawImage(source,left,top,cropped.width,cropped.height,0,0,cropped.width,cropped.height);resolve(cropped);
  }catch{resolve(null);}};image.onerror=()=>resolve(null);image.src=new URL('./art/drummer/tiles/'+TILES[kind].icon+'.png',import.meta.url).href;
 }));return tileTextures.get(kind);
}
export function installTileArt(root=document.body){
 const seen=new WeakMap(),urls=new Map();
 const paint=()=>{for(const element of root.querySelectorAll('img[data-art-kind]')){
  const kind=element.dataset.artKind;if(seen.get(element)===kind&&element.hasAttribute('src'))continue;seen.set(element,kind);
  loadTileTexture(kind).then(texture=>{
   if(!element.isConnected||element.dataset.artKind!==kind)return;
   if(texture){if(!urls.has(kind))urls.set(kind,texture.toDataURL('image/png'));element.src=urls.get(kind);}
   element.dataset.loaded=texture?'true':'fallback';
  });
 }};
 const observer=new MutationObserver(paint);observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-art-kind','src']});paint();return ()=>observer.disconnect();
}
