import React from 'react';
import { TextReveal } from '../UI/TextReveal';
import { VantaBackground } from '../UI/VantaBackground';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Disc, Play, ChevronDown, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { togglePlay, isPlaying } = usePlayerStore();

  const handleScrollToPlayer = () => {
    const el = document.getElementById('turntable-player');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCtaClick = () => {
    if (!isPlaying) {
      togglePlay();
    }
    handleScrollToPlayer();
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-8 overflow-hidden select-none">
      {/* Vanta Ambient Background Particle Layer */}
      <VantaBackground />

      {/* Top Header Bar: Clean Branding */}
      <header className="w-full max-w-6xl flex items-center justify-between z-20 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)] text-black">
            <Disc className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <span className="font-display font-extrabold text-xl tracking-wider text-text-primary">AURA</span>
            <span className="text-[10px] font-mono text-accent block -mt-1 tracking-widest">YOUTUBE // VINYL DECK</span>
          </div>
        </div>
      </header>

      {/* Hero Center Kinetic Typography */}
      <div className="my-auto text-center max-w-4xl z-10 py-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-dim border border-accent/30 text-accent text-xs font-mono tracking-widest uppercase mb-8 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>Full-Length YouTube Audio Bridge</span>
        </div>

        {/* Big Kinetic Title Reveal */}
        <h1 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight text-text-primary leading-[1.05] mb-6">
          <TextReveal text="FULL SONGS. REAL VINYL." delay={0.1} />
        </h1>

        <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Search any track on YouTube. Stream full-length audio in high-definition as the vector tonearm drops onto the spinning record.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={handleCtaClick}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent text-black font-display font-bold text-base flex items-center justify-center gap-3 shadow-[0_0_30px_var(--accent-glow)] hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
            <span>{isPlaying ? 'GO TO TURNTABLE' : 'DROP THE NEEDLE'}</span>
          </button>

          <button
            onClick={handleScrollToPlayer}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-bg-elevated text-text-primary border border-border font-display font-semibold text-base flex items-center justify-center gap-2 hover:bg-bg-surface hover:border-white/20 transition-all duration-300"
          >
            <span>SEARCH SONGS</span>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="z-10 pb-4 text-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={handleScrollToPlayer}>
        <span className="font-mono text-xs text-text-muted uppercase tracking-widest block mb-2">SCROLL TO EXPERIENCE</span>
        <div className="w-5 h-8 rounded-full border-2 border-text-muted mx-auto flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-accent animate-bounce" />
        </div>
      </div>
    </section>
  );
};
