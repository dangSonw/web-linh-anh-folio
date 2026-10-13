import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { preloadRoute } from '../lib/routeAssets.js';
import './Scouting.css';

const topics = [
  { id: 'vision', label: 'Vision & Background' },
  { id: 'side-interest', label: 'Side-interest' },
  { id: 'art', label: 'Art' },
];

// The Figma node is mirrored: x=236 is its right edge, paint starts at 56.
const beeOrigin = { x: 56, y: 838 };

const sideProjects = [
  { src: 'image-9__71-469@4x.png', alt: 'Plss Debate Open certificate', title: 'Plss Debate Open', className: 'project-debate' },
  { src: 'image-10__71-472@4x.png', alt: 'Hanoi ABP event stage', title: 'Hanoi ABP', className: 'project-abp' },
  { src: 'image-19__71-489@4x.png', alt: 'Running for charity with KMPG', title: 'KMPG Running for Charity', className: 'project-kmpg' },
  { src: 'image-20__71-491@4x.png', alt: 'VanDon Aqua running event', title: 'VanDon Aqua', className: 'project-vandon' },
];

const artImages = [
  ['image-11__71-478@4x.png', 'Mixed media artwork on a table'],
  ['image-12__71-479@4x.png', 'A landscape painting at home'],
  ['image-13__71-481@4x.png', 'Flowers growing beside a house'],
  ['image-14__71-483@4x.png', 'A tree against the blue sky'],
  ['image-15__71-484@4x.png', 'Fish in an aquarium'],
  ['image-16__71-485@4x.png', 'Sunset over the sea'],
  ['image-17__71-486@4x.png', 'Misty mountains'],
  ['image-18__71-487@4x.png', 'A painting of a cat under the moon'],
];

function OutlineText({ file, text, className = '', to, ...events }) {
  const Tag = to ? Link : 'span';
  return (
    <Tag className={`scouting-outline ${className}`} to={to} {...events}>
      <img src={`/assets/scouting/type/${file}.svg`} alt="" aria-hidden="true" />
      <span className="portfolio-visually-hidden">{text}</span>
    </Tag>
  );
}

function FlowerLink({ topic, onHover, onLeave }) {
  return (
    <Link
      className={`scouting-flower-hit scouting-flower-hit--${topic.id}`}
      id={`scouting-flower-${topic.id}`}
      to={`/scouting#${topic.id}`}
      aria-label={topic.label}
      onPointerEnter={() => { onHover(topic.id); preloadRoute(`/scouting#${topic.id}`); }}
      onPointerLeave={onLeave}
      onFocus={() => { onHover(topic.id); preloadRoute(`/scouting#${topic.id}`); }}
      onBlur={onLeave}
    >
      <span className="portfolio-visually-hidden">{topic.label}</span>
    </Link>
  );
}

function TabPanel({ activeTab }) {
  if (activeTab === 'vision') {
    return (
      <section className="scouting-tab-panel scouting-tab-panel--vision" aria-label="Vision & Background">
        <h2>
          <OutlineText file="vision-tab-title" text="Vision" />
        </h2>
        <p className="scouting-vision-copy">
          <span>Vision: My home name is Bee - Hard work + Creativity → Teamwork spirit → High discipline and organization</span>
          <br />
          <span>→ always aiming for sustainable results</span>
        </p>
        <h3>
          <OutlineText file="background-tab-title" text="Background: One moment lasting for a whole life" />
        </h3>
        <p className="scouting-background-copy">
          During COVID-19, I unexpectedly discovered a small beehive in my house and had the chance to observe how meticulously bees built their honeycomb from wax. I was fascinated by its hexagonal cells, each resembling a single data point. Just as individual cells come together to form a complex structure, separate pieces of data can connect to reveal patterns that are invisible on their own. This digital honeycomb represents me in the same way: each cell holds a different trait, passion, or experience, and together, they form a picture of who I am today.”
        </p>
      </section>
    );
  }

  if (activeTab === 'side-interest') {
    return (
      <section className="scouting-tab-panel scouting-tab-panel--projects" aria-label="Side-interest">
        <h2><OutlineText file="side-interest-tab-title" text="Side-interest" /></h2>
        <div className="scouting-project-grid">
          {sideProjects.map((project) => (
            <figure className={`scouting-project ${project.className}`} key={project.title}>
              <img src={`/assets/scouting/${project.src}`} alt={project.alt} />
              <figcaption>{project.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  if (activeTab === 'art') {
    return (
      <section className="scouting-tab-panel scouting-tab-panel--art" aria-label="Art">
        <h2><OutlineText file="art-tab-title" text="Art" /></h2>
        <div className="scouting-art-grid">
          {artImages.map(([src, alt], index) => (
            <img
              key={src}
              className={`scouting-art-image scouting-art-image--${index + 1}`}
              src={`/assets/scouting/${src}`}
              alt={alt}
            />
          ))}
        </div>
      </section>
    );
  }

  return null;
}

function FlyingBee({ flower }) {
  const x = useMotionValue(beeOrigin.x);
  const y = useMotionValue(beeOrigin.y);
  const left = useTransform(x, value => `${value / 14.4}cqw`);
  const top = useTransform(y, value => `calc(${value / 14.4}cqw - var(--scouting-top-offset))`);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const destinations = {
      vision: { x: 230, y: 303 },
      'side-interest': { x: 633, y: 456 },
      art: { x: 1067, y: 501 },
    };
    const target = destinations[flower] ?? beeOrigin;
    const start = { x: x.get(), y: y.get() };
    if (reducedMotion) {
      x.set(target.x);
      y.set(target.y);
      return undefined;
    }
    if (start.x === target.x && start.y === target.y) return undefined;
    const control = {
      x: (start.x + target.x) / 2 + (target.x >= start.x ? -60 : 60),
      y: Math.min(start.y, target.y) - 90,
    };
    const flight = animate(0, 1, {
      duration: 0.95,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: progress => {
        const rest = 1 - progress;
        x.set(rest * rest * start.x + 2 * rest * progress * control.x + progress * progress * target.x);
        y.set(rest * rest * start.y + 2 * rest * progress * control.y + progress * progress * target.y);
      },
    });
    return () => flight.stop();
  }, [flower, reducedMotion, x, y]);

  return (
    <motion.div className="scouting-bee" style={{ left: 0, top: 0, x: left, y: top }}>
      <img src="/assets/scouting/con-ong-anh-thu-2__63-117@4x.png" alt="A small bee mascot" />
    </motion.div>
  );
}

export function ScoutingArtwork({ title = false, decorations = true }) {
  const [flower, setFlower] = useState(null);
  return (
    <>
      {decorations && <>
      <img className={`scouting-flower-art scouting-flower-art--vision${flower === 'vision' ? ' is-hovered' : ''}`} src="/assets/scouting/vector-03.svg" alt="" />
      <img className={`scouting-flower-art scouting-flower-art--side-interest${flower === 'side-interest' ? ' is-hovered' : ''}`} src="/assets/scouting/vector-06.svg" alt="" />
      <img className={`scouting-flower-art scouting-flower-art--art${flower === 'art' ? ' is-hovered' : ''}`} src="/assets/scouting/vector-05.svg" alt="" />
      <img className="scouting-arrow scouting-arrow--vision" src="/assets/scouting/vector-01.svg" alt="" />
      <img className="scouting-arrow scouting-arrow--side-interest" src="/assets/scouting/vector-04.svg" alt="" />
      <img className="scouting-arrow scouting-arrow--art" src="/assets/scouting/vector-02.svg" alt="" />
      {topics.map(topic => <OutlineText key={topic.id} file={`${topic.id}-flower-label`} text={topic.label}
        className={`scouting-callout scouting-callout--${topic.id}`} to={`/scouting#${topic.id}`}
        onPointerEnter={() => setFlower(topic.id)} onPointerLeave={() => setFlower(null)}
        onFocus={() => setFlower(topic.id)} onBlur={() => setFlower(null)} />)}
      <FlyingBee flower={flower} />
      </>}
      {title && <h1 className="scouting-title">
        <OutlineText file="bee-scouting-title" text="Bee Scouting for Pollens" />
      </h1>}
      {decorations && <nav className="scouting-tab-list" aria-label="Scouting for pollens pages">
        {topics.map(entry => (
          <FlowerLink key={entry.id} topic={entry} onHover={setFlower} onLeave={() => setFlower(null)} />
        ))}
      </nav>}
    </>
  );
}

export default function Scouting() {
  const reduced = useReducedMotion();
  return <main className="scouting-scroll">
    <section id="overview" className="scroll-section scouting-overview-section" style={{ '--section-source-height': 1044 }} aria-label="Scouting for pollens">
      <div className="scouting-page"><div className="scouting-hero"><ScoutingArtwork title decorations={false} /><div className="scouting-mobile-artwork"><ScoutingArtwork decorations /></div></div></div>
    </section>
    {topics.map(topic => <motion.section key={topic.id} id={topic.id}
      className="scroll-section scouting-detail-section" style={{ '--section-source-height': 1044 }}
      aria-label={topic.label} initial={reduced ? false : { opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }} transition={{ duration: reduced ? 0 : 0.4 }}>
      <div className="scouting-page scouting-page--detail"><div className="scouting-panel-anchor"><TabPanel activeTab={topic.id} /></div></div>
    </motion.section>)}
  </main>;
}
