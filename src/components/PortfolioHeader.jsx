import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PortfolioHeader.css';
import { preloadRoute } from '../lib/routeAssets.js';

const baseItems = [
  { label: 'About Me', asset: 'nav-about-gold.svg', to: '/about-me' },
  { label: 'Scouting for pollens', asset: 'nav-scouting.svg', to: '/scouting' },
  { label: 'Inside the cells', asset: 'nav-inside.svg', to: '/#inside-the-cells' },
  { label: 'World', asset: 'nav-world.svg', to: '/#world' },
];

export default function PortfolioHeader() {
  const location = useLocation();
  const isScoutingRoute = location.pathname.startsWith('/scouting');
  const items = isScoutingRoute
    ? baseItems.map((item, index) => index === 2
      ? { ...item, label: 'BUILDING MY HIVE', asset: 'nav-building-my-hive.svg' }
      : item)
    : baseItems;
  const navRef = useRef(null);
  const linkRefs = useRef([]);
  const routeIndex = isScoutingRoute ? 1 : items.findIndex((item) => item.to === location.pathname);
  const hashIndex = items.findIndex((item) => item.to === `/#${location.hash.slice(1)}`);
  const currentIndex = routeIndex >= 0 ? routeIndex : hashIndex;
  const [selectedIndex, setSelectedIndex] = useState(routeIndex >= 0 ? routeIndex : null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [pill, setPill] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const displayedIndex = hoverIndex ?? selectedIndex;

  useLayoutEffect(() => {
    const pageIndex = location.pathname.startsWith('/scouting')
      ? 1
      : baseItems.findIndex((item) => item.to === location.pathname);
    setSelectedIndex(location.pathname === '/' ? null : pageIndex >= 0 ? pageIndex : 0);
    setHoverIndex(null);
  }, [location.hash, location.pathname]);

  const movePill = useCallback((index) => {
    const link = linkRefs.current[index];
    const nav = navRef.current;
    if (!link || !nav) return;

    const linkRect = link.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setPill({
      left: linkRect.left - navRect.left,
      top: linkRect.top - navRect.top,
      width: linkRect.width,
      height: linkRect.height,
    });
  }, []);

  useLayoutEffect(() => {
    if (displayedIndex === null) return undefined;
    const update = () => movePill(displayedIndex);
    update();

    const observer = new ResizeObserver(update);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [displayedIndex, movePill]);

  return (
    <header className="portfolio-header">
      <Link className="portfolio-brand" to="/" aria-label="Linh Anh’s Portfolio, home">
        <img src="/assets/home/type/nav-brand.svg" alt="" />
      </Link>

      <nav
        className="portfolio-nav"
        aria-label="Portfolio sections"
        ref={navRef}
        onMouseLeave={() => setHoverIndex(null)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHoverIndex(null);
        }}
      >
        <span
          className={`portfolio-nav__pill${displayedIndex === null ? '' : ' is-visible'}`}
          aria-hidden="true"
          style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height }}
        />
        {items.map((item, index) => (
          <Link
            className={`portfolio-nav__link${index === displayedIndex ? ' is-selected' : ''}`}
            to={item.to}
            key={item.to}
            ref={(node) => { linkRefs.current[index] = node; }}
            aria-current={index === currentIndex ? 'page' : undefined}
            onMouseEnter={() => { setHoverIndex(index); preloadRoute(item.to); }}
            onFocus={() => preloadRoute(item.to)}
            onClick={() => setSelectedIndex(index)}
          >
            <img src={`/assets/home/type/${item.asset}`} alt="" />
            <span className="portfolio-visually-hidden portfolio-nav__text">{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
