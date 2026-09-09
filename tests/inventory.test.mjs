import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,player,tile,command,normalizeGame} from '../dist/engine.js';
import {inventoryMarkup,orderedInventory} from '../dist/inventory-ui.js';

const act=(g,type,extra={})=>command(g,'a',{type,revision:g.revision,show:g.show,round:g.round,...extra},42);

test('exhausted copies cannot receive focus, including through a direct game command',()=>{
 const g=newGame();g.players=[player('a','A')];g.players[0].inventory[0].exhausted=true;
 const before=structuredClone(g);
 assert.throws(()=>act(g,'focus',{tileId:'a-0'}),/épuisée/);
 assert.deepEqual(g,before);
});

test('a one-use tile releases its focus immediately after the song',()=>{
 let g=newGame();g.players=[player('a','A')];g=act(g,'start');
 g.players[0].inventory.push(tile('pedal','one-use'));
 g=act(g,'focus',{tileId:'one-use'});g=act(g,'ready');
 assert(g.players[0].inventory.find(t=>t.id==='one-use').exhausted);
 assert.deepEqual(g.players[0].focusedIds,[]);
 g=act(g,'focus',{tileId:'a-0'});
 assert.deepEqual(g.players[0].focusedIds,['a-0']);
});

test('old saves release unavailable focus and repair duplicate offers without removing inventory copies',()=>{
 const g=newGame();g.players=[player('a','A')];const p=g.players[0];
 p.inventory[0].exhausted=true;p.focusedIds=['a-0'];p.songOffers=['guitar','guitar','guitar'];
 const clean=normalizeGame(g).players[0];
 assert.deepEqual(clean.focusedIds,[]);assert.equal(new Set(clean.songOffers).size,3);
 assert.equal(clean.songOffers[0],'guitar');assert.equal(clean.inventory.filter(t=>t.kind==='guitar').length,2);
 assert.deepEqual(normalizeGame({ ...g,players:[clean]}).players[0],clean);
});

test('exhausted copies are displayed last while detail links retain original indices',()=>{
 const p=player('a','A');p.inventory[0].exhausted=true;p.inventory[3].exhausted=true;
 const before=structuredClone(p.inventory);
 assert.deepEqual(orderedInventory(p.inventory).map(x=>x.i),[1,2,4,0,3]);
 const html=inventoryMarkup(p);
 const cards=html.match(/<article\b[\s\S]*?<\/article>/g);
 assert.deepEqual(cards.map(c=>Number(c.match(/data-index="(\d+)"/)[1])),[1,2,4,0,3]);
 assert(cards.slice(0,3).every(c=>c.includes('data-action="focus"')));
 assert(cards.slice(3).every(c=>!c.includes('data-action="focus"')&&c.includes('ÉPUISÉE')));
 assert.deepEqual(p.inventory,before);
});
