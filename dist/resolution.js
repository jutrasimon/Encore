import {resolutionEvents} from './presentation.js';

// A shared cast order, frozen boards, and one clock keep each performance separate.
export const BASE_RESOLUTION_SPEED=1.5;
export const MAX_RESOLUTION_SPEED=2.25;
// Ease in over 9 seconds of resolution; cap the additional increase at 50%.
export function resolutionSpeed(elapsed){const t=Math.max(0,Math.min(1,elapsed/9000));return BASE_RESOLUTION_SPEED+(MAX_RESOLUTION_SPEED-BASE_RESOLUTION_SPEED)*t*t;}
export function resolutionPlan(players,previous,reduced=false,order=[]){
 const ids=[...new Set([...order,...players.map(p=>p.id)])],cast=structuredClone(ids.map(id=>players.find(p=>p.id===id)).filter(Boolean)),events=resolutionEvents(cast),groups=[];
 let at=0,score={q:previous.q,e:previous.e};
 for(const [index,p] of cast.entries()){
  const notes=events.filter(e=>e.playerId===p.id),total={q:0,e:0,f:0};
  const speed=resolutionSpeed(0),intro=(reduced?700:Math.min(2100,1200+p.name.length*30))/BASE_RESOLUTION_SPEED,beat=(reduced?140:620)/speed;
  const group={player:p,index,events:notes,start:at,base:{...score},intro,beat};
  group.timings=[];let cursor=at+intro;
  for(const event of notes){const duration=(reduced?140:620)/resolutionSpeed(cursor-at);group.timings.push({start:cursor,duration});cursor+=duration;}
  group.charge=at+intro;group.hold=cursor;
  group.transfer=group.hold+(reduced?160:460)/resolutionSpeed(group.hold-at);group.impact=group.transfer+(reduced?250:850)/resolutionSpeed(group.transfer-at);
  group.outro=group.impact+(reduced?500:1800);
  group.end=group.outro+(reduced?100:240);
  for(const event of notes)for(const key of ['q','e','f'])total[key]+=event[key]||0;
  group.total=total;groups.push(group);score={q:score.q+total.q,e:score.e+total.e};at=group.end;
 }
 return {groups,duration:at,total:score,reduced};
}
const nForBeat=(g,n)=>Math.min(n,g.timings.length-1);
const mix=(a,b,t)=>Math.round(a+(b-a)*Math.max(0,Math.min(1,t)));
export function resolutionFrame(plan,elapsed){
 const g=plan.groups.find(g=>elapsed<g.end);
 if(!g)return {done:true,score:{...plan.total}};
 const local={q:0,e:0,f:0},score={...g.base};let event=null,phase='intro',progress=0,completed=0,opacity=1;
 if(elapsed>=g.charge){
  phase='charge';const n=Math.min(g.events.length,g.timings.filter(t=>elapsed>=t.start+t.duration).length);
  completed=n;
  for(let i=0;i<n;i++)for(const k of ['q','e','f'])local[k]+=g.events[i][k]||0;
  event=g.events[n]||null;progress=event?Math.min(1,(elapsed-g.timings[n].start)/(g.timings[n].duration*.75)):1;
  if(event)for(const k of ['q','e','f'])local[k]+=mix(0,event[k]||0,progress);
 }
 if(elapsed>=g.hold){phase='hold';Object.assign(local,g.total);}
 if(elapsed>=g.transfer){
  phase='transfer';progress=(elapsed-g.transfer)/(g.impact-g.transfer);
  // The packet travels first; both counters then exchange the very same integers.
  const deposited=Math.max(0,(progress-.72)/.28);
  for(const k of ['q','e']){const amount=mix(0,g.total[k],deposited);local[k]=g.total[k]-amount;score[k]=g.base[k]+amount;}
 }
 if(elapsed>=g.impact){phase='impact';local.q=local.e=0;score.q=g.base.q+g.total.q;score.e=g.base.e+g.total.e;}
 if(elapsed>=g.outro){phase='outro';progress=Math.min(1,(elapsed-g.outro)/(g.end-g.outro));opacity=1-progress*progress*(3-2*progress);}
 return {done:false,group:g,phase,event,progress,completed,beat:g.timings[nForBeat(g,completed)]?.duration||g.beat,local,score,opacity};
}

// Three rows/columns span a 300-unit SVG, including the physical gaps between tiles.
export function electricPath(from,to,variant=0){
 const x=from%3*100+50,y=Math.floor(from/3)*100+50,dx=(to%3-from%3)*100,dy=(Math.floor(to/3)-Math.floor(from/3))*100;
 const length=Math.hypot(dx,dy);if(!length)return `M ${x} ${y}`;
 const steps=Math.max(6,Math.ceil(length/13)),parts=[`M ${x} ${y}`];
 for(let i=1;i<steps;i++){
  const t=i/steps,offset=(i%2?1:-1)*(variant?7:5)*(0.65+((i+from+to)%3)*.18);
  parts.push(`L ${(x+dx*t-dy/length*offset).toFixed(2)} ${(y+dy*t+dx/length*offset).toFixed(2)}`);
 }
 return parts.join(' ')+` L ${x+dx} ${y+dy}`;
}
