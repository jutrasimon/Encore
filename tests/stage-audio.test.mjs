import {setLanguage} from '../dist/i18n.js?v=0.9.23';
import test from 'node:test';
import assert from 'node:assert/strict';
import {StageAudio,audioScene,PLAYLIST,musicSettings} from '../dist/stage-audio.js';
function fixture(playlist=['one.mp3','two.mp3','three.mp3']){
 const utterances=[],media=[];let enabled=true;
 const param=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(v){this.value=v;}});
 const ctx={state:'running',currentTime:1,createGain(){return {gain:param(),connect(){return this;}};},createMediaElementSource(){return {connect(target){return target;}};}};
 const host={Audio:class{constructor(src){this.src=src;this.paused=true;this.calls=0;media.push(this);}play(){this.paused=false;this.calls++;return Promise.resolve();}pause(){this.paused=true;}},speechSynthesis:{speak:u=>utterances.push(u),cancel(){},getVoices:()=>[{lang:'en-US',name:'David'},{lang:'fr-CA',name:'Claude'}]},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 const audio=new StageAudio(()=>enabled,host,playlist);audio.ctx=ctx;
 return {audio,media,utterances,mute(){enabled=false;audio.suspend();}};
}
test('all screens retain a continuous folder-based playlist',()=>{
 for(const view of ['game','settings','inventory','stats','draft','rewards'])assert.equal(audioScene({phase:'show'},view).key,PLAYLIST[0]);
 const {audio,media,mute}=fixture();audio.unlocked=true;audio.mix();
 const first=audio.scene.key;audio.setScene(audioScene(null,'settings'));assert.equal(audio.scene.key,first);
 const played=[first];
 for(let i=0;i<2;i++){audio.tracks.get(audio.scene.key).media.onended();played.push(audio.scene.key);}
 assert.equal(new Set(played).size,3);mute();
});
test('50 percent music matches the old 5 percent gain and migrates saved settings once',()=>{
 assert.deepEqual(musicSettings(),{music:.5,effects:.85,voice:1});
 assert.deepEqual(musicSettings({music:.05,effects:.85,voice:1}),{music:.5,effects:.85,voice:1});
 const {audio,mute}=fixture();audio.unlocked=true;audio.setLevels({music:.5});
 assert.equal(audio.tracks.get(audio.scene.key).gain.gain.value,.04);mute();
});
test('final verdict is spoken verbatim, ducks music, and respects voice mute',()=>{
 const {audio,utterances,mute}=fixture();audio.unlocked=true;audio.mix();
 audio.verdict('FANTASTIC!');assert.equal(utterances.at(-1).text,'FANTASTIQUE !');assert.equal(audio.ducked,true);
 utterances.at(-1).onend();assert.equal(audio.ducked,false);
 audio.setLevels({voice:0});audio.verdict('GREAT!');assert.equal(utterances.length,1);mute();
});
test('missing music skips once; removing every track never loops or blocks effects',()=>{
 const {audio,media,mute}=fixture();audio.unlocked=true;audio.mix();
 for(let i=0;i<3;i++)audio.tracks.get(audio.scene.key).media.onerror();
 assert.equal(audio.scene.key,undefined);assert.equal(media.length,3);assert.ok(media.every(m=>m.paused));
 audio.mix();assert.equal(media.length,3);mute();
 const empty=fixture([]);empty.audio.unlocked=true;empty.audio.mix();assert.equal(empty.media.length,0);empty.mute();
});
test('one remaining song repeats without adding an undefined track',()=>{
 const {audio,media,mute}=fixture(['only.mp3']);audio.unlocked=true;audio.mix();
 for(let i=0;i<5;i++)media[0].onended();assert.equal(audio.scene.key,'only.mp3');assert.equal(media.length,1);mute();
});
test('final explosion has a long layered tail and a bounded filtered noise burst',()=>{
 const {audio,mute}=fixture();const tones=[];audio.tone=(...args)=>tones.push(args);
 const node=()=>({connect(next){return next;},disconnect(){},start(){},stop(){}});
 const param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 audio.ctx.sampleRate=1000;audio.ctx.createBuffer=(channels,length)=>({getChannelData:()=>new Float32Array(length)});
 audio.ctx.createBufferSource=node;audio.ctx.createBiquadFilter=()=>({...node(),frequency:param()});audio.ctx.createGain=()=>({...node(),gain:param()});
 audio.boom();assert.equal(tones.length,4);assert.ok(tones.some(t=>t[2]>=1.8));assert.equal(audio.nodes.size,1);
 const source=[...audio.nodes][0];source.onended();assert.equal(audio.nodes.size,0);
 audio.setLevels({effects:0});audio.boom();assert.equal(audio.nodes.size,0);mute();
});
test('no autoplay, repeated renders keep music position, voice ducks and restores music',async()=>{
 const {audio,media,utterances,mute}=fixture();audio.setScene({key:'backstage.mp3',live:false});assert.equal(media.length,0);
 audio.unlocked=true;audio.mix();await Promise.resolve();await Promise.resolve();
 const before=audio.tracks.get(audio.scene.key).gain.gain.value;
 for(let n=0;n<10;n++)audio.setScene({key:'backstage.mp3',live:false});assert.equal(media.length,1);assert.equal(media[0].calls,1);
 audio.song(2);assert.equal(utterances.at(-1).text,'Chanson deux!');assert.equal(utterances.at(-1).lang,'fr-CA');assert.ok(audio.tracks.get(audio.scene.key).gain.gain.value<before);
 utterances.at(-1).onend();assert.equal(audio.tracks.get(audio.scene.key).gain.gain.value,before);mute();
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

test('song announcements follow the selected language',()=>{const {audio,utterances,mute}=fixture();try{setLanguage('en');audio.song(2);assert.equal(utterances.at(-1).text,'Song two!');assert.equal(utterances.at(-1).lang,'en-US');}finally{setLanguage('fr');mute();}});
