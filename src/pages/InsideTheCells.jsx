import { Link, Navigate, useLocation } from 'react-router-dom';
import { insidePages, insideSrcSet } from '../data/insidePages.js';
import { preloadRoute } from '../lib/routeAssets.js';
import './InsideTheCells.css';

function position(box, origin = [0, 0]) {
  return { '--x': `${(box[0] - origin[0]) / 14.4}cqw`, '--y': `${(box[1] - origin[1]) / 14.4}cqw`,
    '--w': `${box[2] / 14.4}cqw`, '--h': `${box[3] / 14.4}cqw` };
}

function DesignNode({ node, origin, heading = false, alt }) {
  const Tag = node.type === 'image' ? 'div' : heading ? 'h1' : 'p';
  return (
    <Tag className={`inside-node inside-node--${node.type}${heading ? ' inside-node--heading' : ''}`}
      data-node={node.id} style={position(node.box, origin)}>
      {node.type === 'image' ? <img src={node.src} alt={alt} decoding="async" /> : <>
        <img src={node.src} alt="" aria-hidden="true" />
        <span className="inside-readable">{node.text}</span>
      </>}
    </Tag>
  );
}

function PageLink({ entry, page, glass = false }) {
  const panel = page.nodes.find(node => node.id === entry.panel);
  const box = panel?.box ?? entry.box;
  const to = `/inside-the-cells/${entry.to}`;
  return (
    <Link className={`inside-page-link${glass ? ' inside-glass inside-hive-link' : ' inside-overview-link'}`}
      to={to} style={position(box)} aria-label={entry.label}
      onPointerEnter={() => preloadRoute(to)} onFocus={() => preloadRoute(to)}>
      {entry.nodes.map(id => <DesignNode key={id} node={page.nodes.find(node => node.id === id)} origin={box} />)}
    </Link>
  );
}

function Detail({ page }) {
  const panel = page.nodes.find(node => node.id === page.panel);
  const node = id => page.nodes.find(entry => entry.id === id);
  return (
    <section className="inside-detail-panel inside-glass" style={position(panel.box)} aria-label={page.title}>
      <div className="inside-detail-intro">
        <DesignNode node={node(page.heading)} origin={panel.box} heading />
        {page.intro.map(id => <DesignNode key={id} node={node(id)} origin={panel.box} />)}
      </div>
      <div className="inside-detail-columns">
        {page.columns.map((ids, index) => <div className="inside-detail-column" key={ids[0]}>
          {ids.map(id => <DesignNode key={id} node={node(id)} origin={panel.box}
            alt={`${page.title} — ${index === 0 ? 'first' : 'second'} project image`} />)}
        </div>)}
      </div>
    </section>
  );
}

export default function InsideTheCells() {
  const location = useLocation();
  const page = insidePages.find(entry => entry.path === location.pathname);
  if (!page) return <Navigate to="/inside-the-cells" replace />;
  const node = id => page.nodes.find(entry => entry.id === id);
  return (
    <main className={`inside-page inside-page--${page.kind ?? 'detail'}`} data-frame={page.frame}>
      <div className="inside-background inside-node" style={position(page.background.box)}>
        <img src={page.background.src} srcSet={insideSrcSet(page.background.src)} sizes="100vw" alt="" decoding="async" />
      </div>
      {page.kind === 'overview' ? <>
        <DesignNode node={node(page.heading)} heading />
        <nav className="inside-overview-nav" aria-label="Impact and Leadership projects">
          {page.links.map(entry => <PageLink key={entry.to} entry={entry} page={page} />)}
        </nav>
      </> : page.kind === 'hive' ? <>
        <section className="inside-hive-intro inside-glass" style={position(node(page.panel).box)}>
          <DesignNode node={node(page.heading)} origin={node(page.panel).box} heading />
          {page.intro.map(id => <DesignNode key={id} node={node(id)} origin={node(page.panel).box} />)}
        </section>
        <nav className="inside-hive-nav" aria-label="Data Science projects">
          {page.links.map(entry => <PageLink key={entry.to} entry={entry} page={page} glass />)}
        </nav>
      </> : <Detail page={page} />}
    </main>
  );
}
