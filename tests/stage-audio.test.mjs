import test from 'node:test';
import assert from 'node:assert/strict';
import {StageAudio,audioScene} from '../dist/stage-audio.js';
function fixture(){
 const utterances=[],media=[];let enabled=true;
 const param=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(v){this.value=v;}});
 const ctx={state:'running',currentTime:1,createGain(){return {gain:param(),connect(){return this;}};},createMediaElementSource(){return {connect(target){return target;}};}};
 const host={Audio:class{constructor(src){this.src=src;this.paused=true;this.calls=0;media.push(this);}play(){this.paused=false;this.calls++;return Promise.resolve();}pause(){this.paused=true;}},speechSynthesis:{speak:u=>utterances.push(u),cancel(){},getVoices:()=>[{lang:'en-US',name:'David'},{lang:'fr-CA',name:'Claude'}]},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 const audio=new StageAudio(()=>enabled,host);audio.ctx=ctx;
 return {audio,media,utterances,mute(){enabled=false;audio.suspend();}};
}
test('menus and choices stay calm, every song uses the supplied soft backing track',()=>{
 for(const view of ['settings','inventory','stats','draft','rewards'])assert.equal(audioScene({phase:'show',show:0,round:1},view).live,false);
 for(const phase of ['lobby','draft','reward'])assert.equal(audioScene({phase,show:0,round:1},'game').live,false);
 assert.equal(audioScene(null,'game').key,'backstage.mp3');
 assert.equal(new Set([1,2,3].map(round=>audioScene({phase:'draft',show:0,round},'game',true).key)).size,1);
});
test('no autoplay, repeated renders keep music position, voice ducks and restores music',async()=>{
 const {audio,media,utterances,mute}=fixture();audio.setScene({key:'backstage.mp3',live:false});assert.equal(media.length,0);
 audio.unlocked=true;audio.mix();await Promise.resolve();await Promise.resolve();
 const before=audio.tracks.get('backstage.mp3').gain.gain.value;
 for(let n=0;n<10;n++)audio.setScene({key:'backstage.mp3',live:false});assert.equal(media.length,1);assert.equal(media[0].calls,1);
 audio.song(2);assert.equal(utterances.at(-1).text,'Song two!');assert.equal(utterances.at(-1).lang,'en-US');assert.ok(audio.tracks.get('backstage.mp3').gain.gain.value<before);
 utterances.at(-1).onend();assert.equal(audio.tracks.get('backstage.mp3').gain.gain.value,before);mute();
});
test('mute silences every track and clears delayed fades, re-enable uses retained scene',async()=>{
 const {audio,media,mute}=fixture();audio.unlocked=true;audio.mix();audio.setScene({key:'show-fight.mp3',live:true});
 mute();await Promise.resolve();assert.ok(media.every(m=>m.paused));
 for(const t of audio.tracks.values()){assert.equal(t.gain.gain.value,0);assert.equal(t.pauseTimer,null);}
 assert.equal(audio.duckTimer,null);
});
test('zero voice prevents announcements and unavailable browser audio does not block a song',()=>{
 const {audio,utterances,mute}=fixture();audio.setLevels({voice:0,music:0});audio.song(1);audio.announce('Simon');assert.equal(utterances.length,0);mute();
 const unavailable=new StageAudio(()=>true,{});unavailable.unlock();unavailable.song(3);unavailable.setScene({key:'backstage.mp3',live:false});unavailable.suspend();
});
