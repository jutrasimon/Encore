// Only a successfully committed reward arms the next ready command.
export class RewardAdvance{
 constructor(){this.pending=null;this.sent=null;}
 observe(previous,next,id){
  const before=previous?.players.find(p=>p.id===id),after=next?.players.find(p=>p.id===id);
  if(!before||!after)return;
  const drafted=previous.phase==='draft'&&!before.drafted&&(after.drafted||next.phase==='show');
  const rewarded=previous.phase==='reward'&&!before.rewarded&&(after.rewarded||next.phase==='show');
  if(drafted||rewarded)this.pending={show:previous.show,round:previous.round,attempt:previous.attempt||0,rewarded};
  if(this.pending&&next.phase==='show')this.pending={...this.pending,readyKey:`${next.show}:${next.attempt||0}:${next.round}`};
  if(this.pending?.readyKey&&next.phase!=='show'&&`${next.show}:${next.attempt||0}:${next.round}`!==this.pending.readyKey)this.pending=null;
 }
 take(game,id){
  const p=game?.players.find(p=>p.id===id),key=`${game?.show}:${game?.attempt||0}:${game?.round}`;
  if(!this.pending||game.phase!=='show'||p?.ready||this.pending.readyKey!==key||this.sent===key)return false;
  this.sent=key;return true;
 }
 retry(){this.sent=null;}
 clear(){this.pending=null;this.sent=null;}
}
