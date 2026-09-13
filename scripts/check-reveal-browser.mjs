// Run against a local test server; each case uses a fresh profile and a disposable solo.
// PLAYWRIGHT_MODULE may point to an existing Playwright installation.
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
const url=process.argv[2]||'http://127.0.0.1:8000/';
await mkdir('test-results',{recursive:true});
try{
 for(const [width,height,role] of [[500,920,'guitarist-singer'],[320,700,'drummer-percussionist']]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.locator('#name').fill('QA Reveal');
  await page.locator('[data-action=solo]').click();await page.locator(`[data-class="${role}"]`).click();
  await page.locator('#details [data-action=ready]').click();
  await page.waitForFunction(()=>document.querySelector('.console')?.dataset.resolution==='intro');
  await page.waitForTimeout(150);
  const intro=await page.locator('.resolution-pop').evaluate(el=>{
   const rect=el.getBoundingClientRect(),phone=el.closest('.console').getBoundingClientRect();
   return {distance:Math.abs((rect.top+rect.bottom-phone.top-phone.bottom)/2),height:phone.height,
    animation:getComputedStyle(el).animationName,font:parseFloat(getComputedStyle(el.querySelector('strong')).fontSize)};
  });
  assert(intro.distance<intro.height*.18,JSON.stringify(intro));
  assert.match(intro.animation,/stage-slam/);assert(intro.font>=40,JSON.stringify(intro));
  await page.screenshot({path:`test-results/reveal-intro-${width}.png`});
  await page.waitForFunction(()=>document.querySelector('.console')?.dataset.resolution==='charge');
  const edge=await page.locator('.console').evaluate(el=>{
   const phone=el.getBoundingClientRect(),stage=el.querySelector('.show-visual').getBoundingClientRect(),tally=el.querySelector('.resolution-tally').getBoundingClientRect();
   return {left:stage.left-(phone.left+el.clientLeft),right:stage.right-(phone.left+el.clientLeft+el.clientWidth),
    bottom:stage.bottom-(phone.top+el.clientTop+el.clientHeight),gap:stage.top-tally.bottom};
  });
  for(const side of ['left','right','bottom'])assert(Math.abs(edge[side])<=1,JSON.stringify(edge));
  assert(edge.gap>=0&&edge.gap<=8,JSON.stringify(edge));
  assert.equal(await page.locator('.case-version').isVisible(),false);
  assert.equal(await page.locator('.navigation').isVisible(),false);
  await page.screenshot({path:`test-results/reveal-stage-${width}.png`});
  await page.waitForFunction(()=>!document.querySelector('.resolution-mode'));
  assert.equal(await page.locator('.grid .tile').count(),9);
  assert.equal(await page.locator('.navigation').isVisible(),true);
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('Reveal: central animated names, stage reaches phone edges, navigation restored after song.');
}finally{await browser.close();}
