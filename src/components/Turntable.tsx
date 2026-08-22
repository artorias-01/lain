import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { youtubeEngine } from '../lib/youtubePlayer';

interface TurntableProps {
  isPlaying: boolean;
  albumArtUrl: string;
}

export const Turntable: React.FC<TurntableProps> = ({ isPlaying, albumArtUrl }) => {
  const discRef = useRef<HTMLDivElement>(null);
  const tonearmPivotRef = useRef<HTMLDivElement>(null);

  // GSAP Timeline References for stateful interruptible animations
  const spinTimelineRef = useRef<gsap.core.Tween | null>(null);
  const armAnimRef = useRef<gsap.core.Tween | null>(null);

  // Continuous 360 Disc Rotation Setup
  useEffect(() => {
    if (!discRef.current) return;

    spinTimelineRef.current = gsap.to(discRef.current, {
      rotation: '+=360',
      duration: 1.8, // ~33 1/3 RPM
      repeat: -1,
      ease: 'none',
      paused: true,
    });

    return () => {
      spinTimelineRef.current?.kill();
    };
  }, []);

  // Handle Play/Pause Acceleration & Deceleration
  useEffect(() => {
    const spinTween = spinTimelineRef.current;
    if (!spinTween) return;

    if (isPlaying) {
      spinTween.play();
      gsap.to(spinTween, { timeScale: 1, duration: 0.8, ease: 'power2.in' });
    } else {
      gsap.to(spinTween, {
        timeScale: 0,
        duration: 1.2,
        ease: 'power2.out',
        onComplete: () => {
          spinTween.pause();
        },
      });
    }
  }, [isPlaying]);

  // Handle Tonearm Swing & Drop Logic via GSAP
  useEffect(() => {
    if (!tonearmPivotRef.current) return;

    const REST_ANGLE = 36;
    const OUTER_ANGLE = 12;
    const INNER_ANGLE = -6;

    if (armAnimRef.current) armAnimRef.current.kill();

    if (isPlaying) {
      let progress = 0;
      if (youtubeEngine.durationRef.current > 0) {
        progress = Math.min(1, Math.max(0, youtubeEngine.currentTimeRef.current / youtubeEngine.durationRef.current));
      }
      const targetAngle = OUTER_ANGLE - progress * (OUTER_ANGLE - INNER_ANGLE);

      const tl = gsap.timeline();
      tl.to(tonearmPivotRef.current, {
        rotation: targetAngle,
        duration: 0.9,
        ease: 'power3.out',
      })
      .to(tonearmPivotRef.current, {
        scale: 1.0,
        filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.6))',
        duration: 0.4,
        ease: 'power2.inOut',
      }, '-=0.3');

    } else {
      const tl = gsap.timeline();
      tl.to(tonearmPivotRef.current, {
        scale: 1.08,
        filter: 'drop-shadow(0px 20px 25px rgba(0,0,0,0.8))',
        duration: 0.35,
        ease: 'power2.out',
      })
      .to(tonearmPivotRef.current, {
        rotation: REST_ANGLE,
        duration: 0.85,
        ease: 'power3.inOut',
      }, '-=0.1');
    }
  }, [isPlaying, albumArtUrl]);

  // Frame loop updating tonearm drift inward as track progresses
  useEffect(() => {
    let animFrameId: number;

    const updateArmDrift = () => {
      if (isPlaying && tonearmPivotRef.current && youtubeEngine.durationRef.current > 0) {
        const progress = Math.min(1, Math.max(0, youtubeEngine.currentTimeRef.current / youtubeEngine.durationRef.current));
        const currentTargetAngle = 12 - progress * (12 - (-6));
        gsap.to(tonearmPivotRef.current, {
          rotation: currentTargetAngle,
          duration: 0.5,
          ease: 'none',
          overwrite: 'auto',
        });
      }
      animFrameId = requestAnimationFrame(updateArmDrift);
    };

    animFrameId = requestAnimationFrame(updateArmDrift);
    return () => cancelAnimationFrame(animFrameId);
  }, [isPlaying]);

  return (
    <div className="relative w-full max-w-[620px] aspect-[4/3] mx-auto bg-gradient-to-br from-[#12141d] to-[#0a0b0f] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 overflow-hidden flex items-center justify-center select-none">
      {/* Turntable Brushed Base Plate */}
      <div className="absolute inset-4 rounded-2xl bg-[#141620] border border-white/5 shadow-inner" />

      {/* Decorative Brass Corner Screws */}
      {[[12, 12], [12, -12], [-12, 12], [-12, -12]].map(([x, y], i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-accent to-[#856b1d] border border-black/40 shadow-sm"
          style={{
            top: y > 0 ? `${y}px` : 'auto',
            bottom: y < 0 ? `${Math.abs(y)}px` : 'auto',
            left: x > 0 ? `${x}px` : 'auto',
            right: x < 0 ? `${x}px` : 'auto',
          }}
        />
      ))}

      {/* Speed Selector Buttons */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
        <div className="px-2.5 py-1 rounded-md bg-accent/20 border border-accent/40 text-accent font-mono text-[11px] font-bold tracking-wider">
          33 RPM
        </div>
        <div className="px-2.5 py-1 rounded-md bg-bg-surface text-text-muted font-mono text-[11px]">
          45 RPM
        </div>
      </div>

      {/* Main 2D Vinyl Disc Container */}
      <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] flex-shrink-0 z-10 translate-x-[-30px] sm:translate-x-[-40px]">
        {/* Recessed Platter Well */}
        <div className="absolute inset-[-12px] rounded-full bg-[#0a0b0e] border-2 border-white/10 shadow-2xl" />

        {/* Metallic Strobe Dots Platter Edge */}
        <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tr from-slate-700 via-slate-500 to-slate-800 opacity-60" />

        {/* Rotatable Vinyl Disc Mesh Element */}
        <div
          ref={discRef}
          className="relative w-full h-full rounded-full vinyl-grooves-pattern shadow-2xl border-4 border-[#08090b] overflow-hidden"
        >
          {/* Specular Glare Reflection Overlay Sweep */}
          <div className="absolute inset-0 rounded-full vinyl-glare-overlay pointer-events-none opacity-80" />

          {/* Center Album Art Label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34%] h-[34%] rounded-full overflow-hidden border-4 border-[#181a24] shadow-lg">
            <img
              src={albumArtUrl}
              alt="Album Art"
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            {/* Label Center Spindle Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-black/40 pointer-events-none" />
          </div>

          {/* Spindle Center Hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#050608] border-2 border-slate-400 shadow-inner z-20" />
        </div>
      </div>

      {/* 2D Vector SVG Tonearm Assembly */}
      <div
        ref={tonearmPivotRef}
        className="absolute right-[40px] sm:right-[70px] top-[40px] sm:top-[50px] w-[140px] h-[300px] z-20 origin-[80%_18%] transition-transform duration-100"
        style={{ transform: 'rotate(36deg) scale(1.08)' }}
      >
        <svg
          viewBox="0 0 140 300"
          className="w-full h-full drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)] overflow-visible"
        >
          <defs>
            <linearGradient id="armChrome" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="brassAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#856b1d" />
            </linearGradient>
            <filter id="glowStylus">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base Pivot Post Housing */}
          <circle cx="110" cy="55" r="28" fill="#1e202c" stroke="#334155" strokeWidth="3" />
          <circle cx="110" cy="55" r="22" fill="url(#brassAccent)" />
          <circle cx="110" cy="55" r="14" fill="#0f172a" />
          <circle cx="110" cy="55" r="6" fill="#e2e8f0" />

          {/* Rear Counterweight Bar */}
          <rect x="103" y="10" width="14" height="25" rx="3" fill="#1e293b" />
          <rect x="96" y="14" width="28" height="12" rx="2" fill="url(#brassAccent)" />

          {/* Curved Metallic Tonearm Tube */}
          <path
            d="M 110 55 C 110 120, 85 180, 45 240"
            fill="none"
            stroke="url(#armChrome)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 110 55 C 110 120, 85 180, 45 240"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Headshell & Cartridge Assembly */}
          <g transform="translate(45, 240) rotate(-22)">
            <rect x="-6" y="0" width="12" height="8" rx="2" fill="#0f172a" />
            <path d="M -8 8 L 8 8 L 6 36 L -6 36 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <rect x="-5" y="24" width="10" height="18" rx="2" fill="url(#brassAccent)" />
            <polygon points="0,42 -3,52 3,52" fill="#f8fafc" />
            <circle
              cx="0"
              cy="53"
              r="2.5"
              fill={isPlaying ? 'var(--accent-color, #d4af37)' : '#64748b'}
              filter={isPlaying ? 'url(#glowStylus)' : 'none'}
            />
          </g>
        </svg>
      </div>

      {/* Floating Status Indicator */}
      <div className="absolute bottom-6 left-8 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 z-20 text-xs font-mono text-text-secondary">
        <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-accent animate-ping' : 'bg-text-muted'}`} />
        <span>{isPlaying ? 'FULL-SONG PLAYBACK • SPINNING' : 'TONEARM RESTING • PAUSED'}</span>
      </div>
    </div>
  );
};
