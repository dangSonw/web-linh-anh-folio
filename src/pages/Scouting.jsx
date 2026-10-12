import { useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import './Scouting.css';

const topics = [
  { id: 'vision', label: 'Vision & Background', flower: 'flower-vision' },
  { id: 'side-interest', label: 'Side-interest', flower: 'flower-side-interest' },
  { id: 'art', label: 'Art', flower: 'flower-art' },
];

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

function OutlineText({ file, text, className = '' }) {
  return (
    <span className={`scouting-outline ${className}`}>
      <img src={`/assets/scouting/type/${file}.svg`} alt="" aria-hidden="true" />
      <span className="portfolio-visually-hidden">{text}</span>
    </span>
  );
}

function FlowerTab({ topic, index, selected, buttonRef, onSelect, onKeyDown }) {
  return (
    <button
      ref={buttonRef}
      className={`scouting-flower-hit scouting-flower-hit--${topic.id}`}
      type="button"
      role="tab"
      id={`scouting-tab-${topic.id}`}
      aria-label={topic.label}
      aria-controls="scouting-tab-panel"
      aria-selected={selected}
      tabIndex={selected || (!selected && index === 0) ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <span className="portfolio-visually-hidden">{topic.label}</span>
    </button>
  );
}

function TabPanel({ activeTab }) {
  if (activeTab === 'vision') {
    return (
      <section className="scouting-tab-panel scouting-tab-panel--vision" role="tabpanel" id="scouting-tab-panel" aria-labelledby="scouting-tab-vision" tabIndex="0">
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
      <section className="scouting-tab-panel scouting-tab-panel--projects" role="tabpanel" id="scouting-tab-panel" aria-labelledby="scouting-tab-side-interest" tabIndex="0">
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
      <section className="scouting-tab-panel scouting-tab-panel--art" role="tabpanel" id="scouting-tab-panel" aria-labelledby="scouting-tab-art" tabIndex="0">
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

export default function Scouting() {
  const [activeTab, setActiveTab] = useState(null);
  const panelRef = useRef(null);
  const tabRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  const selectTab = (index) => {
    setActiveTab(topics[index].id);
    if (window.matchMedia('(max-width: 880px)').matches) {
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      }));
    }
  };

  const handleTabKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % topics.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + topics.length) % topics.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = topics.length - 1;
    else return;

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    selectTab(nextIndex);
  };

  return (
    <main className="scouting-page">
      <div className="scouting-hero">
        <img className="scouting-backdrop" src="/assets/scouting/untitled-9-september-2026-14-47-00-1__63-49@4x.png" alt="" />
        <img className="scouting-flower-art scouting-flower-art--vision" src="/assets/scouting/vector-03.svg" alt="" />
        <img className="scouting-flower-art scouting-flower-art--side-interest" src="/assets/scouting/vector-06.svg" alt="" />
        <img className="scouting-flower-art scouting-flower-art--art" src="/assets/scouting/vector-05.svg" alt="" />
        <img className="scouting-arrow scouting-arrow--vision" src="/assets/scouting/vector-01.svg" alt="" />
        <img className="scouting-arrow scouting-arrow--side-interest" src="/assets/scouting/vector-04.svg" alt="" />
        <img className="scouting-arrow scouting-arrow--art" src="/assets/scouting/vector-02.svg" alt="" />
        <OutlineText file="vision-flower-label" text="Vision & Background" className="scouting-callout scouting-callout--vision" />
        <OutlineText file="side-interest-flower-label" text="Side-interest" className="scouting-callout scouting-callout--side-interest" />
        <OutlineText file="art-flower-label" text="Art" className="scouting-callout scouting-callout--art" />
        <img className="scouting-bee" src="/assets/scouting/con-ong-anh-thu-2__63-117@4x.png" alt="A small bee mascot" />
        <h1 className="scouting-title">
          <OutlineText file="bee-scouting-title" text="Bee Scouting for Pollens" />
        </h1>

        <div className="scouting-tab-list" role="tablist" aria-label="Scouting for pollens topics">
          {topics.map((topic, index) => (
            <FlowerTab
              key={topic.id}
              topic={topic}
              index={index}
              selected={activeTab === topic.id}
              buttonRef={(node) => { tabRefs.current[index] = node; }}
              onSelect={() => selectTab(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            />
          ))}
        </div>
      </div>

      <div ref={panelRef} className="scouting-panel-anchor">
        <TabPanel activeTab={activeTab} />
      </div>
    </main>
  );
}
