import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AboutMe from './pages/AboutMe.jsx';
import Home from './pages/Home.jsx';
import Scouting from './pages/Scouting.jsx';
import InsideTheCells from './pages/InsideTheCells.jsx';
import { insidePages } from './data/insidePages.js';
import PortfolioHeader from './components/PortfolioHeader.jsx';
import { preloadRoute } from './lib/routeAssets.js';

function pageKind(pathname) {
  return pathname === '/about-me' ? 'about' : pathname.startsWith('/scouting') ? 'scouting' : pathname.startsWith('/inside-the-cells') ? 'inside' : 'home';
}

function PageFrame({ location, reduceMotion }) {
  const present = useIsPresent();
  const kind = pageKind(location.pathname);
  return (
    <motion.div
      className={`app-shell app-shell--${kind}`}
      data-route={location.pathname}
      inert={!present}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: present ? 'auto' : 'none', '--canvas-height': insidePages.find(page => page.path === location.pathname)?.height ?? 1168 }}
    >
      <div className={`route-layer route-layer--${kind}`}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about-me" element={<AboutMe />} />
          <Route path="/scouting" element={<Scouting />} />
          <Route path="/scouting/:topic" element={<Scouting />} />
          <Route path="/inside-the-cells/*" element={<InsideTheCells />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    let cancelled = false;
    preloadRoute(location.pathname).then(() => {
      if (!cancelled) setDisplayLocation(location);
    });
    return () => { cancelled = true; };
  }, [location]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [displayLocation.pathname]);

  return (
    <div className="app-stage">
      <div className={`portfolio-header-shell portfolio-header-shell--${pageKind(displayLocation.pathname)}`}><PortfolioHeader /></div>
      <div
        className={`page-transitions page-transitions--${pageKind(displayLocation.pathname)}`}
        aria-busy={location.pathname !== displayLocation.pathname}
        style={{ '--canvas-height': insidePages.find(page => page.path === displayLocation.pathname)?.height ?? 1168 }}
      >
        <AnimatePresence mode="sync" initial={false}>
          <PageFrame key={displayLocation.pathname} location={displayLocation} reduceMotion={reduceMotion} />
        </AnimatePresence>
      </div>
    </div>
  );
}
