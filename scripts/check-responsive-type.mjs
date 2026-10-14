// Dev server must be running. Optional arguments: Playwright module URL, browser name.
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
const playwright = await import(process.argv[2] || 'playwright');
const engine = process.argv[3] || 'chromium';
const browser = await playwright[engine].launch({ headless: true, ...(engine === 'chromium' ? { channel: 'chrome' } : {}) });
const url = process.env.QA_URL || 'http://localhost:5177/';
const out = new URL('../design/compatibility-qa/', import.meta.url);
await mkdir(out, { recursive: true });
const routes = ['/', '/about-me', '/scouting', '/impact-leadership', '/inside-the-cells', '/world'];
const sizes = [[375,812],[420,896],[600,800],[601,800],[768,1024],[880,900],[881,900],[1024,640],
  [1200,800],[1280,800],[1440,900],[1440,1168],[1512,982],[1728,1117],[1800,1169],[1920,1080],
  [1920,1200],[2048,1280],[2560,1440],[2560,1600],[3440,1440],[3840,2160],[1080,1920],
  [906,982],[1440,600],[1920,600],[3840,1080]];
const errors = [], results = [], reducedMotionNotices = [];
// Old WebKit rounds an SVG's naturalWidth/Height at its rendered size.
// Compare with original SVG geometry instead of that rounded browser value.
const svgRatios = {};
async function readSvgRatios(directory, prefix='/assets') {
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) await readSvgRatios(path, `${prefix}/${entry.name}`);
    else if (entry.name.endsWith('.svg')) {
      const root = (await readFile(path,'utf8')).match(/<svg[^>]*>/s)?.[0];
      const width = Number(root?.match(/\bwidth="([\d.]+)"/)?.[1]);
      const height = Number(root?.match(/\bheight="([\d.]+)"/)?.[1]);
      if (width && height) svgRatios[`${prefix}/${entry.name}`] = width/height;
    }
  }
}
await readSvgRatios(new URL('../public/assets/',import.meta.url));
let browserInfo;
let auditPage;
const collect = page => {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {
    if (!['error','warning'].includes(m.type())) return;
    if (m.text().startsWith('You have Reduced Motion enabled on your device.')) reducedMotionNotices.push(m.text());
    else errors.push(m.text());
  });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
};
const settle = async page => {
  await page.waitForFunction(() => document.querySelectorAll('.app-shell:not([inert])').length === 1);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode()));
  });
};
async function navigate(page, route) {
  await page.evaluate(route => { history.pushState(null, '', route); dispatchEvent(new PopStateEvent('popstate')); }, route);
  await page.waitForSelector(`.app-shell[data-route="${route}"]:not([inert])`);
  await settle(page);
}
async function measure(page, width, height, dpr, route) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(80);
  const layout = await page.evaluate(() => {
    const root = document.documentElement;
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
    };
    const visible = element => getComputedStyle(element).display !== 'none' && element.getClientRects().length > 0 && element.getBoundingClientRect().width > 1;
    const labels = [...document.querySelectorAll('.inside-node--text > img')].filter(visible).map(img => {
      const slot = img.parentElement, fitted = slot.closest('.inside-detail-panel') && getComputedStyle(slot).position === 'relative';
      return { id:slot.dataset.node, ...rect(img), slot:rect(slot), fitted, transform:getComputedStyle(img).transform };
    });
    const pairs = [...document.querySelectorAll('.inside-overview-link')].map(link => {
      const imgs = [...link.querySelectorAll('.inside-node--text > img')].filter(visible);
      return imgs.length > 1 ? { title:rect(imgs[0]), caption:rect(imgs[1]) } : null;
    }).filter(Boolean);
    const menu = [...document.querySelectorAll('.portfolio-nav__link > img:not(.portfolio-nav__chevron)')].filter(visible).map(img => ({
      ...rect(img), link:rect(img.parentElement), expected:Number(img.style.getPropertyValue('--label-width')) * document.querySelector('.portfolio-header-shell').getBoundingClientRect().width / 1440,
      sourceRatio:window.__svgRatios[img.getAttribute('src')], transform:getComputedStyle(img).transform,
    }));
    const scout = [...document.querySelectorAll('.scouting-outline > img, .scouting-flower-art, .scouting-arrow')].filter(visible).map(img => ({ ...rect(img), sourceRatio:window.__svgRatios[img.getAttribute('src')], transform:getComputedStyle(img).transform }));
    return { client:root.clientWidth, scroll:root.scrollWidth, labels,pairs,menu,scout };
  });
  const tag = `${engine} ${route} ${width}x${height} @${dpr}`;
  assert(layout.scroll <= layout.client, `Overflow ${tag}`);
  if (width > 880) {
    for (const label of layout.labels) {
      assert.equal(label.transform, 'none', `SVG uses transform ${tag}`);
      if (!label.fitted) assert(Math.abs(label.width-label.slot.width) < .75, `Text/slot mismatch ${tag} ${label.id}`);
    }
    for (const {title,caption} of layout.pairs) assert(caption.y >= title.bottom - .5, `Title covers caption ${tag}`);
    for (const item of layout.menu) {
      assert.equal(item.transform, 'none', `Menu scaled twice ${tag}`);
      assert(item.x >= item.link.x-1 && item.right <= item.link.right+1, `Menu clipping ${tag}`);
      assert(item.width <= item.expected+1 && item.width >= item.expected*.88, `Menu ratio ${tag}`);
      assert(Math.abs(item.width/item.height-item.sourceRatio) < .06, `Menu distortion ${tag} ${JSON.stringify(item)}`);
    }
    for (const item of layout.scout) assert(Math.abs(item.width/item.height-item.sourceRatio) < .08, `Scouting distortion ${tag}`);
  }
  results.push({ route,width,height,dpr,...layout });
}
try {
  for (const dpr of process.env.QA_INTERACTIONS_ONLY ? [] : [1,2,3]) {
    const page = await browser.newPage({ viewport:{width:1440,height:1168},deviceScaleFactor:dpr,reducedMotion:'reduce' });
    collect(page);
    await page.goto(url); await settle(page);
    await page.evaluate(ratios=>window.__svgRatios=ratios,svgRatios);
    browserInfo ||= await page.evaluate(() => ({ ua:navigator.userAgent, typedDivision:CSS.supports('transform','scale(calc(100cqw / 1440px))') }));
    await page.evaluate(() => window.__headerIdentity = document.querySelector('.portfolio-header'));
    for (const route of routes) {
      await navigate(page, route);
      assert(await page.evaluate(() => window.__headerIdentity === document.querySelector('.portfolio-header')), 'Header remounted');
      for (const [width,height] of dpr === 1 ? sizes : dpr === 2 ? [[1280,800],[1440,900],[1512,982],[1728,1117],[1920,1200]] : [[420,896]]) {
        await measure(page,width,height,dpr,route);
        if (dpr===1 && [375,1512].includes(width)) await page.screenshot({ path:new URL(`${engine}${process.env.QA_LABEL || ''}-${route.replaceAll('/','_') || 'home'}-${width}.png`,out).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true });
      }
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport:{width:1512,height:982},reducedMotion:'reduce' });
  auditPage = page;
  collect(page); await page.goto(url); await settle(page);
  await page.evaluate(ratios=>window.__svgRatios=ratios,svgRatios);
  await navigate(page,'/impact-leadership'); await measure(page,1512,982,1,'/impact-leadership');
  // A browser rejecting the old unit-divided transforms must produce identical geometry.
  const before = await page.locator('.group-artwork-decoration .inside-overview-link img').evaluateAll(imgs=>imgs.map(i=>[i.getBoundingClientRect().width,i.getBoundingClientRect().height]));
  await page.addStyleTag({content:'.inside-node--text > img,.portfolio-nav__link img,.scouting-outline,.scouting-callout,.scouting-flower-art,.scouting-arrow {transform:none!important}'});
  const after = await page.locator('.group-artwork-decoration .inside-overview-link img').evaluateAll(imgs=>imgs.map(i=>[i.getBoundingClientRect().width,i.getBoundingClientRect().height]));
  assert.deepEqual(before,after);
  await page.locator('.portfolio-nav__group > button').focus(); await page.keyboard.press('Enter');
  await page.waitForSelector('#portfolio-inside-options'); await page.keyboard.press('Escape');
  assert.equal(await page.locator('#portfolio-inside-options').count(),0);
  await page.locator('.portfolio-nav__group > button').focus(); await page.keyboard.press('Enter');
  await page.locator('.portfolio-nav__link--world').focus();
  assert.equal(await page.locator('#portfolio-inside-options').count(),0,'Dropdown must close when focus leaves');
  await page.locator('.portfolio-nav__group > button').focus(); await page.keyboard.press('Enter');
  if (process.env.QA_INTERACTIONS_ONLY) await page.evaluate(()=>{
    window.__navEvents=[];
    for (const type of ['mousedown','focusout','mouseup','click']) document.addEventListener(type,event=>window.__navEvents.push({type,target:event.target.tagName,href:event.target.closest('a')?.getAttribute('href'),related:event.relatedTarget?.tagName,active:document.activeElement?.tagName}),true);
  });
  await page.locator('#portfolio-inside-options a[href="/inside-the-cells"]').click();
  console.log(engine, 'dropdown destination', page.url());
  await page.waitForSelector('.app-shell[data-route="/inside-the-cells"]');
  await page.goBack(); console.log(engine, 'Back', page.url()); await page.waitForSelector('.app-shell[data-route="/impact-leadership"]');
  await page.goForward(); console.log(engine, 'Forward', page.url()); await page.waitForSelector('.app-shell[data-route="/inside-the-cells"]');
  await page.reload(); await page.waitForSelector('.home-content');
  const direct=await browser.newPage(); collect(direct); await direct.goto(url+'impact-leadership'); await direct.waitForSelector('.home-content'); await direct.close();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.portfolio-nav__link[href="/scouting"]').click(); await page.waitForSelector('.app-shell[data-route="/scouting"]');
  await page.waitForTimeout(700); await settle(page);
  const touch = await browser.newPage({viewport:{width:420,height:896},hasTouch:true,isMobile:engine==='webkit',reducedMotion:'reduce'});
  collect(touch); await touch.goto(url); await settle(touch);
  await touch.locator('.portfolio-nav__link[href="/about-me"]').tap();
  await touch.waitForSelector('.app-shell[data-route="/about-me"]');
  await touch.locator('.portfolio-nav__group > button').tap();
  await touch.waitForSelector('#portfolio-inside-options');
  await touch.locator('#portfolio-inside-options a[href="/impact-leadership"]').tap();
  await touch.waitForSelector('.app-shell[data-route="/impact-leadership"]');
  await touch.close();
  assert.deepEqual(errors,[]);
  await writeFile(new URL(`${engine}${process.env.QA_LABEL || ''}-results.json`,out),JSON.stringify({browserInfo,cases:results.length,checks:{sourceRatios:true,captionSeparation:true,menuFits:true,sharedHeader:true,legacyTransformRejection:true,keyboardDropdown:true,focusExit:true,touchNavigation:true,backForward:true,reloadReset:true,reducedMotion:true},results,errors,reducedMotionNotices},null,2));
  console.log(`${engine}: ${results.length} viewport/DPR cases and navigation passed`);
} catch (error) {
  if (auditPage) console.error('Navigation diagnostics', await auditPage.evaluate(()=>({url:location.href,state:history.state,routes:[...document.querySelectorAll('.app-shell')].map(n=>({route:n.dataset.route,inert:n.inert,opacity:getComputedStyle(n).opacity})),busy:document.querySelector('.page-transitions').getAttribute('aria-busy'),events:window.__navEvents,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.currentSrc)})));
  throw error;
} finally { await browser.close(); }
