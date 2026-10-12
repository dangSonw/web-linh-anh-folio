export const scoutingBackdrop = '/assets/scouting/untitled-9-september-2026-14-47-00-1__63-49@4x.webp';
export const scoutingBackdropSrcSet = [1, 2, 4]
  .map(scale => scoutingBackdrop.replace('@4x.webp', `@${scale}x.webp`) + ` ${1440 * scale}w`)
  .join(', ');
export const scoutingBackdropSizes = '(max-width: 880px) calc(100vw - 36px), min(100vw, 2560px, calc(100svh * 1440 / 1168))';
const scouting = '/assets/scouting/';
const home = '/assets/home/';
const assets = {
  '/': [
    home + 'type/hero-title.svg',
    home + 'beehive-of-linh-anh-1__63-15@4x.png',
    home + 'untitled-9-september-2026-14-47-00-1__63-2@4x.png',
    home + 'linh-anh-tab2-1__54-3@4x.png',
    home + 'untitled-8-september-2026-15-35-24-1__54-5@4x.png',
    ...['about', 'scouting', 'inside', 'world'].map(name => home + 'type/card-' + name + '.svg'),
  ],
  '/about-me': [
    '/assets/about/beehive-of-linh-anh-1__54-2@4x.png',
    '/assets/about/rectangle-66__26-58@4x.png',
    '/assets/about/type/building-title.svg',
    '/assets/about/type/about-title.svg',
  ],
  '/scouting': [
    scoutingBackdrop, home + 'type/nav-building-my-hive.svg',
    ...['01', '02', '03', '04', '05', '06'].map(id => scouting + 'vector-' + id + '.svg'),
    ...['vision-flower-label', 'side-interest-flower-label', 'art-flower-label', 'bee-scouting-title']
      .map(name => scouting + 'type/' + name + '.svg'),
    scouting + 'con-ong-anh-thu-2__63-117@4x.png',
  ],
  '/scouting/vision': [scoutingBackdrop, scouting + 'type/vision-tab-title.svg', scouting + 'type/background-tab-title.svg'],
  '/scouting/side-interest': [
    scoutingBackdrop, scouting + 'type/side-interest-tab-title.svg',
    ...['image-9__71-469', 'image-10__71-472', 'image-19__71-489', 'image-20__71-491']
      .map(name => scouting + name + '@4x.png'),
  ],
  '/scouting/art': [
    scoutingBackdrop, scouting + 'type/art-tab-title.svg',
    ...['image-11__71-478', 'image-12__71-479', 'image-13__71-481', 'image-14__71-483',
      'image-15__71-484', 'image-16__71-485', 'image-17__71-486', 'image-18__71-487']
      .map(name => scouting + name + '@4x.png'),
  ],
};
// Retain decoded images so the incoming route can fade in with every layer ready.
const loadedImages = new Map();
function preloadImage(src) {
  const responsive = src === scoutingBackdrop;
  const key = responsive ? `${src}:${innerWidth}:${innerHeight}:${devicePixelRatio}` : src;
  if (!loadedImages.has(key)) {
    loadedImages.set(key, new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      if (responsive) {
        image.srcset = scoutingBackdropSrcSet;
        image.sizes = scoutingBackdropSizes;
      }
      image.onload = async () => {
        await image.decode().catch(() => {});
        resolve(image);
      };
      image.onerror = () => { loadedImages.delete(key); resolve(image); };
      image.src = src;
    }));
  }
  return loadedImages.get(key);
}
export function preloadRoute(to) {
  const pathname = to.split('#')[0] || '/';
  return Promise.all((assets[pathname] ?? []).map(preloadImage));
}
