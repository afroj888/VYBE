import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { AudioVisualizer } from '../visualizer/AudioVisualizer';
import { LyricsStudio } from '../lyrics/LyricsStudio';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Mic2,
  Sparkles,
  Gauge,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface FullPlayerModalProps {
  onOpenAddToPlaylist?: () => void;
  onOpenReport?: () => void;
}

export const formatDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  onOpenAddToPlaylist,
  onOpenReport,
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    queue,
    queueIndex,
    isShuffle,
    repeatMode,
    isLoading,
    error,
    isFullPlayerOpen,
    setFullPlayerOpen,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleShuffle,
    cycleRepeatMode,
    removeFromQueue,
    playTrack,
  } = useAudio();

  const { isFavorite, toggleFavorite } = useLibrary();

  const [activeTab, setActiveTab] = useState<'visual' | 'lyrics' | 'queue'>('visual');
  const [visualMode, setVisualMode] = useState<'art' | 'visualizer'>('art');

  if (!isFullPlayerOpen || !currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const rates = [0.75, 1, 1.25, 1.5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Dynamic Soundscape ambient backlight */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000 ${
            isPlaying ? 'bg-purple-600 scale-125' : 'bg-purple-900/50 scale-100'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000 ${
            isPlaying ? 'bg-cyan-500 scale-125' : 'bg-cyan-900/50 scale-100'
          }`}
        />
      </div>

      <div className="relative w-full h-full md:h-auto md:max-h-[92vh] md:max-w-4xl bg-[#120D24]/95 border border-purple-500/20 md:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/20">
          <button
            onClick={() => setFullPlayerOpen(false)}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full transition-colors"
            aria-label="Close full player"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Central Tabs: Artwork / Lyrics / Queue */}
          <div className="flex items-center gap-1 bg-[#1A1333] p-1 rounded-xl border border-purple-500/10">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'visual'
                  ? 'bg-purple-600/40 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'lyrics'
                  ? 'bg-purple-600/40 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'queue'
                  ? 'bg-purple-600/40 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Queue ({queue.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="p-2 text-slate-400 hover:text-amber-400 rounded-full transition-colors"
                title="Report track"
                aria-label="Report track"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[320px] max-h-[460px]">
          {activeTab === 'visual' && (
            <div className="w-full flex flex-col items-center">
              {visualMode === 'art' ? (
                <div className="relative group w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-purple-500/20 bg-purple-950/40">
                  <img
                    src={currentTrack.artworkPath}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => setVisualMode('visualizer')}
                    className="absolute bottom-3 right-3 bg-[#0B0813]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs font-medium text-cyan-300 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Launch Visualizer</span>
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md flex flex-col items-center">
                  <AudioVisualizer className="w-full" />
                  <button
                    onClick={() => setVisualMode('art')}
                    className="mt-3 text-xs text-slate-400 hover:text-cyan-300 underline underline-offset-4"
                  >
                    Return to Album Cover
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lyrics' && (
            <div className="w-full h-full max-w-lg">
              <LyricsStudio className="h-[360px]" />
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="w-full max-w-lg h-[360px] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/20 text-xs text-slate-400">
                <span>Playing now and up next</span>
                <span>{queue.length} tracks</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-purple-950/40 py-2">
                {queue.map((track, idx) => {
                  const isCurrent = idx === queueIndex;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                        isCurrent
                          ? 'bg-purple-950/60 border border-purple-500/30'
                          : 'hover:bg-purple-950/20'
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => playTrack(track)}
                      >
                        <span className="w-4 text-xs font-mono text-slate-400">
                          {isCurrent ? (
                            <span className="text-cyan-400 font-bold">▶</span>
                          ) : (
                            idx + 1
                          )}
                        </span>
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-purple-900/30">
                          <img
                            src={track.artworkPath}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isCurrent ? 'text-cyan-300' : 'text-slate-200'
                            }`}
                          >
                            {track.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {track.artistName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">
                          {formatDuration(track.durationSeconds)}
                        </span>
                        {queue.length > 1 && (
                          <button
                            onClick={() => removeFromQueue(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                            title="Remove from queue"
                            aria-label="Remove track from queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Track Title & Meta Info */}
        <div className="px-6 py-2 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {currentTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 truncate">
              {currentTrack.artistName}
              {currentTrack.albumTitle && (
                <>
                  <span className="mx-1.5 text-slate-400">·</span>
                  <span className="text-slate-400">{currentTrack.albumTitle}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddToPlaylist && (
              <button
                onClick={onOpenAddToPlaylist}
                className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                title="Add to playlist"
                aria-label="Add to playlist"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`p-2 rounded-full transition-colors ${
                isFav ? 'text-pink-500 hover:text-pink-400' : 'text-slate-400 hover:text-white'
              }`}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Playback Error Warning if any */}
        {error && (
          <div className="mx-6 my-1 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Seeker / Timeline Progress Bar */}
        <div className="px-6 py-2">
          <div className="relative group flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-purple-950"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #22D3EE ${progressPercent}%, rgba(26, 19, 51, 0.8) ${progressPercent}%, rgba(26, 19, 51, 0.8) 100%)`,
              }}
              aria-label="Audio seeker progress"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5 tabular-nums">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Transport & Control Bar */}
        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between max-w-md mx-auto w-full">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isShuffle ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title={isShuffle ? 'Shuffle enabled' : 'Shuffle off'}
              aria-label="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Previous Track */}
            <button
              onClick={playPrevious}
              className="p-2 text-slate-300 hover:text-white active:scale-95 transition-all"
              aria-label="Previous track"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            {/* Play / Pause Primary CTA */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white flex items-center justify-center hover:opacity-95 active:scale-95 transition-all shadow-[0_0_24px_rgba(139,92,246,0.6)]"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={playNext}
              className="p-2 text-slate-300 hover:text-white active:scale-95 transition-all"
              aria-label="Next track"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={cycleRepeatMode}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
              aria-label="Repeat mode"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Bottom Secondary Controls: Speed and Volume */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-purple-900/20 text-xs">
            {/* Speed selector */}
            <div className="flex items-center gap-1 text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex items-center gap-1">
                {rates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      playbackRate === rate
                        ? 'bg-purple-600/40 text-cyan-300 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-300" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 sm:w-28 h-1 bg-purple-950 rounded-lg appearance-none cursor-pointer"
                aria-label="Volume slider"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
