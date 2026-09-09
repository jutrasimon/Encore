import {newGame,player,command,random,draw,resolve,tile} from '../dist/engine.js';
const totals=[];
for(let seed=1;seed<=250;seed++){
 let g=newGame();g.players=[player('a','A')];let rng=random(seed);const act=(type,x={})=>g=command(g,'a',{type,revision:g.revision,...x},Math.floor(rng()*2**32));act('start');
 for(let r=0;r<5;r++){
  act('ready');if(g.phase==='draft'){
   const offers=g.players[0].songOffers;let best=offers[0],score=-Infinity;
   for(const kind of offers){let q=0,e=0;for(let i=0;i<25;i++){const inv=structuredClone(g.players[0].inventory);inv.push(tile(kind,'new'));const out=resolve(inv,draw(inv,random(i+seed)),r+2).totals;q+=out.q;e+=out.e;}const v=Math.min(g.q+q/25*(4-r),g.e+e/25*(4-r));if(v>score){best=kind;score=v;}}
   act('draft',{kind:best});
  }
 }
 totals.push([g.q,g.e]);
}
for(const [q,e] of [[24,25],[34,32],[70,64]])console.log({q,e,win:totals.filter(t=>t[0]>=q&&t[1]>=e).length/totals.length});
for(const k of [0,1]){const a=totals.map(t=>t[k]).sort((a,b)=>a-b);console.log(k,[.1,.25,.5,.75,.9].map(p=>a[Math.floor(p*a.length)]));}
