import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Track } from '../../types/music';
import { X, Plus, Check, Music } from 'lucide-react';

interface AddToPlaylistModalProps {
  track: Track | null;
  onClose: () => void;
  onCreateNewPlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  track,
  onClose,
  onCreateNewPlaylist,
}) => {
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useLibrary();
  const [notification, setNotification] = useState<string | null>(null);

  if (!track) return null;

  const handleToggle = (playlistId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;

    const exists = pl.tracks.some((t) => t.id === track.id);
    if (exists) {
      removeTrackFromPlaylist(playlistId, track.id);
      setNotification(`Removed from "${pl.title}"`);
    } else {
      addTrackToPlaylist(playlistId, track);
      setNotification(`Added to "${pl.title}"`);
    }

    setTimeout(() => {
      setNotification(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm bg-[#130E26] border border-purple-500/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
          <div>
            <h3 className="text-base font-bold text-white">Add to Playlist</h3>
            <p className="text-xs text-slate-400 truncate max-w-[220px]">{track.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="my-3 p-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-cyan-300 text-xs text-center">
            {notification}
          </div>
        )}

        <div className="my-4 max-h-60 overflow-y-auto space-y-2 pr-1">
          {playlists.map((pl) => {
            const isIncluded = pl.tracks.some((t) => t.id === track.id);
            return (
              <div
                key={pl.id}
                onClick={() => handleToggle(pl.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isIncluded
                    ? 'bg-purple-950/60 border-cyan-400/40 text-cyan-300'
                    : 'bg-[#1A1333]/60 border-purple-900/20 text-slate-200 hover:bg-[#1A1333]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-900/40 shrink-0">
                    <img src={pl.artworkPath} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{pl.title}</p>
                    <p className="text-[10px] text-slate-400">{pl.tracks.length} tracks</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isIncluded ? 'bg-cyan-500 text-black' : 'border border-slate-600 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            onClose();
            onCreateNewPlaylist();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>
    </div>
  );
};
