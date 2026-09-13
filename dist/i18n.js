import english from './locales/en.js?v=0.10.4';
export const LANGUAGES={fr:'Français',en:'English'};
let language='fr';
export const getLanguage=()=>language;
export const locale=()=>language==='en'?'en-CA':'fr-CA';
export function setLanguage(value){language=Object.hasOwn(LANGUAGES,value)?value:'fr';return language;}
const entries=new Map(Object.entries(english).map(([k,v])=>[k.toLocaleLowerCase('fr'),v]));
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pattern=new RegExp('(?<![\\p{L}\\p{N}])('+[...entries.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|')+')(?![\\p{L}\\p{N}])','giu');
export function translate(source,lang=language){
 const text=String(source??'');if(lang!=='en')return text;
 return text.replace(pattern,match=>{const value=entries.get(match.toLocaleLowerCase('fr'));return match===match.toLocaleUpperCase('fr')?value.toLocaleUpperCase('en'):match===match.toLocaleLowerCase('fr')?value.toLocaleLowerCase('en'):value;})
 .replace(/Encore (\d+) categor(?:y|ies) to complete\./g,(_,n)=>`${n} categor${n==='1'?'y':'ies'} left to complete.`);
}
// Presentation-only translation. Original text is retained for instant, lossless switching.
// Never modifies inputs, tile data, IDs, game state, or saved/player-provided names.
export function installLocalization(root=document.body){
 const sources=new WeakMap(),attributes=new WeakMap();
 const skip=el=>el?.closest('[translate="no"],script,style,textarea');
 function applyNode(node){
  if(node.nodeType===3){if(skip(node.parentElement))return;const current=node.nodeValue,old=sources.get(node),source=old&&current===old.output?old.source:current,output=translate(source);sources.set(node,{source,output});if(output!==current)node.nodeValue=output;return;}
  if(node.nodeType!==1||skip(node))return;
  for(const key of ['aria-label','title','alt','placeholder'])if(node.hasAttribute(key)&&!(key==='aria-label'&&node.hasAttribute('data-player-label'))){const record=attributes.get(node)||{},current=node.getAttribute(key),old=record[key],source=old&&old.output===current?old.source:current,output=translate(source);record[key]={source,output};attributes.set(node,record);if(output!==current)node.setAttribute(key,output);}
  if(!node.matches('input,textarea'))for(const child of node.childNodes)applyNode(child);
 }
 const observer=new MutationObserver(records=>{observer.disconnect();for(const record of records){if(record.type==='childList')for(const node of record.addedNodes)applyNode(node);else applyNode(record.target);}observe();});
 const observe=()=>observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt','placeholder']});
 const refresh=()=>{observer.disconnect();document.documentElement.lang=language;document.title=language==='en'?'ENCORE! · The Pirate Tour':'ENCORE! · La tournée pirate';applyNode(root);observe();};refresh();return {refresh,disconnect:()=>observer.disconnect()};
}

export function announcement(text){const fr={'GREAT!':'SUPER !','AWESOME!':'GÉNIAL !','FANTASTIC!':'FANTASTIQUE !','UNBELIEVABLE!':'INCROYABLE !'};return language==='fr'?(fr[text]||text):text;}
