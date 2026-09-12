import {locale} from './i18n.js?v=0.10.0';
// Speech gets ordinary word casing; the displayed stage name remains untouched.
export function spokenStageName(name){
 return String(name??'').normalize('NFC').trim().replace(/\s+/g,' ').replace(/[\p{L}\p{M}]+/gu,word=>word.charAt(0).toLocaleUpperCase('fr-CA')+word.slice(1).toLocaleLowerCase('fr-CA'))||'Sans nom';
}
// Procedural arcade sounds. No sound or speech is emitted when the player mutes.
export class ResolutionAudio{
 constructor(enabled=()=>false,host=globalThis){this.enabled=enabled;this.host=host;this.nodes=new Set();this.speech=null;this.speechEpoch=0;this.echoTimer=null;}
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
 cancelSpeech(){this.speechEpoch++;clearTimeout(this.echoTimer);this.echoTimer=null;try{this.host.speechSynthesis?.cancel();}catch{}this.speech=null;}
 speak(text,{volume=1,lang='en-US',pitch=.35,rate=1,echo=false}={}){
  if(!this.enabled()||!volume)return;
  this.cancelSpeech();const epoch=this.speechEpoch;
  try{const s=this.host.speechSynthesis,U=this.host.SpeechSynthesisUtterance;if(!s||!U)return;
   const voices=s.getVoices(),matches=voices.filter(v=>v.lang.toLowerCase().startsWith(lang.slice(0,2)));
   const voice=matches.find(v=>/thomas|daniel|nicolas|paul|henri|claude|david|guy|ryan/i.test(v.name))||matches.find(v=>v.localService)||matches[0]||null;
   const say=(gain,isEcho=false)=>{
    if(epoch!==this.speechEpoch||!this.enabled())return;
    const u=new U(text);u.voice=voice;u.lang=voice?.lang||lang;u.pitch=pitch;u.rate=isEcho?rate*1.14:rate;u.volume=gain;this.speech=u;
    u.onend=()=>{if(epoch!==this.speechEpoch)return;if(echo&&!isEcho){this.echoTimer=setTimeout(()=>{this.echoTimer=null;say(volume*.25,true);},65);}else{this.speech=null;this.onSpeechDone?.();}};
    u.onerror=()=>{if(epoch===this.speechEpoch){this.speech=null;this.onSpeechDone?.();}};s.speak(u);
   };say(volume);
  }catch{this.onSpeechDone?.();}
 }
 announce(name,volume=1){
  if(!this.enabled())return;
  this.tone(105,36,.4,.13,'sawtooth');this.tone(52,28,.65,.19);
  this.speak(spokenStageName(name),{volume,lang:locale(),pitch:.2,rate:1.02,echo:true});
 }
 tick(value){this.tone(650+Math.min(value,80)*13,280,.045,.035,'square');}
 hit(index){this.tone(110+index*14,52,.14,.06,'triangle');}
 transfer(){this.tone(130,1100,.55,.075,'sawtooth');this.tone(65,330,.5,.08);}
 boom(){
  // Sub drop, metallic attack, then a filtered rumble that follows the visual tail.
  this.tone(150,28,1.5,.24);this.tone(65,24,1.8,.14,'sine',.045);
  this.tone(240,42,.65,.075,'sawtooth');this.tone(1100,150,.16,.06,'triangle');
  if(!this.enabled()||this.ctx?.state!=='running'||this.levels?.effects===0)return;
  try{
   const c=this.ctx,duration=1.65,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);
   let low=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;low=.96*low+.04*white;data[i]=white*.4+low*3;}
   const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),start=c.currentTime;
   source.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(4200,start);filter.frequency.exponentialRampToValueAtTime(110,start+duration);
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.26*(this.levels?.effects??1),start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
   source.connect(filter).connect(gain).connect(c.destination);this.nodes.add(source);
   source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();this.nodes.delete(source);};source.start(start);source.stop(start+duration);
  }catch{}
 }
 stop(){this.cancelSpeech();for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();}
}
