import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { preloadRoute } from '../lib/routeAssets.js';
import './PortfolioHeader.css';

const items = [
  { label: 'About Me', asset: 'nav-about-gold.svg', to: '/about-me' },
  { label: 'Scouting for pollens', asset: 'nav-scouting.svg', to: '/scouting' },
  { label: 'Inside the cells', asset: 'nav-inside.svg', to: '/inside-the-cells' },
  { label: 'World', asset: 'nav-world.svg', to: '/world' },
];
const groups = [
  { label: 'Impact & Leadership', asset: 'nav-impact.svg', to: '/impact-leadership' },
  { label: 'Inside the cells', asset: 'nav-inside.svg', to: '/inside-the-cells' },
];
export default function PortfolioHeader() {
  const location = useLocation();
  const impact = location.pathname.startsWith('/impact-leadership');
  const routeIndex = impact ? 2 : items.findIndex(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'));
  const [hoverIndex, setHoverIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const navRef = useRef(null), groupRef = useRef(null), linkRefs = useRef([]);
  const selected = location.pathname === '/' ? null : routeIndex >= 0 ? routeIndex : null;
  const displayed = hoverIndex ?? selected;
  useLayoutEffect(() => { setHoverIndex(null); setOpen(false); }, [location.key]);
  useEffect(() => {
    if (!open) return;
    const close = event => { if (!groupRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const movePill = useCallback(index => {
    const link = linkRefs.current[index], nav = navRef.current;
    if (!link || !nav) return;
    const lr = link.getBoundingClientRect(), nr = nav.getBoundingClientRect();
    setPill({ left: lr.left - nr.left, top: lr.top - nr.top, width: lr.width, height: lr.height });
  }, []);
  useLayoutEffect(() => {
    if (displayed === null) return;
    const update = () => movePill(displayed);
    update();
    const observer = new ResizeObserver(update);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [displayed, movePill]);
  const label = (item, chevron = false) => <>
    <img src={`/assets/home/type/${item.asset}`} alt="" />
    <span className="portfolio-visually-hidden portfolio-nav__text">{item.label}</span>
    {chevron && <img className="portfolio-nav__chevron" src="/assets/home/type/nav-chevron.svg" alt="" />}
  </>;
  return <header className="portfolio-header">
    <Link className="portfolio-brand" to="/" aria-label="Linh Anh's Portfolio, home"><img src="/assets/home/type/nav-brand.svg" alt="" /></Link>
    <nav className="portfolio-nav" aria-label="Portfolio sections" ref={navRef} onMouseLeave={() => setHoverIndex(null)}>
      <span className="portfolio-nav__pill-track" aria-hidden="true"><span className={`portfolio-nav__pill${displayed === null ? '' : ' is-visible'}`} style={pill} /></span>
      {items.map((item, index) => index === 2 ? <div key={item.to} className="portfolio-nav__group" ref={groupRef}
        onMouseEnter={() => { setOpen(true); setHoverIndex(2); groups.forEach(group => preloadRoute(group.to)); }}
        onMouseLeave={event => { if (!event.currentTarget.contains(document.activeElement)) setOpen(false); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
        onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); linkRefs.current[2]?.focus(); } }}>
        <button type="button" className={`portfolio-nav__link${displayed === 2 ? ' is-selected' : ''}`}
          ref={node => { linkRefs.current[2] = node; }} aria-haspopup="true" aria-expanded={open}
          aria-controls="portfolio-inside-options" onClick={() => setOpen(value => !value)}
          onFocus={() => groups.forEach(group => preloadRoute(group.to))}>
          {label(impact ? groups[0] : item, true)}
        </button>
        {open && <div className="portfolio-nav__dropdown" id="portfolio-inside-options">
          {groups.map(group => <Link className="portfolio-nav__dropdown-item" key={group.to} to={group.to}
            aria-current={location.pathname === group.to ? 'page' : undefined}
            onPointerEnter={() => preloadRoute(group.to)} onFocus={() => preloadRoute(group.to)}>{label(group)}</Link>)}
        </div>}
      </div> : <Link key={item.to} className={`portfolio-nav__link${displayed === index ? ' is-selected' : ''}${index === 3 ? ' portfolio-nav__link--world' : ''}`}
        to={item.to} ref={node => { linkRefs.current[index] = node; }} aria-current={routeIndex === index ? 'page' : undefined}
        onMouseEnter={() => { setHoverIndex(index); preloadRoute(item.to); }} onFocus={() => preloadRoute(item.to)}>{label(item)}</Link>)}
    </nav>
  </header>;
}
