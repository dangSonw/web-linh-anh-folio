import './World.css';

export const worldHive = '/assets/world/hive@4x.webp';
export const worldHiveSrcSet = [1, 2, 4].map(scale => `/assets/world/hive@${scale}x.webp ${1438 * scale}w`).join(', ');

export default function World() {
  return <main className="world-page" aria-label="World">
    <h1 className="world-ending"><img src="/assets/world/ending.svg" alt="" />
      <span className="portfolio-visually-hidden">Ending</span>
    </h1>
    <footer className="world-contact">
      <img className="world-contact-art" src="/assets/world/contact.svg" alt="" aria-hidden="true" />
      <p className="world-message portfolio-visually-hidden">
        “Every cell builds my hive”<br />
        “I’m still collecting the pollens for my WORLD”<br />
        Thank you for exploring my hive.
      </p>
      <div className="world-contact-links">
        <span>[</span><a href="tel:0815601948">0815601948</a><span> / </span>
        <span>Resume Link</span><span> / </span>
        <a href="mailto:beetranngoclinhanh@gmail.com">beetranngoclinhanh@gmail.com</a><span> ]</span>
      </div>
    </footer>
  </main>;
}
