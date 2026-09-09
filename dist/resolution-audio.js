// Procedural arcade sounds. No sound or speech is emitted when the player mutes.
export class ResolutionAudio{
 constructor(enabled=()=>false,host=globalThis){this.enabled=enabled;this.host=host;this.nodes=new Set();this.speech=null;}
 unlock(){
  if(!this.enabled())return;
  try{const Audio=this.host.AudioContext||this.host.webkitAudioContext;if(!Audio)return;this.ctx??=new Audio();this.ctx.resume()?.catch(()=>{});
   // Prime synthesis on a real click, before a remote player's ready response arrives.
   if(!this.primed&&this.host.speechSynthesis&&this.host.SpeechSynthesisUtterance){this.primed=true;const u=new this.host.SpeechSynthesisUtterance(' ');u.volume=0;this.host.speechSynthesis.speak(u);}
  }catch{}
 }
 tone(hz,end,duration,volume,type='sine',offset=0){
  if(!this.enabled()||!this.ctx||this.ctx.state!=='running')return;
  try{const c=this.ctx,start=c.currentTime+offset,o=c.createOscillator(),v=c.createGain();o.type=type;o.frequency.setValueAtTime(hz,start);o.frequency.exponentialRampToValueAtTime(end,start+duration);v.gain.setValueAtTime(0,start);v.gain.linearRampToValueAtTime(volume,start+.008);v.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(v).connect(c.destination);this.nodes.add(o);o.onended=()=>{o.disconnect();v.disconnect();this.nodes.delete(o);};o.start(start);o.stop(start+duration+.02);}catch{}
 }
 announce(name){
  if(!this.enabled())return;
  this.tone(105,36,.65,.16,'sawtooth');this.tone(52,28,.9,.23);this.tone(210,105,.18,.055,'square',.07);
  try{const s=this.host.speechSynthesis,U=this.host.SpeechSynthesisUtterance;if(!s||!U)return;s.cancel();
   const u=new U(name);const voices=s.getVoices(),french=voices.filter(v=>/^fr/i.test(v.lang));
   u.voice=french.find(v=>/thomas|daniel|nicolas|paul|henri|claude/i.test(v.name))||french.find(v=>v.localService)||french[0]||voices.find(v=>v.default)||null;
   u.lang=u.voice?.lang||'fr-CA';u.pitch=.35;u.rate=.8;u.volume=1;this.speech=u;s.speak(u);
  }catch{}
 }
 tick(value){this.tone(650+Math.min(value,80)*13,280,.045,.035,'square');}
 hit(index){this.tone(110+index*14,52,.14,.06,'triangle');}
 transfer(){this.tone(130,1100,.55,.075,'sawtooth');this.tone(65,330,.5,.08);}
 boom(){this.tone(125,25,.65,.25);this.tone(75,28,.35,.085,'sawtooth');this.tone(520,160,.12,.055,'square');}
 stop(){try{this.host.speechSynthesis?.cancel();}catch{}this.speech=null;for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();}
}
