import test from 'node:test';
import assert from 'node:assert/strict';
import {TILES} from '../dist/engine.js';
import {hasTileArt} from '../dist/art.js';
import {tileCard,tileDetails,familyReference} from '../dist/tile-ui.js';

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
