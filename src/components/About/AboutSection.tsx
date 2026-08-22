import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, ShieldCheck, Gauge, Layers, Sliders, Volume2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SPECS = [
  {
    icon: Gauge,
    title: 'Zero-Lag rAF Architecture',
    desc: 'Audio frame tracking bypassed outside React state to maintain uncompromised 60/120 FPS render loops.',
  },
  {
    icon: Cpu,
    title: 'Procedural Shader Bump Maps',
    desc: 'Procedural specular vinyl groove rendering with real-time radial light refraction and physical specular highlights.',
  },
  {
    icon: Layers,
    title: 'Lenis Inertial Scroll Sync',
    desc: 'GSAP Ticker synchronized scrolling engine for ultra-smooth momentum scroll and scroll-linked animations.',
  },
  {
    icon: Sliders,
    title: 'Mechanical Tonearm Physics',
    desc: 'Interruptible Spring-Lerp state machine driving dual-axis Y/Z tonearm swing, cueing, and stylus dropping.',
  },
];

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.spec-card');

    gsap.fromTo(
      cards,
      {
        y: 60,
        opacity: 0,
        scale: 0.95,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-border/40">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-accent font-mono text-xs tracking-widest uppercase mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Bespoke Engineering</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary">
          Built Like Hi-Fi Hardware
        </h2>
        <p className="text-sm sm:text-base text-text-secondary mt-3">
          Designed from the ground up without generic UI components. Craftsmanship meets high-performance WebGL.
        </p>
      </div>

      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {SPECS.map((spec, idx) => {
          const Icon = spec.icon;
          return (
            <div
              key={idx}
              className="spec-card glass-panel p-6 sm:p-8 rounded-3xl border border-border/60 hover:border-accent/30 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent-dim border border-accent/20 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-text-primary mb-2 group-hover:text-accent transition-colors">
                {spec.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {spec.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer Branding */}
      <div className="mt-20 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-text-muted gap-4">
        <div>AURA // 3D VINYL MUSIC PLAYER • BESPOKE AUDIO SHOWCASE</div>
        <div>POWERED BY REACT THREE FIBER • LENIS • GSAP • ANIME.JS</div>
      </div>
    </section>
  );
};
