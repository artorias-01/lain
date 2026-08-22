import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

interface WaveformProps {
  isPlaying: boolean;
  barCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformProps> = ({ isPlaying, barCount = 14 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animeInstanceRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const bars = containerRef.current.querySelectorAll('.waveform-bar');

    if (isPlaying) {
      animeInstanceRef.current = anime({
        targets: bars,
        height: () => anime.random(10, 42),
        duration: () => anime.random(250, 600),
        delay: anime.stagger(30),
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutQuad',
      });
    } else {
      if (animeInstanceRef.current) {
        animeInstanceRef.current.pause();
      }
      anime({
        targets: bars,
        height: 6,
        duration: 400,
        delay: anime.stagger(20),
        easing: 'easeOutExpo',
      });
    }

    return () => {
      if (animeInstanceRef.current) {
        animeInstanceRef.current.pause();
      }
    };
  }, [isPlaying]);

  return (
    <div ref={containerRef} className="flex items-center gap-1.5 h-12 px-3 py-1 bg-bg-surface/40 rounded-xl border border-border-subtle">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="waveform-bar w-1 rounded-full bg-accent transition-colors duration-300 shadow-[0_0_8px_var(--accent-glow)]"
          style={{ height: '6px' }}
        />
      ))}
    </div>
  );
};
