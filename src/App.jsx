import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AboutMe from './pages/AboutMe.jsx';
import Home from './pages/Home.jsx';
import Scouting from './pages/Scouting.jsx';
import InsideTheCells from './pages/InsideTheCells.jsx';
import PortfolioHeader from './components/PortfolioHeader.jsx';
import GroupBackdrop from './components/GroupBackdrop.jsx';
import { preloadRoute } from './lib/routeAssets.js';
import { legacyDestination } from './lib/pageGroups.js';

function pageKind(path) {
  return path === '/about-me' ? 'about' : path.startsWith('/scouting') ? 'scouting'
    : path.startsWith('/impact-leadership') ? 'impact' : path.startsWith('/inside-the-cells') ? 'inside' : 'home';
}
function LegacyRoute() {
  return <Navigate to={legacyDestination(useLocation().pathname)} replace />;
}
function PageFrame({ location, reduceMotion }) {
  const present = useIsPresent();
  const kind = pageKind(location.pathname);
  const scrolling = ['scouting', 'impact', 'inside'].includes(kind);
  return <motion.div className={`app-shell app-shell--${kind}${scrolling ? ' app-shell--scrolling' : ''}`}
    data-route={location.pathname} inert={!present} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    style={{ pointerEvents: present ? 'auto' : 'none', ...(scrolling ? { position: present ? 'relative' : 'absolute', top: 0 } : {}) }}>
    <div className={`route-layer route-layer--${kind}`}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/about-me" element={<AboutMe />} />
        <Route path="/scouting" element={<Scouting />} />
        <Route path="/scouting/:topic" element={<LegacyRoute />} />
        <Route path="/impact-leadership" element={<InsideTheCells group="impact" />} />
        <Route path="/inside-the-cells" element={<InsideTheCells />} />
        <Route path="/inside-the-cells/*" element={<LegacyRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </motion.div>;
}
export default function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (location.pathname === displayLocation.pathname) { setDisplayLocation(location); return; }
    let cancelled = false;
    preloadRoute(location.pathname).then(() => { if (!cancelled) setDisplayLocation(location); });
    return () => { cancelled = true; };
  }, [location, displayLocation.pathname]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = displayLocation.hash ? document.getElementById(decodeURIComponent(displayLocation.hash.slice(1))) : null;
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [displayLocation.key, displayLocation.pathname, displayLocation.hash, reduceMotion]);
  const kind = pageKind(displayLocation.pathname);
  return <div className={`app-stage app-stage--${kind}`}>
    <GroupBackdrop kind={kind} />
    <div className={`portfolio-header-shell portfolio-header-shell--${kind}`}><PortfolioHeader /></div>
    <div className={`page-transitions page-transitions--${kind}`} aria-busy={location.pathname !== displayLocation.pathname}>
      <AnimatePresence mode="sync" initial={false}><PageFrame key={displayLocation.pathname} location={displayLocation} reduceMotion={reduceMotion} /></AnimatePresence>
    </div>
  </div>;
}
