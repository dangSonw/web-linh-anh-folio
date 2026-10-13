import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { insidePages, insideSrcSet } from '../data/insidePages.js';
import { scoutingBackdrop, scoutingBackdropSrcSet } from '../lib/routeAssets.js';
import { ScoutingArtwork } from '../pages/Scouting.jsx';
import { ImpactArtwork } from '../pages/InsideTheCells.jsx';
import { worldHive, worldHiveSrcSet } from '../pages/World.jsx';

export default function GroupBackdrop({ kind }) {
  const reduced = useReducedMotion();
  const src = kind === 'world' ? worldHive : kind === 'scouting' ? scoutingBackdrop : kind === 'impact' ? insidePages[0].background.src
    : kind === 'inside' ? insidePages.find(page => page.kind === 'hive').background.src : null;
  const ratio = kind === 'scouting' ? 1440 / 1044 : kind === 'impact' ? 1440 / 1045 : 1440 / 1022;
  return <AnimatePresence initial={false}>{src && <motion.div className="group-backdrop" key={kind}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.4 }}>
    {kind === 'world' ? <div className="world-backdrop"><img src={src} srcSet={worldHiveSrcSet} sizes="100vw"
      alt="A golden beehive hanging from a leafy branch" /></div> : <>
    <div className="group-backdrop-layer group-backdrop-layer--image">
    <img className="group-bleed-image" src={src} srcSet={kind === 'scouting' ? scoutingBackdropSrcSet : insideSrcSet(src)} sizes="100vw" alt="" />
    <div className="group-artwork" style={{ '--artwork-ratio': ratio }}>
      <img className="group-artwork-image" src={src} srcSet={kind === 'scouting' ? scoutingBackdropSrcSet : insideSrcSet(src)} sizes="100vw" alt="" />
    </div></div>
    <div className="group-backdrop-layer group-backdrop-layer--decoration"><div className="group-artwork" style={{ '--artwork-ratio': ratio }}>
      <div className="group-artwork-decoration">
        {kind === 'scouting' && <div className="scouting-page"><ScoutingArtwork /></div>}
        {kind === 'impact' && <div className="inside-page"><ImpactArtwork /></div>}
      </div>
    </div></div>
    </>}
  </motion.div>}</AnimatePresence>;
}
