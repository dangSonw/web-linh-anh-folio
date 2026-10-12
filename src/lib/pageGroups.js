import { insidePages } from '../data/insidePages.js';

export const impactPages = insidePages.filter(page => ['overview', 'scientific-exploration', 'cnn-vibrant-stage', 'community-leadership', 'american-250'].includes(page.key));
export const hivePages = ['bee-hives', 'bee-hives/fdb-talent', 'bee-hives/sim-lse', 'bee-hives/wico'].map(key => insidePages.find(page => page.key === key));
export function insideDestination(key) {
  if (key === 'overview') return '/impact-leadership';
  if (key.startsWith('bee-hives')) return key === 'bee-hives' ? '/inside-the-cells' : `/inside-the-cells#${key.split('/')[1]}`;
  return `/impact-leadership#${key}`;
}
export function legacyDestination(path) {
  if (path.startsWith('/scouting/')) return `/scouting#${path.split('/')[2]}`;
  const page = insidePages.find(page => page.path === path);
  return page ? insideDestination(page.key) : '/inside-the-cells';
}
