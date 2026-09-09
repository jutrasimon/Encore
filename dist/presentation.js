// Pure presentation helpers. Animation never changes the authoritative game state.
export function relatedTiles(board,index){
 const related=new Set([index,...(board[index]?.links||[])]);
 board.forEach((t,i)=>{if(t?.links?.includes(index))related.add(i);});
 return [...related];
}
export function resolutionEvents(players,myId){
 return [...players].sort((a,b)=>(b.id===myId)-(a.id===myId)).flatMap(p=>p.board.flatMap((t,index)=>t.kind==='empty'?[]:[{
  playerId:p.id,name:p.name,index,kind:t.kind,related:relatedTiles(p.board,index),
  q:t.q*(1+(t.repeats||0)),e:t.e*(1+(t.repeats||0)),f:t.f*(1+(t.repeats||0)),multiplier:t.m||1
 }]));
}
export function overdriveLevel(score,target){return Number(score.q>target.q)+Number(score.e>target.e);}
