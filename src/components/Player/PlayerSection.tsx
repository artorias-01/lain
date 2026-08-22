import React from 'react';
import { Turntable } from '../Turntable';
import { usePlayerStore } from '../../store/usePlayerStore';
import { TrackInfo } from './TrackInfo';
import { TransportControls } from './TransportControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { WaveformVisualizer } from './WaveformVisualizer';
import { Disc3 } from 'lucide-react';

export const PlayerSection: React.FC = () => {
  const { isPlaying, tracks, currentTrackIndex } = usePlayerStore();
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  return (
    <section id="turntable-player" className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Editorial Header */}
      <div className="text-center mb-10 max-w-2xl z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-dim border border-accent/20 text-accent text-xs font-mono tracking-widest uppercase mb-3">
          <Disc3 className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Precision 2D Mechanical Deck</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-text-primary tracking-tight">
          Analog Tactile Console
        </h2>
        <p className="text-sm sm:text-base text-text-secondary mt-2">
          Watch the vector tonearm swing into the groove. Pure 2D physics & smooth GSAP timelines.
        </p>
      </div>

      {/* 2D Turntable Component */}
      <div className="w-full max-w-4xl mb-8 z-10">
        <Turntable isPlaying={isPlaying} albumArtUrl={currentTrack.albumArtUrl} />
      </div>

      {/* Integrated Editorial Audio Dashboard */}
      <div className="w-full max-w-4xl glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10">
        {/* Row 1: Track Info + Waveform + Volume */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-5 border-b border-border/80">
          <div className="w-full md:w-auto min-w-0">
            <TrackInfo />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <WaveformVisualizer isPlaying={isPlaying} barCount={12} />
            <VolumeControl />
          </div>
        </div>

        {/* Row 2: Progress Bar */}
        <div className="w-full pt-1">
          <ProgressBar />
        </div>

        {/* Row 3: Transport Controls */}
        <div className="flex items-center justify-center pt-2">
          <TransportControls />
        </div>
      </div>
    </section>
  );
};
