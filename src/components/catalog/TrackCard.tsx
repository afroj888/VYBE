import React from 'react';
import { Track } from '../../types/music';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { Play, Pause, Heart, MoreVertical, Plus, Radio } from 'lucide-react';

interface TrackCardProps {
  track: Track;
  queueContext?: Track[];
  onOpenAddToPlaylist?: (track: Track) => void;
  onOpenReport?: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  queueContext,
  onOpenAddToPlaylist,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueueNext } = useAudio();
  const { isFavorite, toggleFavorite } = useLibrary();

  const isCurrent = currentTrack?.id === track.id;
  const isPlayingThis = isCurrent && isPlaying;
  const isFav = isFavorite(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className="group relative bg-[#130E26]/80 hover:bg-[#1C1438] p-3 rounded-2xl border border-purple-500/10 hover:border-purple-500/30 transition-all duration-200 cursor-pointer flex flex-col shadow-lg hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]"
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-purple-950/40 mb-3">
        <img
          src={track.artworkPath}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Play overlay button */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-lg transition-all duration-200 ${
            isPlayingThis
              ? 'opacity-100 scale-100'
              : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 scale-95 hover:scale-105'
          }`}
          aria-label={isPlayingThis ? 'Pause track' : 'Play track'}
        >
          {isPlayingThis ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Favorite quick toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md transition-opacity ${
            isFav ? 'opacity-100 text-pink-500' : 'opacity-0 group-hover:opacity-100 text-white/80 hover:text-white'
          }`}
          aria-label="Toggle favorite"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Title & Artist */}
      <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-slate-100'}`}>
        {track.title}
      </h3>
      <p className="text-xs text-slate-400 truncate mt-0.5">
        {track.artistName}
      </p>

      {/* Clean unboxed metadata with dot separators (Zero-pill discipline) */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 truncate">
        <span>{track.genre}</span>
        <span aria-hidden="true">·</span>
        <span>{track.language}</span>
      </div>
    </div>
  );
};
