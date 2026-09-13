import {announcement} from './i18n.js?v=0.10.5';
// Effects stay outside the game state. One bounded canvas, paused when idle/hidden.
export function scoreCallout(event){
 const total=(event?.q||0)+(event?.e||0)+(event?.f||0);
 if(total>=80)return {text:'UNBELIEVABLE!',rank:4};
 if(total>=40)return {text:'FANTASTIC!',rank:3};
 if(total>=20)return {text:'AWESOME!',rank:2};
 if(total>=10)return {text:'GREAT!',rank:1};
 return null;
}
const SPRITES=['hit-spark','critical-star','big-boom','shockwave','overload'];
// Intensité des boutons : 0 = aucune distorsion, 0.5 = douce, 1 = forte.
const BUTTON_WARP_INTENSITY = 0.5;
export class Juice{
 constructor(root,enabled=()=>true){
  this.root=root;this.enabled=enabled;this.particles=[];this.bursts=[];this.assets=new Map();this.raf=0;this.last=0;this.pointer=null;this.hovered=null;this.warp=0;
  this.layer=document.createElement('div');this.layer.className='juice-layer';this.layer.setAttribute('aria-hidden','true');
  this.canvas=document.createElement('canvas');this.layer.append(this.canvas);document.body.append(this.layer);this.ctx=this.canvas.getContext('2d');
  for(const name of [...SPRITES,...['radial','concentric'].flatMap(k=>Array.from({length:10},(_,i)=>`speed-${k}-${i+1}`))]){
   const im=new Image();im.src=new URL(`./vfx/${name}.png`,import.meta.url);this.assets.set(name,im);
  }
  this.resize=()=>{this.dpr=Math.min(devicePixelRatio||1,1.5);this.w=innerWidth;this.h=innerHeight;this.canvas.width=this.w*this.dpr;this.canvas.height=this.h*this.dpr;};
  this.resize();window.addEventListener('resize',this.resize);
  root.addEventListener('pointermove',e=>this.move(e));root.addEventListener('pointerleave',()=>this.release());
  root.addEventListener('pointerdown',e=>{if(e.target.closest('button')&&!e.target.closest('button:disabled,[data-action=starter-tooltip]'))this.burst('hit-spark',e.clientX,e.clientY,65,'#baff42',260);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
 }
 reduced(){return !this.enabled()||matchMedia('(prefers-reduced-motion: reduce)').matches;}
 move(e){
  if(this.reduced()||e.pointerType==='touch'||this.root.querySelector('.resolution-mode'))return;
  const target=e.target.closest('.tile,.action-button');
  const el=target&&!target.matches(':disabled')&&!target.closest('[inert]')?target:null;
  if(this.hovered!==el){this.release();this.hovered=el;}
  if(!el)return;
  const r=el.getBoundingClientRect(),speed=this.pointer?Math.min(24,Math.hypot(e.clientX-this.pointer.x,e.clientY-this.pointer.y)):3;
  el.style.setProperty('--lean',((e.clientX-r.x)/r.width-.5)*5+'deg');el.classList.add('pointer-warp');
  const action=el.classList.contains('action-button');
  const intensity=action?BUTTON_WARP_INTENSITY:1;
  this.pointer={x:e.clientX,y:e.clientY};this.warp=Math.min((action?19:9)*intensity,this.warp+speed*(action?0.65:0.3)*intensity);
  if(speed>3)this.particles.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*100,vy:(Math.random()-.5)*100,life:0,ttl:250,size:2+Math.random()*3,color:Math.random()>.5?'#ff5aae':'#baff42'});
  this.particles=this.particles.slice(-80);this.wake();
 }
 release(){this.hovered?.classList.remove('pointer-warp');this.hovered?.style.removeProperty('--lean');this.hovered=null;this.pointer=null;}
 wake(){if(!this.raf&&!document.hidden){this.last=performance.now();this.raf=requestAnimationFrame(t=>this.draw(t));}}
 burst(name,x,y,size=140,color='#baff42',ttl=440){
  if(this.reduced()||document.hidden)return;
  this.bursts.push({name,x,y,size,color,ttl,life:0});this.bursts=this.bursts.slice(-16);this.wake();
 }
 spray(x,y,color,count=14){
  if(this.reduced()||document.hidden)return;
  for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=80+Math.random()*230;this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,ttl:350+Math.random()*250,size:2+Math.random()*5,color});}
  this.particles=this.particles.slice(-80);this.wake();
 }
 float(text,color='#baff42',rank=1){
  const board=this.root.querySelector('.grid-wrap');if(!board||document.hidden)return;
  const now=performance.now();
  if(rank!==5&&this.lastPraise&&now-this.lastPraise.time<650&&rank<=this.lastPraise.rank)return;
  this.lastPraise={time:now,rank};
  const r=board.getBoundingClientRect(),el=document.createElement('strong');el.className=`hype-callout rank-${rank}`;el.textContent=announcement(text);
  el.style.cssText=`left:${r.x+r.width/2}px;top:${Math.max(95,r.y+r.height*.32)}px;--hype:${color}`;
  // At most one praise and one overdrive message; bursts can overlap without text piling up.
  this.layer.querySelectorAll(rank===5?'.rank-5':'.hype-callout:not(.rank-5)').forEach(n=>n.remove());
  if(rank===5)this.layer.querySelectorAll('.hype-callout').forEach(n=>n.remove());
  else if(this.layer.querySelector('.rank-5'))return;
  this.layer.append(el);setTimeout(()=>el.remove(),this.reduced()?1100:1000);
 }
 clearTileScores(){this.layer.querySelectorAll('.tile-score-total').forEach(el=>el.remove());}
 tileTotal(event,remaining){
  const tile=this.root.querySelectorAll('.grid .tile')[event.index];if(!tile)return;
  const r=tile.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height*.43,total=(event.q||0)+(event.e||0)+(event.f||0),color=event.q>event.e?'#baff42':event.f>event.e?'#ff89c9':'#ffb441';
  const el=document.createElement('strong');el.className='tile-score-total';el.textContent=String(total);el.setAttribute('aria-hidden','true');el.style.cssText=`left:${x}px;top:${y}px;--score-size:${Math.min(64,r.width*.5)}px;color:${color}`;this.layer.append(el);
  this.spray(x,y,color,18);this.burst('hit-spark',x,y,r.width,color,250);
  if(!this.reduced())el.animate([{transform:'translate(-50%,-50%) scale(1.35)'},{transform:'translate(-50%,-50%) scale(1)',offset:Math.min(.12,160/Math.max(200,remaining))},{transform:'translate(-50%,-50%) scale(.45)'}],{duration:Math.max(200,remaining),fill:'forwards',easing:'linear'});
 }
 hit(event,beat=400){
  const tile=this.root.querySelectorAll('.grid .tile')[event.index];if(!tile)return;
  const r=tile.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,call=scoreCallout(event),color=event.q>event.e?'#baff42':event.f>event.e?'#ff89c9':'#ffb441';
  tile.style.setProperty('--hit-time',Math.max(150,beat)+'ms');
  this.burst(call?'critical-star':'hit-spark',x,y,r.width*(call?2:1.3),color,Math.min(460,beat+100));
  this.spray(x,y,color,call?18:7);
  if(call)this.float(call.text,color,call.rank);
  if(call?.rank>=2)this.speed('radial',r,320,.18);
 }
 speed(kind,rect,ttl=500,alpha=.3){if(this.reduced())return;this.lines={kind,rect,ttl,alpha,life:0};this.wake();}
 impact(total){
  const praise=scoreCallout(total);if(praise)this.float(praise.text,'#fff3ca',praise.rank);
  const board=this.root.querySelector('.grid-wrap');if(!board)return;const r=board.getBoundingClientRect();
  this.burst('big-boom',r.x+r.width/2,r.y+r.height/2,r.width*1.2,'#fff3ca',1400);
  this.burst('shockwave',r.x+r.width/2,r.y+r.height/2,r.width*1.5,'#baff42',1600);
  this.speed('concentric',r,1400,.3);
 }
 overdrive(level){
  this.float(level===2?'DOUBLE OVERDRIVE!':'OVERDRIVE!','#ffbb42',5);
  const board=this.root.querySelector('.grid-wrap');if(!board)return;const r=board.getBoundingClientRect();
  this.burst('overload',r.x+r.width/2,r.y+r.height/2,r.width*1.5,'#ffbb42',650);this.speed('radial',r,750,.4);
  this.spray(r.x+r.width/2,r.y+r.height/2,'#ffbb42',36);
 }
 draw(now){
  this.raf=0;const dt=Math.min(50,now-this.last);this.last=now;const c=this.ctx;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);c.imageSmoothingEnabled=false;
  if(this.reduced()||document.hidden){this.clear();return;}
  // Resolution impacts stay on the board; pointer trails can reach the action buttons.
  c.save();
  const frame=this.root.querySelector('.resolution-mode .grid-wrap')||this.root.querySelector('.console');
  if(frame){
   const r=frame.getBoundingClientRect(),inset=Math.max(frame.clientLeft,frame.clientTop),radius=Math.max(0,(parseFloat(getComputedStyle(frame).borderRadius)||0)-inset);
   c.beginPath();c.roundRect(r.x+inset,r.y+inset,Math.max(0,r.width-inset*2),Math.max(0,r.height-inset*2),radius);c.clip();
  }
  this.warp*=Math.pow(.75,dt/16);document.getElementById('cursor-displacement')?.setAttribute('scale',this.warp.toFixed(1));
  if(this.warp<.15){this.warp=0;this.release();}
  this.bursts=this.bursts.filter(b=>(b.life+=dt)<b.ttl);
  for(const b of this.bursts){const im=this.assets.get(b.name);if(!im?.complete||!im.naturalWidth)continue;const n=im.naturalWidth/32,frame=Math.min(n-1,Math.floor(b.life/b.ttl*n));c.globalAlpha=.9*Math.min(1,(1-b.life/b.ttl)/.35);c.shadowColor=b.color;c.shadowBlur=12;c.drawImage(im,frame*32,0,32,32,b.x-b.size/2,b.y-b.size/2,b.size,b.size);}
  c.shadowBlur=0;
  if(this.lines){const b=this.lines;b.life+=dt;const im=this.assets.get(`speed-${b.kind}-${Math.floor(b.life/45)%10+1}`);if(im?.complete&&im.naturalWidth){c.globalAlpha=b.alpha*(1-b.life/b.ttl);const r=b.rect;c.drawImage(im,r.x-r.width*.2,r.y-r.height*.2,r.width*1.4,r.height*1.4);}if(b.life>=b.ttl)this.lines=null;}
  this.particles=this.particles.filter(p=>(p.life+=dt)<p.ttl);
  for(const p of this.particles){p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vy+=dt*.22;c.globalAlpha=1-p.life/p.ttl;c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);}
  c.restore();c.globalAlpha=1;if(this.bursts.length||this.particles.length||this.lines||this.warp)this.raf=requestAnimationFrame(t=>this.draw(t));
 }
 clear(){cancelAnimationFrame(this.raf);this.raf=0;this.bursts=[];this.particles=[];this.lines=null;this.lastPraise=null;this.warp=0;this.release();document.getElementById('cursor-displacement')?.setAttribute('scale','0');this.layer.querySelectorAll('.hype-callout').forEach(n=>n.remove());this.clearTileScores();this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);}
}
