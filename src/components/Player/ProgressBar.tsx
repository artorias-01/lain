import React, { useEffect, useRef, useState } from 'react';
import { nativeAudioEngine } from '../../lib/nativeAudioEngine';

const TOTAL_SEGMENTS = 28;

export const ProgressBar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTimeTextRef = useRef<HTMLSpanElement>(null);
  const totalTimeTextRef = useRef<HTMLSpanElement>(null);

  const [activeSegments, setActiveSegments] = useState(0);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    let animFrameId: number;
    let lastSegment = -1;

    const updateProgress = () => {
      nativeAudioEngine.updateTimeRef();

      const current = nativeAudioEngine.currentTimeRef.current;
      const duration = nativeAudioEngine.durationRef.current;

      if (duration > 0) {
        const ratio = Math.min(1, Math.max(0, current / duration));
        const numFilled = Math.round(ratio * TOTAL_SEGMENTS);
        if (numFilled !== lastSegment) {
          lastSegment = numFilled;
          setActiveSegments(numFilled);
        }
      } else {
        if (lastSegment !== 0) {
          lastSegment = 0;
          setActiveSegments(0);
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || nativeAudioEngine.durationRef.current <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * nativeAudioEngine.durationRef.current;
    nativeAudioEngine.seekTo(newTime);
  };

  return (
    <div className="w-full flex items-center gap-2 select-none font-mono">
      {/* Elapsed Time */}
      <span
        ref={currentTimeTextRef}
        className="text-[10px] tabular-nums text-retro-cyan font-bold min-w-[30px] text-right"
      >
        0:00
      </span>

      {/* Segmented Energy/Health Style Meter */}
      <div
        ref={containerRef}
        onClick={handleSeek}
        className="pixel-panel-inset p-1 flex-1 flex items-center gap-1 cursor-pointer bg-retro-bg group"
        title="Click segment to seek"
      >
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => {
          const isFilled = i < activeSegments;
          return (
            <div
              key={i}
              className={`h-3 flex-1 transition-none ${
                isFilled
                  ? 'bg-retro-cyan shadow-[0_0_2px_#00f0ff]'
                  : 'bg-retro-slot group-hover:bg-[#1e2a3d]'
              }`}
            />
          );
        })}
      </div>

      {/* Total Duration */}
      <span
        ref={totalTimeTextRef}
        className="text-[10px] tabular-nums text-kraft min-w-[30px]"
      >
        0:00
      </span>
    </div>
  );
};
