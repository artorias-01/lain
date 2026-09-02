import React, { useEffect, useRef, useState } from 'react';
import { nativeAudioEngine } from '../../lib/nativeAudioEngine';

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
      nativeAudioEngine.updateTimeRef();

      const current = nativeAudioEngine.currentTimeRef.current;
      const duration = nativeAudioEngine.durationRef.current;

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
    if (!trackContainerRef.current || nativeAudioEngine.durationRef.current <= 0) return;
    const rect = trackContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * nativeAudioEngine.durationRef.current;
    nativeAudioEngine.seekTo(newTime);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    nativeAudioEngine.isSeeking = true;
    handleSeek(e);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSeek(moveEvent);
    };

    const onMouseUp = () => {
      nativeAudioEngine.isSeeking = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="w-full flex items-center gap-2.5 select-none font-mono">
      {/* Current Elapsed Time */}
      <span
        ref={currentTimeTextRef}
        className="text-[11px] tabular-nums text-kraft min-w-[32px] text-right"
      >
        0:00
      </span>

      {/* Scrub Track */}
      <div
        ref={trackContainerRef}
        onMouseDown={onMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex-1 h-3.5 flex items-center cursor-pointer group/track"
      >
        {/* Rail Base: Sharp Single-Pixel or 2px Bar */}
        <div className="w-full h-[2px] bg-scribe overflow-hidden transition-[height] duration-100 group-hover/track:h-1">
          {/* Active Progress Fill */}
          <div
            ref={fillRef}
            className="h-full bg-accent"
            style={{ width: '0%' }}
          />
        </div>

        {/* Square Terminal Scrub Handle */}
        <div
          ref={handleRef}
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2.5 bg-accent border border-black transition-opacity duration-100 ${
            isHovered ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'
          }`}
          style={{ left: '0%' }}
        />
      </div>

      {/* Total Duration */}
      <span
        ref={totalTimeTextRef}
        className="text-[11px] tabular-nums text-kraft min-w-[32px]"
      >
        0:00
      </span>
    </div>
  );
};
