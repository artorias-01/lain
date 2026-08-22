import React from 'react';
import { TurntableScene } from '../3d/TurntableScene';
import { usePlayerStore } from '../../store/usePlayerStore';
import { TrackInfo } from './TrackInfo';
import { TransportControls } from './TransportControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { WaveformVisualizer } from './WaveformVisualizer';
import { Sparkles, Maximize2, Radio } from 'lucide-react';

export const PlayerSection: React.FC = () => {
  const { isPlaying, tracks, currentTrackIndex } = usePlayerStore();
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  return (
    <section id="turntable-player" className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Background Section Glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />

      {/* Main Section Header */}
      <div className="text-center mb-8 max-w-2xl z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-dim border border-accent/20 text-accent text-xs font-mono tracking-widest uppercase mb-3">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Interactive 3D Hi-Fi Deck</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-text-primary tracking-tight">
          Tactile Audio Showcase
        </h2>
        <p className="text-sm sm:text-base text-text-secondary mt-2">
          Experience real analog mechanical motion. Spin the vinyl, drop the tonearm, and feel the music.
        </p>
      </div>

      {/* Main 3D Canvas Stage Container */}
      <div className="w-full max-w-5xl h-[420px] sm:h-[500px] md:h-[560px] rounded-3xl overflow-hidden glass-panel-glow relative mb-6 shadow-2xl border border-white/10">
        {/* R3F Turntable Canvas */}
        <TurntableScene
          isPlaying={isPlaying}
          albumArtUrl={currentTrack.albumArtUrl}
        />

        {/* Top Floating Badge Bar inside Canvas */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-text-secondary">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-accent animate-ping' : 'bg-text-muted'}`} />
            <span>{isPlaying ? 'PLAYING • 33 RPM' : 'IDLE • RESTING'}</span>
          </div>

          <div className="pointer-events-auto">
            <WaveformVisualizer isPlaying={isPlaying} barCount={10} />
          </div>
        </div>
      </div>

      {/* Integrated Control Dashboard Console */}
      <div className="w-full max-w-5xl glass-panel rounded-2xl p-4 sm:p-6 md:p-8 space-y-6 shadow-2xl border border-white/10 z-10">
        {/* Row 1: Track Info + Waveform + Volume */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-border">
          <div className="w-full md:w-auto min-w-0">
            <TrackInfo />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
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
