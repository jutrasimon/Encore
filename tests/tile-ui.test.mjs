import test from 'node:test';
import assert from 'node:assert/strict';
import {TILES} from '../dist/engine.js';
import {hasTileArt} from '../dist/art.js';
import {tileCard,tileDetails,familyReference,tileProduction} from '../dist/tile-ui.js';

test('every tile has one registered atlas asset and the same square renderer for all screens',()=>{
 for(const [kind,d] of Object.entries(TILES)){
  assert(hasTileArt(kind),kind);const html=tileCard({kind,level:0});assert(html.includes('square-tile'));assert(html.includes(kind.startsWith('perc_')?'data-art-kind':'punk-stickers-v1.png'));assert(html.includes(d.name));assert(html.includes(d.family==='voice'?'VOIX':d.family==='guitar'?'GUITARE':d.family==='percussion'?'PERCUSSION':'EFFET'));
  const details=tileDetails({kind,level:2});assert(details.includes('tile-rule'));assert(details.includes('avant les multiplicateurs'));assert(!details.includes('undefined'));
 }
});
test('family references use the actual guitar and microphone artwork and explicit words',()=>{
 for(const family of ['guitar','voice']){const html=familyReference(family);assert(html.includes('punk-stickers-v1.png'));assert(html.includes(family==='voice'?'VOIX':'GUITARE'));}
 assert(tileDetails({kind:'voice'}).includes('Les micros comptent comme des voix'));
 const a=tileCard({kind:'voice'}),b=tileCard({kind:'voice'});assert.notEqual(a.match(/id="(sticker-crop-\d+)"/)[1],b.match(/id="(sticker-crop-\d+)"/)[1]);
});
test('upgrading shows the full effect and the correct type of permanent production boost',()=>{
 for(const [kind,stat] of [['pick','énergie'],['guitar','qualité'],['duck','fan']]){
  const html=tileDetails({kind,level:4},{upgrade:true});assert(html.includes('NIVEAU +4 →'));assert(html.includes('+5'));assert(html.includes('+1 '+stat));
 }
});

test('completed support tiles show zero while offers keep their effect summary',()=>{
 const tile={kind:'pick',q:0,e:0,f:0,m:1};
 const card=tileCard(tile,{resolved:true});
 assert(card.includes('<span class="tile-points"><span>0</span></span>'));
 assert(!card.includes('GUITARES +1'));
 assert(tileCard({kind:'pick'}).includes('GUITARES +1'));
 assert(tileDetails(tile,{resolved:true}).includes('CETTE CHANSON'));
 assert(tileDetails(tile,{resolved:true}).includes('tile-rule'));
 assert(!tileDetails({kind:'pick'}).includes('CETTE CHANSON'));
});
test('completed points and tooltip totals include repeats without applying multipliers twice',()=>{
 const t={kind:'perc_crash',q:8,e:4,f:1,m:4,mq:4,me:2,repeats:2};
 const values=tileProduction(t,true);
 for(const n of [24,12,3])assert(values.includes('>'+n+'</span>'));
 assert(tileDetails(t,{resolved:true}).includes(values));
 assert.equal(t.q,8);
});

test('completed board retains the same total as reveal while tooltips retain the breakdown',()=>{
 const t={kind:'perc_crash',q:8,e:4,f:1,m:4,repeats:2};
 const card=tileCard(t,{resolved:true,settled:true});
 assert(card.includes('tile-total-value total-quality">39</span>'));
 assert(tileDetails(t,{resolved:true}).includes(tileProduction(t,true)));
 assert(!tileCard(t,{resolved:true}).includes('tile-total-value'));
});
