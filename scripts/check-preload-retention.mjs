// Run against Vite dev: module imports expose the actual preload implementation.
// WeakRefs observe retained Image objects without retaining them in the audit.
import { mkdir, writeFile } from 'node:fs/promises';
const pw = await import(process.argv[2] || 'playwright');
const browser = await pw.chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
await page.addInitScript(() => {
  const NativeImage = window.Image;
  const NativeMap = window.Map;
  window.__preloadRefs = [];
  window.__cacheRefs = [];
  window.Map = new Proxy(NativeMap, { construct(target, args) {
    const map = Reflect.construct(target, args);
    window.__cacheRefs.push(new WeakRef(map));
    return map;
  } });
  window.Image = new Proxy(NativeImage, { construct(target, args) {
    const image = Reflect.construct(target, args);
    window.__preloadRefs.push(new WeakRef(image));
    return image;
  } });
});
const cdp = await page.context().newCDPSession(page);
await cdp.send('Performance.enable');
const snapshots = [];
async function sample(step) {
  await page.waitForTimeout(100);
  await cdp.send('HeapProfiler.collectGarbage');
  const images = await page.evaluate(() => window.__preloadRefs.map(ref => ref.deref()).filter(Boolean)
    .map(i => ({ src: i.currentSrc || i.src, width: i.naturalWidth, height: i.naturalHeight })));
  const assetCacheSizes = await page.evaluate(() => window.__cacheRefs.map(ref => ref.deref()).filter(map =>
    map && map.size && [...map.keys()].every(key => typeof key === 'string' && key.startsWith('/assets/'))).map(map => map.size));
  const metrics = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  snapshots.push({ step, assetCacheSizes, retainedImages: images.length, retainedMediaImages: images.filter(i => i.src && i.width && i.height).length,
    uniqueSources: new Set(images.map(i => i.src).filter(Boolean)).size,
    naturalPixelRGBAEstimateMiB: images.reduce((n, i) => n + i.width * i.height * 4, 0) / 1048576,
    jsHeapMiB: metrics.JSHeapUsedSize / 1048576, images });
}
try {
  await page.goto(process.env.QA_URL || 'http://127.0.0.1:5178/');
  await sample('home');
  for (let round = 0; round < (process.argv[3] === 'after' ? 20 : 6); round++) {
    await page.setViewportSize({ width: 1280 + round * 13, height: 800 + round * 7 });
    await page.evaluate(async () => {
      const { preloadRoute } = await import('/src/lib/routeAssets.js');
      for (const route of ['/scouting', '/impact-leadership', '/inside-the-cells', '/world']) await preloadRoute(route);
    });
    await sample(`preload-after-resize-${round + 1}`);
  }
  const report = { phase: process.argv[3] || 'audit', note: 'Natural pixel RGBA is a workload estimate, not measured resident browser/GPU RAM. Empty image wrappers are counted separately from retained media.',
    errors, snapshots: snapshots.map(s => ({ ...s, images: s.images.filter(i => i.src) })) };
  const directory = new URL('../design/resource-health/', import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL(`${report.phase}-preload.json`, directory), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ errors, snapshots: snapshots.map(({ images, ...s }) => s) }, null, 2));
  if (errors.length) throw new Error('Runtime/network errors');
  if (process.argv[3] === 'after' && (snapshots.some(s => s.retainedMediaImages > 0 || s.assetCacheSizes.some(size => size > 128)) || !snapshots.at(-1).assetCacheSizes.includes(128)))
    throw new Error('Preload retains media or exceeds its bounded cache after completion');
} finally { await browser.close(); }
