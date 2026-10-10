import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useAudio } from '../context/AudioContext';
import { Track, Playlist } from '../types/music';
import { TrackRow } from '../components/catalog/TrackRow';
import { formatDuration } from '../components/player/FullPlayerModal';
import {
  Library,
  Heart,
  Upload,
  Clock,
  Plus,
  Play,
  Trash2,
  Lock,
  Globe,
  Share2,
  Music2,
  Check,
} from 'lucide-react';

interface LibraryPageProps {
  initialPlaylistId?: string | null;
  initialTab?: 'playlists' | 'favorites' | 'uploads' | 'history';
  onOpenCreatePlaylist: () => void;
  onOpenAddToPlaylist: (track: Track) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  initialPlaylistId,
  initialTab = 'playlists',
  onOpenCreatePlaylist,
  onOpenAddToPlaylist,
}) => {
  const {
    playlists,
    favorites,
    uploadedTracks,
    listeningHistory,
    deletePlaylist,
    removeTrackFromPlaylist,
    allTracks,
  } = useLibrary();

  const { playTrack } = useAudio();

  const [activeTab, setActiveTab] = useState<'playlists' | 'favorites' | 'uploads' | 'history'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(initialPlaylistId || null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Favorited tracks
  const favoriteTracks = allTracks.filter((t) => favorites.includes(t.id));

  // Current selected playlist
  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  const handleSharePlaylist = (pl: Playlist) => {
    const url = `${window.location.origin}/#playlist-${pl.id}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // If viewing a specific playlist
  if (selectedPlaylistId && currentPlaylist) {
    return (
      <div className="space-y-6 pb-28">
        {/* Playlist Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-b from-purple-900/40 via-[#130E26] to-[#0B0813] p-6 rounded-3xl border border-purple-500/20">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl bg-purple-950 shrink-0">
            <img
              src={currentPlaylist.artworkPath}
              alt={currentPlaylist.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-cyan-400">
              {currentPlaylist.visibility === 'private' ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              <span className="capitalize">{currentPlaylist.visibility} Playlist</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {currentPlaylist.title}
            </h1>

            {currentPlaylist.description && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {currentPlaylist.description}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 pt-1">
              <span>By {currentPlaylist.ownerName || 'You'}</span>
              <span aria-hidden="true">·</span>
              <span>{currentPlaylist.tracks.length} tracks</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
              <button
                onClick={() => {
                  if (currentPlaylist.tracks.length > 0) {
                    playTrack(currentPlaylist.tracks[0], currentPlaylist.tracks);
                  }
                }}
                disabled={currentPlaylist.tracks.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:opacity-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Playlist</span>
              </button>

              <button
                onClick={() => handleSharePlaylist(currentPlaylist)}
                className="px-4 py-2.5 rounded-xl bg-[#1A1333] hover:bg-[#231A45] border border-purple-500/20 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Delete this playlist?')) {
                    deletePlaylist(currentPlaylist.id);
                    setSelectedPlaylistId(null);
                  }
                }}
                className="p-2.5 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelectedPlaylistId(null)}
          className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
        >
          ← Back to All Playlists
        </button>

        {/* Playlist Tracks Listing */}
        <div className="bg-[#130E26]/70 border border-purple-500/10 rounded-2xl divide-y divide-purple-950/40 p-2 shadow-xl">
          {currentPlaylist.tracks.length > 0 ? (
            currentPlaylist.tracks.map((track, idx) => (
              <TrackRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx}
                queueContext={currentPlaylist.tracks}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
                onRemove={() => removeTrackFromPlaylist(currentPlaylist.id, track.id)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No tracks in this playlist yet. Browse the catalog and add songs using the (+) button!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Library className="w-7 h-7 text-cyan-400" />
            <span>My Music Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your customized playlists, favorites, uploaded audio, and listening history
          </p>
        </div>

        <button
          onClick={onOpenCreatePlaylist}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg hover:opacity-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-purple-900/30 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'playlists'
              ? 'bg-purple-600/40 text-cyan-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Music2 className="w-4 h-4" />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'favorites'
              ? 'bg-purple-600/40 text-cyan-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 text-pink-400" />
          <span>Favorites ({favoriteTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'uploads'
              ? 'bg-purple-600/40 text-cyan-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4 text-purple-400" />
          <span>Uploaded ({uploadedTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'history'
              ? 'bg-purple-600/40 text-cyan-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Recently Played</span>
        </button>
      </div>

      {/* Playlists Grid */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className="bg-[#130E26]/80 hover:bg-[#1A1333] border border-purple-500/10 hover:border-purple-500/30 p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all group shadow-lg"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-purple-950 shrink-0 relative">
                <img src={pl.artworkPath} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-6 h-6 text-cyan-300 fill-current" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white truncate">{pl.title}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{pl.description || 'Custom playlist'}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                  <span>{pl.tracks.length} tracks</span>
                  <span>·</span>
                  <span className="capitalize">{pl.visibility}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Favorites List */}
      {activeTab === 'favorites' && (
        <div className="bg-[#130E26]/70 border border-purple-500/10 rounded-2xl divide-y divide-purple-950/40 p-2 shadow-xl">
          {favoriteTracks.length > 0 ? (
            favoriteTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                queueContext={favoriteTracks}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
              />
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No favorites saved yet. Click the heart icon on any track to save it here!
            </div>
          )}
        </div>
      )}

      {/* Uploads List */}
      {activeTab === 'uploads' && (
        <div className="bg-[#130E26]/70 border border-purple-500/10 rounded-2xl divide-y divide-purple-950/40 p-2 shadow-xl">
          {uploadedTracks.length > 0 ? (
            uploadedTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                queueContext={uploadedTracks}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
              />
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              You haven&rsquo;t uploaded any tracks yet. Go to &ldquo;Upload Music&rdquo; to add your audio files.
            </div>
          )}
        </div>
      )}

      {/* Listening History List */}
      {activeTab === 'history' && (
        <div className="bg-[#130E26]/70 border border-purple-500/10 rounded-2xl divide-y divide-purple-950/40 p-2 shadow-xl">
          {listeningHistory.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xs font-mono text-slate-400 w-5">{idx + 1}</span>
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-purple-950 shrink-0">
                  <img src={item.track.artworkPath} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-100 truncate">{item.track.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{item.track.artistName}</p>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {new Date(item.listenedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
