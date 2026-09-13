import {keyDrummerPixels} from './art.js?v=0.10.5';
// Presentation assets keyed by the engine's role ID; no game rules live here.
const ROOT='./art/stage/';
export const CLASS_ART={
 'drummer-percussionist':{portrait:'./art/drummer/character/portrait.png',poses:'./art/drummer/character/poses-sheet.png'},
 'guitarist-singer':{portrait:ROOT+'characters/guitariste-chanteur/portrait.png',poses:ROOT+'characters/guitariste-chanteur/poses-sheet.png'}
};
export const classArt=role=>CLASS_ART[role]||CLASS_ART['guitarist-singer'];
export const SHOW_ART=[
 {directory:'01-sous-sol',feet:925,crowd:[[0,80,1536,264],[0,360,1536,328],[0,710,1536,314]]},
 {directory:'02-petit-pub',feet:910,crowd:[[0,110,1536,231],[0,395,1536,280],[0,765,1536,219]]},
 {directory:'03-toit-pirate',feet:860,crowd:[[0,80,1536,257],[0,425,1536,236],[0,750,1536,238]]}
];
export const showArt=index=>SHOW_ART[Math.max(0,Math.floor(index||0))%SHOW_ART.length];
export const showAsset=(index,file)=>ROOT+'shows/'+showArt(index).directory+'/'+file+'.png';
const coverCache=new Map();
export function preloadShowCover(index){
 const path=showAsset(index,'cover');if(coverCache.has(path))return;
 const image=new Image();image.src=new URL(path,import.meta.url).href;coverCache.set(path,image);
}
export function performancePose({result,overdrive,performance:action,reduced,paused,role,strongEvent,time=0}){
 if(result)return {happy:3,neutral:4,sad:5}[result]??4;
 if(reduced||paused)return 0;
 if(role==='drummer-percussionist')return overdrive||strongEvent?2:action==='percussion'?Math.floor(time/240)%2:0;
 return overdrive?2:action==='voice'?1:action==='guitar'?2:0;
}
export function stageCast(state,time=0){
 const players=state.players?.length?state.players:[{id:state.activePlayerId,role:state.role}];
 return players.map((p,index)=>({id:p.id,role:p.role,index,active:players.length===1||p.id===state.activePlayerId,pose:state.result?performancePose({...state,role:p.role,time}):players.length===1||p.id===state.activePlayerId?performancePose({...state,role:p.role,time}):0,x:players.length===1?768:508+index*520}));
}
export function removeMagenta(pixels){
 for(let i=0;i<pixels.length;i+=4){
  const excess=Math.min(pixels[i],pixels[i+2])-pixels[i+1];
  if(excess>42)pixels[i+3]=0;
 }
 return pixels;
}
const textures=new Map();
function texture(path,keyed=true){
 if(!textures.has(path))textures.set(path,new Promise(resolve=>{
  const image=new Image();image.onload=()=>{
   if(!keyed){resolve(image);return;}
   try{
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height);(path.includes('/drummer/')?keyDrummerPixels:removeMagenta)(data.data);ctx.putImageData(data,0,0);resolve(canvas);
   }catch{resolve(null);}
  };image.onerror=()=>resolve(null);image.src=new URL(path,import.meta.url).href;
 }));
 return textures.get(path);
}
export const showVisualMarkup=()=>'<div class="show-visual" aria-hidden="true"><canvas width="920" height="307"></canvas></div>';

// Drawn by the existing resolution clock. No timers, game commands or state writes.
export class ShowVisual{
 constructor(){this.canvas=null;this.assets=null;this.key=null;this.generation=0;this.state={};this.lastFrame='';this.lastBurst=-Infinity;this.burstUntil=0;}
 update(canvas,state,now=performance.now()){
  if(!canvas){this.detach();return;}
  const rect=canvas.parentElement.getBoundingClientRect();
  const height=state.performanceLayout||state.resultLayout?Math.max(1,Math.round(920*rect.height/Math.max(1,rect.width))):307;
  const resized=canvas.height!==height;if(resized)canvas.height=height;
  const changed=resized||this.canvas!==canvas||!canvas.dataset.pose;this.canvas=canvas;this.state=state;
  const cast=stageCast(state),key=showArt(state.show).directory+':'+cast.map(p=>p.role||'guitarist-singer').join(',');
  if(this.activeId!==state.activePlayerId){this.previousId=this.activeId;this.activeId=state.activePlayerId;this.switchAt=now;}
  if(key!==this.key){
   this.key=key;this.assets=null;this.lastFrame='';this.lastBurst=-Infinity;this.burstUntil=0;
   const generation=++this.generation;
   Promise.all([texture(showAsset(state.show,'back'),false),...['background','foreground','crowd-sheet'].map(n=>texture(showAsset(state.show,n))),Promise.all(cast.map(p=>texture(classArt(p.role).poses).then(async sheet=>{if(sheet)return sheet;const portrait=await texture(classArt(p.role).portrait,false);if(!portrait)return null;const fallback=document.createElement('canvas');fallback.width=1536;fallback.height=1024;const ctx=fallback.getContext('2d');for(let i=0;i<6;i++)ctx.drawImage(portrait,i%3*512,Math.floor(i/3)*512,512,512);return fallback;}))),texture(ROOT+'shared/crowd-expression-sheet.png')]).then(assets=>{
    if(generation!==this.generation)return;
    this.assets=assets;this.draw(performance.now(),true);
   });
  }
  if(state.hit&&state.hit!==this.lastHit&&now-this.lastBurst>=500&&!state.reduced&&!state.paused){this.lastBurst=now;this.burstUntil=now+330;}
  this.lastHit=state.hit;this.draw(now,changed);
 }
 detach(){if(this.canvas){this.generation++;this.canvas=null;this.assets=null;this.key=null;}}
 draw(now,force=false){
  const canvas=this.canvas;if(!canvas?.isConnected)return;
  const s=this.state,still=s.reduced||s.paused||document.hidden||!!s.result;
  const pose=performancePose({...s,time:now}),crowd=still?0:[0,1,2,1][Math.floor(now/(s.overdrive?135:s.intensity>.6?190:310))%4];
  const cast=stageCast(s,now),crossfade=s.reduced||s.paused||this.previousId===undefined?1:Math.min(1,(now-this.switchAt)/300);
  const burst=!still&&now<this.burstUntil,signature=[this.key,cast.map(p=>p.pose).join(),pose,crowd,burst,s.overdrive,!!s.result,s.activePlayerId,Math.round(crossfade*20)].join(':');
  if(!force&&signature===this.lastFrame)return;this.lastFrame=signature;
  canvas.dataset.pose=String(pose);canvas.dataset.crowd=String(crowd);canvas.dataset.cast=JSON.stringify(cast.map(p=>({id:p.id,active:p.active,pose:p.pose})));
  const c=canvas.getContext('2d');const scale=canvas.width/1536,viewHeight=canvas.height/scale,top=1024-viewHeight;
  c.setTransform(scale,0,0,scale,0,-top*scale);
  c.fillStyle='#10190f';c.fillRect(0,top,1536,viewHeight);
  if(!this.assets)return;
  const [back,background,foreground,audience,characters,expressions]=this.assets;
  if(back)c.drawImage(back,0,0,1536,1024);
  if(background)c.drawImage(background,0,0,1536,1024);
  if(s.overdrive){const halo=c.createRadialGradient(768,730,10,768,730,320);halo.addColorStop(0,'#baff4250');halo.addColorStop(1,'#baff4200');c.fillStyle=halo;c.fillRect(400,512,736,512);}
  const feet=showArt(s.show).feet,size=Math.min(470,Math.max(180,feet-top-65));
  for(const member of cast){
   const character=characters[member.index];if(!character)continue;
   const previous=member.id===this.previousId?1:0,current=member.active?1:0,light=s.result?1:previous+(current-previous)*crossfade;
   const memberSize=size;
   c.save();c.filter=`brightness(${.55+.45*light})`;c.globalAlpha=.9+.1*light;
   c.drawImage(character,member.pose%3*512,Math.floor(member.pose/3)*512,512,512,member.x-memberSize/2,feet-(member.role==='drummer-percussionist'?[508,508,508,496,497,498]:[494,493,494,496,496,496])[member.pose]*memberSize/512,memberSize,memberSize);c.restore();
  }
  if(foreground)c.drawImage(foreground,0,100,1536,1024);
  if(audience){const r=showArt(s.show).crowd[crowd],scale=1.12;c.drawImage(audience,...r,(1536-r[2]*scale)/2,1045-r[3]*scale,r[2]*scale,r[3]*scale);}
  if(burst&&expressions){const cell=s.overdrive?4:0;for(const [x,y] of [[290,765],[1090,755]])c.drawImage(expressions,cell%3*512,Math.floor(cell/3)*512,512,512,x,y,145,145);}
  const fade=c.createLinearGradient(0,top,0,top+110);fade.addColorStop(0,'#10190fb0');fade.addColorStop(1,'#10190f00');c.fillStyle=fade;c.fillRect(0,top,1536,110);
 }
}
