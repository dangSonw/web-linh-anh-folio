import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { impactPages, hivePages, insideDestination } from '../lib/pageGroups.js';
import VideoBox from '../components/VideoBox.jsx';
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
      {node.id === '71:499' ? <VideoBox poster={node.src} title="Scientific exploration prototype" src="/assets/inside/scientific-prototype.mp4" />
        : node.id === '71:501' ? <VideoBox poster={node.src} title="CNN Vibrant Stage performance" youtubeId="KTAN_pvkji0" />
        : node.type === 'image' ? <img src={node.src} alt={alt} decoding="async" /> : <>
        <img src={node.src} alt="" aria-hidden="true" />
        <span className="inside-readable">{node.text}</span>
      </>}
    </Tag>
  );
}

function PageLink({ entry, page, glass = false }) {
  const panel = page.nodes.find(node => node.id === entry.panel);
  const box = panel?.box ?? entry.box;
  const to = insideDestination(entry.to);
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

function InsideFrame({ page }) {
  const node = id => page.nodes.find(entry => entry.id === id);
  return (
    <div className={`inside-page inside-page--${page.kind ?? 'detail'}`} data-frame={page.frame}>
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
    </div>
  );
}

export default function InsideTheCells({ group = 'hive' }) {
  const pages = group === 'impact' ? impactPages : hivePages;
  const reduced = useReducedMotion();
  return <main className="inside-scroll">
    {pages.map((page, index) => <motion.section key={page.key}
      id={index === 0 ? 'overview' : page.key.split('/').pop()}
      className="scroll-section" aria-label={page.title}
      style={{ '--section-source-height': page.height - 124 }}
      initial={reduced ? false : { opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }} transition={{ duration: reduced ? 0 : 0.4 }}>
      <InsideFrame page={page} />
    </motion.section>)}
  </main>;
}
