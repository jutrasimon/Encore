import {getLanguage,locale,announcement} from './i18n.js?v=0.10.4';
import {ResolutionAudio} from './resolution-audio.js?v=0.10.4';
import {PLAYLIST} from './music-playlist.js?v=0.10.4';
export {PLAYLIST};

const MUSIC=PLAYLIST[0];
const MUSIC_GAIN=.08;
export function musicSettings(saved){
 return {music:saved?Math.min(1,Math.max(0,(saved.music??.05)*10)):.5,effects:saved?.effects??.85,voice:saved?.voice??1};
}
const SAMPLES=['cursor','select','reward','open','close','error','score-hit','critical','whoosh','overdrive'];
export function audioScene(game,view,animating=false){
 return {key:MUSIC,live:true};
}
// One audio context, smooth music transitions, bounded effect voices, no autoplay.
export class StageAudio extends ResolutionAudio{
 constructor(enabled,host=globalThis,playlist=PLAYLIST){
  super(enabled,host);this.playlist=playlist;this.tracks=new Map();this.buffers=new Map();this.pending=new Set();
  this.failed=new Set();this.queue=[];this.scene={key:this.nextTrack(),live:true};this.unlocked=false;this.duckTimer=null;this.ducked=false;
  this.levels=musicSettings();this.epoch=0;this.onSpeechDone=()=>this.unduck();
 }
 unlock(){
  super.unlock();if(!this.enabled()||!this.ctx)return;
  this.unlocked=true;this.mix();
  for(const name of SAMPLES)this.load(name);
 }
 async load(name){
  if(this.buffers.has(name)||this.pending.has(name)||!this.host.fetch)return;
  this.pending.add(name);
  try{const r=await this.host.fetch(new URL('./audio/'+name+'.mp3',import.meta.url));if(!r.ok)throw Error('audio');
   this.buffers.set(name,await this.ctx.decodeAudioData(await r.arrayBuffer()));
  }catch{}finally{this.pending.delete(name);}
 }
 nextTrack(){
  this.queue=this.queue.filter(key=>!this.failed.has(key));
  if(!this.queue.length){this.queue=this.playlist.filter(key=>!this.failed.has(key));for(let i=this.queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.queue[i],this.queue[j]]=[this.queue[j],this.queue[i]];}if(this.queue.length>1&&this.queue[0]===this.scene?.key)this.queue.push(this.queue.shift());}
  return this.queue.shift();
 }
 failedTrack(key){
  if(this.failed.has(key))return;
  this.failed.add(key);const track=this.tracks.get(key);track?.media.pause();
  if(track){track.gain.gain.cancelScheduledValues(this.ctx.currentTime);track.gain.gain.value=0;}
  if(this.scene.key===key){this.scene={key:this.nextTrack(),live:true};this.mix();}
 }
 setScene(){this.mix();}
 setLevels(levels){for(const k of ['music','effects','voice'])if(Number.isFinite(levels[k]))this.levels[k]=Math.max(0,Math.min(1,levels[k]));if(!this.levels.voice)this.cancelSpeech();this.mix();}
 track(key){
  if(!key)return null;
  if(this.tracks.has(key))return this.tracks.get(key);
  try{const media=new this.host.Audio(new URL('./audio/music/'+encodeURIComponent(key),import.meta.url).href);media.loop=false;media.preload='auto';media.onended=()=>{if(this.scene.key!==key)return;this.scene={key:this.nextTrack(),live:true};this.mix();};media.onerror=()=>this.failedTrack(key);
   const gain=this.ctx.createGain();gain.gain.value=0;const source=this.ctx.createMediaElementSource(media);source.connect(gain).connect(this.ctx.destination);
   const track={media,gain,source,pauseTimer:null,starting:false};this.tracks.set(key,track);return track;
  }catch{return null;}
 }
 mix(){
  if(!this.unlocked||!this.enabled())return;
  const active=this.track(this.scene.key);if(!active)return;
  for(const [key,t] of this.tracks){
   clearTimeout(t.pauseTimer);t.pauseTimer=null;
   const wanted=key===this.scene.key&&this.levels.music>0;
   const volume=wanted?MUSIC_GAIN*this.levels.music*(this.ducked?.5:1):0;
   const p=t.gain.gain;p.cancelScheduledValues(this.ctx.currentTime);p.setTargetAtTime(volume,this.ctx.currentTime,.18);
   if(wanted&&t.media.paused&&!t.starting){
    t.starting=true;const epoch=this.epoch;
    Promise.resolve(t.media.play()).then(()=>{if(epoch!==this.epoch||!this.enabled())t.media.pause();}).catch(e=>{if(e?.name==='NotSupportedError')this.failedTrack(key);}).finally(()=>{t.starting=false;});
   }
   if(!wanted)t.pauseTimer=setTimeout(()=>{t.media.pause();t.pauseTimer=null;},900);
  }
 }
 duck(ms=2600){clearTimeout(this.duckTimer);this.ducked=true;this.mix();this.duckTimer=setTimeout(()=>this.unduck(),ms);}
 unduck(){clearTimeout(this.duckTimer);this.duckTimer=null;this.ducked=false;this.mix();}
 sample(name,volume=.4,rate=1){
  if(!this.enabled()||this.levels.effects<=0||this.ctx?.state!=='running'||this.nodes.size>=24)return;
  const buffer=this.buffers.get(name);if(!buffer){this.load(name);return;}
  try{const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=buffer;source.playbackRate.value=rate;
   gain.gain.value=volume*this.levels.effects;source.connect(gain).connect(this.ctx.destination);this.nodes.add(source);
   source.onended=()=>{source.disconnect();gain.disconnect();this.nodes.delete(source);};source.start();
  }catch{}
 }
 tone(hz,end,duration,volume,type='sine',offset=0){if(this.levels.effects<=0)return;super.tone(hz,end,duration,volume*this.levels.effects,type,offset);}
 ui(action){
  const name=['close','dismiss-result','back'].includes(action)?'close':action.startsWith('choose-')?'reward':
   ['ready','start','solo','resume','create','join'].includes(action)?'select':
   ['tile','inspect-inventory','inspect-offer','show-details','rules','profile'].includes(action)?'open':'cursor';
  this.sample(name,.38);
 }
 song(number,last=false){
  if(!this.enabled())return;
  this.tone(65,32,.45,.15);this.sample('select',.35);
  if(!this.levels.voice)return;
  const en=getLanguage()==='en',words=en?['','one','two','three','four','five']:['','un','deux','trois','quatre','cinq'];this.duck(1700);
  this.speak(last?(en?'Last song!':'Dernière chanson !'):(en?'Song ':'Chanson ')+(words[number]||number)+'!',{volume:this.levels.voice,lang:locale(),pitch:.5,rate:1.12});
 }
 announce(name){
  if(!this.enabled())return;
  if(!this.levels.voice){this.tone(105,36,.4,.13,'sawtooth');return;}
  this.duck(2800);super.announce(name,this.levels.voice);
 }
 deal(){if(this.enabled())this.tone(240,95,.045,.035,'triangle');}
 hit(index){super.hit(index);this.sample('score-hit',.34,1+index*.025);}
 critical(rank){this.sample('critical',.38+rank*.035,1+rank*.04);}
 verdict(text){
  if(!this.enabled()||!this.levels.voice||!text)return;
  this.duck(2000);this.speak(announcement(text),{volume:this.levels.voice,lang:locale(),pitch:.5,rate:.95});
 }

 transfer(){super.transfer();this.sample('whoosh',.44);}
 boom(){super.boom();}
 overdrive(level){this.sample('overdrive',.55,.86);if(this.levels.voice){this.duck(1700);this.speak(level===2?'Double overdrive!':'Overdrive!',{volume:this.levels.voice,pitch:.3,rate:1.05});}}
 stop(){super.stop();this.unduck();}
 suspend(){
  this.epoch++;super.stop();clearTimeout(this.duckTimer);this.duckTimer=null;this.ducked=false;
  for(const t of this.tracks.values()){clearTimeout(t.pauseTimer);t.pauseTimer=null;t.media.pause();t.gain.gain.cancelScheduledValues(this.ctx.currentTime);t.gain.gain.value=0;}
 }
}
