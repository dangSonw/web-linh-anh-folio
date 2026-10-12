import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import AboutMe from './pages/AboutMe.jsx';
import Home from './pages/Home.jsx';
import PortfolioHeader from './components/PortfolioHeader.jsx';

export default function App() {
  const location = useLocation();
  const startedAtHome = useRef(window.location.pathname === '/').current;
  const reduceMotion = useReducedMotion();
  const isAboutPage = location.pathname === '/about-me';

  if (!startedAtHome && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-stage">
      <div className={`app-shell app-shell--${isAboutPage ? 'about' : 'home'}`}>
        <PortfolioHeader activePage="about-me" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className={`route-layer route-layer--${isAboutPage ? 'about' : 'home'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/about-me" element={<AboutMe />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
