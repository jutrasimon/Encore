import test from 'node:test';import assert from 'node:assert/strict';
import {translate,setLanguage,getLanguage,locale,announcement} from '../dist/i18n.js?v=0.10.1';
import {TILES,SHOWS} from '../dist/engine.js';
import english from '../dist/locales/en.js';
test('French remains the default and unsupported locales fall back safely',()=>{setLanguage('unknown');assert.equal(getLanguage(),'fr');assert.equal(translate('MONTER SUR SCÈNE'),'MONTER SUR SCÈNE');assert.equal(locale(),'fr-CA');});
test('all tile names, rules and show content have complete English catalog entries',()=>{for(const tile of Object.values(TILES)){assert(english[tile.name],tile.name);assert(english[tile.text],tile.text);assert.equal(translate(tile.text,'en'),english[tile.text]);}for(const show of SHOWS){assert(english[show.name]);assert(english[show.crowd]);}});
test('translation preserves values, codes and unmatched stage names',()=>{assert.equal(translate('0/3 catégories complétées','en'),'0/3 categories completed');assert.equal(translate('MiamMiam A7C90F','en'),'MiamMiam A7C90F');assert.equal(translate('ENCORE!','en'),'ENCORE!');assert.equal(translate('Encore 2 catégories à compléter.','en'),'2 categories left to complete.');assert.equal(translate('QUALITÉ 34 / 70','en'),'QUALITY 34 / 70');});
test('locale selection affects announcements and returns to French',()=>{setLanguage('en');assert.equal(locale(),'en-CA');assert.equal(announcement('GREAT!'),'GREAT!');setLanguage('fr');assert.equal(announcement('GREAT!'),'SUPER !');});

test('localized detailed tile markup uses complete sentences and preserves rule data',async()=>{const {tileDetails}=await import('../dist/tile-ui.js');const before=JSON.stringify(TILES);try{setLanguage('en');const html=tileDetails({kind:'pick'});assert(html.includes('Adjacent'));assert(html.includes('before multipliers.'));assert(!html.includes('adjacentes gagnent'));}finally{setLanguage('fr');}assert.equal(JSON.stringify(TILES),before);});
