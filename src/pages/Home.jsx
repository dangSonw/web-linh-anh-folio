import './Home.css';

const sections = [
  {
    id: 'about-me',
    title: 'About m(b)ee',
    navTitle: 'About Me',
    image: '/assets/home/beehive-of-linh-anh-1__63-15@4x.png',
    imageAlt: 'Watercolor illustration of a beehive',
    labelAsset: '/assets/home/type/card-about.svg',
    navAsset: '/assets/home/type/nav-about.svg',
  },
  {
    id: 'scouting-for-pollens',
    title: 'Scouting for pollens',
    navTitle: 'Scouting for pollens',
    image: '/assets/home/untitled-9-september-2026-14-47-00-1__63-2@4x.png',
    imageAlt: 'Watercolor illustration from Scouting for pollens',
    labelAsset: '/assets/home/type/card-scouting.svg',
    navAsset: '/assets/home/type/nav-scouting.svg',
  },
  {
    id: 'inside-the-cells',
    title: 'Inside the cells',
    navTitle: 'Inside the cells',
    image: '/assets/home/linh-anh-tab2-1__54-3@4x.png',
    imageAlt: 'Watercolor illustration from Inside the cells',
    labelAsset: '/assets/home/type/card-inside.svg',
    navAsset: '/assets/home/type/nav-inside.svg',
  },
  {
    id: 'world',
    title: 'World',
    navTitle: 'World',
    image: '/assets/home/untitled-8-september-2026-15-35-24-1__54-5@4x.png',
    imageAlt: 'Watercolor illustration of a world',
    labelAsset: '/assets/home/type/card-world.svg',
    navAsset: '/assets/home/type/nav-world.svg',
  },
];

function OutlineLabel({ src, text, className = '' }) {
  return (
    <>
      <img className={className} src={src} alt="" aria-hidden="true" />
      <span className="home-visually-hidden">{text}</span>
    </>
  );
}

export default function Home() {
  return (
    <main className="home-page" id="home-top">
      <header className="home-header">
        <a className="home-brand" href="#home-top" aria-label="Linh Anh's Portfolio, home">
          <OutlineLabel
            src="/assets/home/type/nav-brand.svg"
            text="Linh Anh's Portfolio"
            className="home-brand__wordmark"
          />
        </a>

        <nav className="home-nav" aria-label="Portfolio sections">
          {sections.map((section, index) => (
            <a
              className={`home-nav__link${index === 0 ? ' is-active' : ''}`}
              href={`#${section.id}`}
              key={section.id}
              aria-current={index === 0 ? 'page' : undefined}
            >
              <OutlineLabel src={section.navAsset} text={section.navTitle} />
            </a>
          ))}
        </nav>
      </header>

      <h1 className="home-title">
        <OutlineLabel
          src="/assets/home/type/hero-title.svg"
          text="BE(E)HIND A HIVE"
          className="home-title__art"
        />
      </h1>

      <section className="home-sections" aria-label="Explore Linh Anh's portfolio">
        {sections.map((section) => (
          <a
            className="home-card"
            href={`#${section.id}`}
            id={section.id}
            key={section.id}
            aria-label={section.title}
          >
            <img className="home-card__image" src={section.image} alt={section.imageAlt} />
            <OutlineLabel
              src={section.labelAsset}
              text={section.title}
              className="home-card__label-art"
            />
          </a>
        ))}
      </section>
    </main>
  );
}
