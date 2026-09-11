// Presentation assets keyed by the engine's role ID; no game rules live here.
const ROOT='./art/stage/';
export const CLASS_ART={
 'guitarist-singer':{portrait:ROOT+'characters/guitariste-chanteur/portrait.png',poses:ROOT+'characters/guitariste-chanteur/poses-sheet.png'}
};
export const classArt=role=>CLASS_ART[role]||CLASS_ART['guitarist-singer'];
export const SHOW_ART=[
 {directory:'01-sous-sol',crowd:[[0,80,1536,264],[0,360,1536,328],[0,710,1536,314]]},
 {directory:'02-petit-pub',crowd:[[0,110,1536,231],[0,395,1536,280],[0,765,1536,219]]},
 {directory:'03-toit-pirate',crowd:[[0,80,1536,257],[0,425,1536,236],[0,750,1536,238]]}
];
export const showArt=index=>SHOW_ART[Math.max(0,Math.floor(index||0))%SHOW_ART.length];
export const showAsset=(index,file)=>ROOT+'shows/'+showArt(index).directory+'/'+file+'.png';
const coverCache=new Map();
export function preloadShowCover(index){
 const path=showAsset(index,'cover');if(coverCache.has(path))return;
 const image=new Image();image.src=new URL(path,import.meta.url).href;coverCache.set(path,image);
}
export function performancePose({result,overdrive,performance:action,reduced,paused}){
 if(result)return {happy:3,neutral:4,sad:5}[result]??4;
 if(reduced||paused)return 0;
 return overdrive?2:action==='voice'?1:action==='guitar'?2:0;
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
    const data=ctx.getImageData(0,0,canvas.width,canvas.height);removeMagenta(data.data);ctx.putImageData(data,0,0);resolve(canvas);
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
  const key=showArt(state.show).directory+':'+(state.role||'guitarist-singer');
  if(key!==this.key){
   this.key=key;this.assets=null;this.lastFrame='';this.lastBurst=-Infinity;this.burstUntil=0;
   const generation=++this.generation,art=classArt(state.role);
   Promise.all([texture(showAsset(state.show,'back'),false),...['background','foreground','crowd-sheet'].map(n=>texture(showAsset(state.show,n))),texture(art.poses),texture(ROOT+'shared/crowd-expression-sheet.png')]).then(assets=>{
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
  const pose=performancePose(s),crowd=still?0:[0,1,2,1][Math.floor(now/(s.overdrive?135:s.intensity>.6?190:310))%4];
  const burst=!still&&now<this.burstUntil,signature=[this.key,pose,crowd,burst,s.overdrive,!!s.result].join(':');
  if(!force&&signature===this.lastFrame)return;this.lastFrame=signature;
  canvas.dataset.pose=String(pose);canvas.dataset.crowd=String(crowd);
  const c=canvas.getContext('2d');const scale=canvas.width/1536,viewHeight=canvas.height/scale,top=1024-viewHeight;
  c.setTransform(scale,0,0,scale,0,-top*scale);
  c.fillStyle='#10190f';c.fillRect(0,top,1536,viewHeight);
  if(!this.assets)return;
  const [back,background,foreground,audience,character,expressions]=this.assets;
  if(back)c.drawImage(back,0,0,1536,1024);
  if(background)c.drawImage(background,0,0,1536,1024);
  if(s.overdrive){const halo=c.createRadialGradient(768,730,10,768,730,320);halo.addColorStop(0,'#baff4250');halo.addColorStop(1,'#baff4200');c.fillStyle=halo;c.fillRect(400,512,736,512);}
  const size=s.resultLayout?Math.min(760,Math.max(300,viewHeight-40)):s.performanceLayout?Math.min(435,Math.max(180,viewHeight-140)):435,feet=s.resultLayout?970:s.performanceLayout?990:930;
  if(character)c.drawImage(character,pose%3*512,Math.floor(pose/3)*512,512,512,768-size/2,feet-494*size/512,size,size);
  if(foreground)c.drawImage(foreground,0,100,1536,1024);
  if(audience){const r=showArt(s.show).crowd[crowd],scale=.72;c.drawImage(audience,...r,(1536-r[2]*scale)/2,1045-r[3]*scale,r[2]*scale,r[3]*scale);}
  if(burst&&expressions){const cell=s.overdrive?4:0;for(const [x,y] of [[290,765],[1090,755]])c.drawImage(expressions,cell%3*512,Math.floor(cell/3)*512,512,512,x,y,145,145);}
  const fade=c.createLinearGradient(0,top,0,top+110);fade.addColorStop(0,'#10190fb0');fade.addColorStop(1,'#10190f00');c.fillStyle=fade;c.fillRect(0,top,1536,110);
 }
}
