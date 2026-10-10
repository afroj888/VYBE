import React, { useState } from 'react';
import { Track } from '../../types/music';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { formatDuration } from '../player/FullPlayerModal';
import { Play, Pause, Heart, MoreVertical, Plus, Radio, Trash2, ListPlus } from 'lucide-react';

interface TrackRowProps {
  track: Track;
  index: number;
  queueContext?: Track[];
  onOpenAddToPlaylist?: (track: Track) => void;
  onRemove?: () => void;
  showAlbum?: boolean;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  queueContext,
  onOpenAddToPlaylist,
  onRemove,
  showAlbum = true,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueueNext } = useAudio();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isPlayingThis = isCurrent && isPlaying;
  const isFav = isFavorite(track.id);

  const handleRowPlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  return (
    <div
      onClick={handleRowPlay}
      className={`group relative flex items-center justify-between p-2.5 sm:px-3 rounded-xl transition-colors cursor-pointer ${
        isCurrent
          ? 'bg-purple-950/60 border border-purple-500/30'
          : 'hover:bg-purple-950/30'
      }`}
    >
      {/* Left: Index / Play Icon & Track Metadata */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="w-5 text-center text-xs font-mono text-slate-400 shrink-0">
          {isPlayingThis ? (
            <span className="flex gap-0.5 justify-center items-end h-3">
              <span className="w-0.5 bg-cyan-400 h-2 animate-pulse" />
              <span className="w-0.5 bg-purple-400 h-3 animate-pulse delay-75" />
              <span className="w-0.5 bg-cyan-400 h-1.5 animate-pulse delay-150" />
            </span>
          ) : isCurrent ? (
            <span className="text-cyan-400">▶</span>
          ) : (
            <span className="group-hover:hidden">{index + 1}</span>
          )}
          <span className={`hidden ${isCurrent ? '' : 'group-hover:block'} text-slate-200`}>
            <Play className="w-3.5 h-3.5 mx-auto fill-current" />
          </span>
        </div>

        {/* Thumbnail Artwork */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-purple-900/30 border border-purple-500/10">
          <img
            src={track.artworkPath}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1 pr-2">
          <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-slate-100'}`}>
            {track.title}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 truncate">
            {track.artistName}
          </p>
        </div>
      </div>

      {/* Middle: Album & Genre (Desktop only) */}
      {showAlbum && (
        <div className="hidden md:flex flex-1 items-center min-w-0 px-4 text-xs text-slate-400 truncate">
          <span className="truncate">{track.albumTitle || 'Single'}</span>
        </div>
      )}

      {/* Right: Duration & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isFav ? 'text-pink-500 hover:text-pink-400' : 'text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 sm:opacity-100'
          }`}
          aria-label={isFav ? 'Remove favorite' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        <span className="text-xs font-mono text-slate-400 tabular-nums">
          {formatDuration(track.durationSeconds)}
        </span>

        {/* Quick Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Track options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-8 z-30 w-44 bg-[#1B1333] border border-purple-500/20 rounded-xl shadow-2xl py-1 text-xs">
                {onOpenAddToPlaylist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onOpenAddToPlaylist(track);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-purple-900/40 flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add to Playlist</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    addToQueueNext(track);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-purple-900/40 flex items-center gap-2"
                >
                  <ListPlus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Play Next</span>
                </button>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onRemove();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-300 hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
