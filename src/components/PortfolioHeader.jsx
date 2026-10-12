import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PortfolioHeader.css';

const items = [
  { label: 'About Me', asset: 'nav-about.svg', to: '/about-me' },
  { label: 'Scouting for pollens', asset: 'nav-scouting.svg', to: '/#scouting-for-pollens' },
  { label: 'Inside the cells', asset: 'nav-inside.svg', to: '/#inside-the-cells' },
  { label: 'World', asset: 'nav-world.svg', to: '/#world' },
];

export default function PortfolioHeader({ activePage = 'about-me' }) {
  const location = useLocation();
  const navRef = useRef(null);
  const linkRefs = useRef([]);
  const activeIndex = items.findIndex((item) => item.to === `/${activePage}`);
  const [selectedIndex, setSelectedIndex] = useState(activeIndex < 0 ? 0 : activeIndex);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [pill, setPill] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useLayoutEffect(() => {
    const hashIndex = items.findIndex((item) => item.to === `/#${location.hash.slice(1)}`);
    setSelectedIndex(location.pathname === '/' && hashIndex >= 0 ? hashIndex : 0);
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
    const update = () => movePill(hoverIndex ?? selectedIndex);
    update();

    const observer = new ResizeObserver(update);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [hoverIndex, movePill, selectedIndex]);

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
          className="portfolio-nav__pill"
          aria-hidden="true"
          style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height }}
        />
        {items.map((item, index) => (
          <Link
            className={`portfolio-nav__link${index === selectedIndex ? ' is-selected' : ''}`}
            to={item.to}
            key={item.label}
            ref={(node) => { linkRefs.current[index] = node; }}
            aria-current={item.label.toLowerCase().replaceAll(' ', '-') === activePage ? 'page' : undefined}
            onMouseEnter={() => setHoverIndex(index)}
            onFocus={() => setHoverIndex(index)}
            onClick={() => { setSelectedIndex(index); setHoverIndex(null); }}
          >
            <img src={`/assets/home/type/${item.asset}`} alt="" />
            <span className="portfolio-visually-hidden">{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
