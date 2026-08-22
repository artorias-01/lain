import React, { useEffect, useRef, useState } from 'react';
import { youtubeEngine } from '../../lib/youtubePlayer';

export const ProgressBar: React.FC = () => {
  const fillRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const currentTimeTextRef = useRef<HTMLSpanElement>(null);
  const totalTimeTextRef = useRef<HTMLSpanElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    let animFrameId: number;

    const updateProgress = () => {
      // Update engine time ref from YouTube player
      youtubeEngine.updateTimeRef();

      const current = youtubeEngine.currentTimeRef.current;
      const duration = youtubeEngine.durationRef.current;

      if (fillRef.current && duration > 0) {
        const percent = Math.min(100, Math.max(0, (current / duration) * 100));
        fillRef.current.style.width = `${percent}%`;
        if (handleRef.current) {
          handleRef.current.style.left = `${percent}%`;
        }
      }

      if (currentTimeTextRef.current) {
        currentTimeTextRef.current.textContent = formatTime(current);
      }
      if (totalTimeTextRef.current) {
        totalTimeTextRef.current.textContent = formatTime(duration);
      }

      animFrameId = requestAnimationFrame(updateProgress);
    };

    animFrameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!trackContainerRef.current || youtubeEngine.durationRef.current <= 0) return;
    const rect = trackContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * youtubeEngine.durationRef.current;
    youtubeEngine.seekTo(newTime);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    youtubeEngine.isSeeking = true;
    handleSeek(e);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSeek(moveEvent);
    };

    const onMouseUp = () => {
      youtubeEngine.isSeeking = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="w-full flex items-center gap-3 group select-none">
      {/* Current Time */}
      <span
        ref={currentTimeTextRef}
        className="font-mono text-xs text-text-secondary min-w-[40px] text-right"
      >
        0:00
      </span>

      {/* Scrub Track */}
      <div
        ref={trackContainerRef}
        onMouseDown={onMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex-1 h-3 flex items-center cursor-pointer group/track"
      >
        {/* Track Rail */}
        <div className="w-full h-1.5 bg-bg-surface rounded-full overflow-hidden transition-all duration-200 group-hover/track:h-2.5">
          {/* Active Fill */}
          <div
            ref={fillRef}
            className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full relative transition-[height] duration-200"
            style={{ width: '0%' }}
          >
            {/* Pulsing Cap */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full opacity-80 shadow-[0_0_8px_var(--accent-glow)]" />
          </div>
        </div>

        {/* Drag Handle Knob */}
        <div
          ref={handleRef}
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-accent shadow-[0_0_12px_var(--accent-glow)] transition-transform duration-150 ${
            isHovered ? 'scale-125 opacity-100' : 'scale-0 opacity-0 group-hover/track:scale-100 group-hover/track:opacity-100'
          }`}
          style={{ left: '0%' }}
        />
      </div>

      {/* Total Duration */}
      <span
        ref={totalTimeTextRef}
        className="font-mono text-xs text-text-secondary min-w-[40px]"
      >
        0:00
      </span>
    </div>
  );
};
