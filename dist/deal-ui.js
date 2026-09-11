// Visual distribution of the already drawn board; never draws or changes a game tile.
export function dealFrame(board,elapsed,intro,reduced=false){
 const occupied=board.map((tile,index)=>tile&&tile.kind!=='empty'?index:-1).filter(i=>i>=0);
 const duration=Math.min(180,intro*.23),step=Math.min(55,(intro-duration-80)/Math.max(1,occupied.length));
 return occupied.map((index,rank)=>({index,progress:reduced?1:Math.max(0,Math.min(1,(elapsed-60-rank*step)/duration))}));
}
export function paintDeal(root,board,elapsed,intro,reduced){
 const tiles=root.querySelectorAll('.grid .tile'),state=dealFrame(board,elapsed,intro,reduced);
 for(const {index,progress} of state){const tile=tiles[index];if(!tile)continue;
  if(progress>=1){tile.style.removeProperty('transform');tile.style.removeProperty('opacity');continue;}
  const t=1-Math.pow(1-progress,3),dx=(1-index%3)*(tile.offsetWidth+6),dy=(1-Math.floor(index/3))*(tile.offsetHeight+6);
  tile.style.opacity=String(progress?1:0);tile.style.transform=`translate(${dx*(1-t)}px,${dy*(1-t)}px) rotate(${(index%2?14:-14)*(1-t)}deg) scale(${.35+.65*t})`;
 }
 return state.filter(s=>s.progress>=1).length;
}
