import {newGame,player,command,random,draw,resolve,tile,targets} from '../../dist/engine.js';
import {writeFileSync} from 'node:fs';
const results=[];
for(const role of ['guitarist-singer','drummer-percussionist']){
 const runs=[];
 for(let seed=1;seed<=100;seed++){
 let g=newGame();g.players=[player('a','A',role)];const rng=random(seed);const act=(type,x={})=>g=command(g,'a',{type,revision:g.revision,show:g.show,round:g.round,...x},Math.floor(rng()*2**32));act('start');const shows=[];let max=1,replays=0;
 while(g.show<3&&g.phase!=='lost'){
  if(g.phase==='show'){act('ready');for(const t of g.players[0].board){max=Math.max(max,t.m);replays+=t.repeats||0;}if(g.round===5)shows.push({q:g.q,e:g.e,won:g.phase==='reward'});}
  else if(g.phase==='draft'){
   const p=g.players[0],goal=targets(g);let best=p.songOffers[0],value=-Infinity;
   for(const kind of p.songOffers){let q=0,e=0;for(let n=0;n<12;n++){const inv=structuredClone(p.inventory);inv.push(tile(kind,'new'));const out=resolve(inv,draw(inv,random(seed*12+n)),g.round+1).totals;q+=out.q;e+=out.e;}const v=Math.min(1,(g.q+q/12*(5-g.round))/goal.q)+Math.min(1,(g.e+e/12*(5-g.round))/goal.e)+(q+e)/100000;if(v>value){value=v;best=kind;}}
   act('draft',{kind:best});
  }else if(g.phase==='reward'){act('reward',{action:'add',kind:g.players[0].offers[0]});act('reward',{action:'upgrade',tileId:g.players[0].inventory[0].id});act('reward',{action:'skip',category:'remove'});act('studio-depart');}
 }
 runs.push({shows,max,replays});
 }
 results.push({role,seeds:100,policy:'12-draw lookahead for draft; first offered Studio addition; upgrade first instance; skip removal',shows:[0,1,2].map(i=>{const rows=runs.map(r=>r.shows[i]).filter(Boolean);const median=k=>rows.map(r=>r[k]).sort((a,b)=>a-b)[Math.floor(rows.length/2)]??null;return {level:i+1,reached:rows.length,won:rows.filter(r=>r.won).length,medianQ:median('q'),medianE:median('e')}}),peakMultiplier:Math.max(...runs.map(r=>r.max)),replays:runs.reduce((a,r)=>a+r.replays,0)});
}
writeFileSync('docs/drummer/balance-v1.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
