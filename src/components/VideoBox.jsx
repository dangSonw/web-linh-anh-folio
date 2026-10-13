import { useEffect, useRef, useState } from 'react';
import './VideoBox.css';

export default function VideoBox({ poster, title, youtubeId, src }) {
  const [playing, setPlaying] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => {
    if (!playing) return;
    const header = document.querySelector('.portfolio-header-shell');
    let observer;
    const updateVisibility = () => {
      observer?.disconnect();
      const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) return;
        boxRef.current?.querySelector('video')?.pause();
        boxRef.current?.querySelector('iframe')?.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), 'https://www.youtube.com');
      }, { rootMargin: `-${top}px 0px 0px 0px` });
      observer.observe(boxRef.current);
    };
    updateVisibility();
    const resize = new ResizeObserver(updateVisibility);
    if (header) resize.observe(header);
    return () => { observer.disconnect(); resize.disconnect(); };
  }, [playing]);
  return <div className="video-box" ref={boxRef}>
    {!playing ? <button type="button" className="video-box__poster" aria-label={`Play ${title}`} onClick={() => setPlaying(true)}>
      <img src={poster} alt="" />
      <span className="video-box__play" aria-hidden="true">▶</span>
    </button> : youtubeId ? <iframe
      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
      title={title} allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> :
      <video src={src} aria-label={title} controls autoPlay playsInline preload="metadata" />}
  </div>;
}
