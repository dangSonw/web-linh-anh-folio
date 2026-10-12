import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { insidePages, insideSrcSet } from '../data/insidePages.js';
import { scoutingBackdrop, scoutingBackdropSrcSet } from '../lib/routeAssets.js';

export default function GroupBackdrop({ kind }) {
  const reduced = useReducedMotion();
  const src = kind === 'scouting' ? scoutingBackdrop : kind === 'impact' ? insidePages[0].background.src
    : kind === 'inside' ? insidePages.find(page => page.kind === 'hive').background.src : null;
  return <AnimatePresence initial={false}>{src && <motion.div className="group-backdrop" key={kind}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.4 }}>
    <img src={src} srcSet={kind === 'scouting' ? scoutingBackdropSrcSet : insideSrcSet(src)} sizes="100vw" alt="" />
  </motion.div>}</AnimatePresence>;
}
