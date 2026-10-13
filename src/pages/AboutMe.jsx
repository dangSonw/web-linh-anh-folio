import './AboutMe.css';

export default function AboutMe() {
  return (
    <main className="about-page">
      <div className="about-hero">
      <img
        className="about-hero-image"
        src="/assets/about/beehive-of-linh-anh-1__54-2@4x.png"
        alt="Watercolor illustration of a beehive hanging from a branch"
      />

      <h1 className="about-hero-title">
        <img src="/assets/about/type/building-title.svg" alt="" aria-hidden="true" />
        <span className="portfolio-visually-hidden">Building my hive</span>
      </h1>
      </div>

      <section className="about-profile" aria-labelledby="about-heading">
        <div className="about-copy">
          <h2 className="about-heading" id="about-heading">
            <img src="/assets/about/type/about-title.svg" alt="" aria-hidden="true" />
            <span className="portfolio-visually-hidden">About Me</span>
          </h2>

          <p className="about-bio">
            <span className="about-bio__visual" aria-hidden="true">
              <span>My name is Tran Ngoc Linh Anh</span>
              <span>Academic level: Senior in Foreign Language</span>
              <span>Specialized School</span>
              <span>Major: Chinese-English</span>
              <span>“Once scared of everything, now dare and</span>
              <span>dream for everything”</span>
            </span>
            <span className="portfolio-visually-hidden">
              My name is Tran Ngoc Linh Anh. Academic level: Senior in Foreign Language Specialized School. Major: Chinese-English. “Once scared of everything, now dare and dream for everything.”
            </span>
          </p>
        </div>

        <img
          className="about-profile-photo"
          src="/assets/about/rectangle-66__26-58@4x.png"
          alt="Linh Anh presenting a project at school"
        />
      </section>
    </main>
  );
}
