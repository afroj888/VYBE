import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { Play, Pause, SkipForward, Heart, Maximize2, Loader2, Sparkles } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    seek,
    isLoading,
    setFullPlayerOpen,
  } = useAudio();

  const { isFavorite, toggleFavorite } = useLibrary();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = isFavorite(currentTrack.id);

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 px-2 sm:px-4 pb-2 md:pb-3 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="relative bg-[#120D24]/95 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Progress bar line along top border */}
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-purple-950/50 cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              seek(ratio * duration);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between p-2 sm:p-2.5 gap-2 sm:gap-4">
            {/* Left: Artwork & Track Meta */}
            <div
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              onClick={() => setFullPlayerOpen(true)}
            >
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-purple-900/30 border border-purple-500/20">
                <img
                  src={currentTrack.artworkPath}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback artwork
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="flex gap-0.5 items-end h-4">
                      <span className="w-0.5 bg-cyan-400 h-3 animate-pulse" />
                      <span className="w-0.5 bg-purple-400 h-4 animate-pulse delay-75" />
                      <span className="w-0.5 bg-cyan-400 h-2 animate-pulse delay-150" />
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate flex items-center gap-1.5">
                  {currentTrack.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  {currentTrack.artistName}
                </p>
              </div>
            </div>

            {/* Right: Quick Controls */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentTrack.id);
                }}
                className={`p-2 rounded-full transition-colors ${
                  isFav ? 'text-pink-500 hover:text-pink-400' : 'text-slate-400 hover:text-white'
                }`}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>

              {/* Play / Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                disabled={isLoading}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playNext();
                }}
                className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                aria-label="Next track"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Expand to Full Player */}
              <button
                onClick={() => setFullPlayerOpen(true)}
                className="hidden sm:flex p-2 text-slate-400 hover:text-cyan-300 rounded-full transition-colors"
                aria-label="Expand player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
