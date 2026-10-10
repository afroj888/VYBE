import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Playlist, Track, ListeningHistoryEntry, ReportItem } from '../types/music';
import { SEED_TRACKS } from '../data/catalog';
import { useAuth } from './AuthContext';
import { getSupabase } from '../lib/supabase';

interface LibraryContextType {
  playlists: Playlist[];
  favorites: string[]; // Track IDs
  uploadedTracks: Track[];
  listeningHistory: ListeningHistoryEntry[];
  reports: ReportItem[];
  createPlaylist: (title: string, description?: string, visibility?: 'public' | 'unlisted' | 'private') => Playlist;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, startIndex: number, endIndex: number) => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  recordListen: (track: Track, seconds: number) => void;
  uploadTrack: (trackData: Omit<Track, 'id' | 'createdAt'>) => Promise<Track>;
  deleteTrack: (trackId: string) => Promise<void>;
  submitReport: (trackId: string, trackTitle: string, reason: string, description?: string) => void;
  updateReportStatus: (reportId: string, status: ReportItem['status']) => void;
  allTracks: Track[];
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const PLAYLISTS_STORAGE_KEY = 'vybe_user_playlists';
const FAVORITES_STORAGE_KEY = 'vybe_user_favorites';
const UPLOADS_STORAGE_KEY = 'vybe_user_uploads';
const HISTORY_STORAGE_KEY = 'vybe_listening_history';
const REPORTS_STORAGE_KEY = 'vybe_content_reports';

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Initial demo playlists
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'pl-1',
        ownerId: 'usr-100-demo',
        ownerName: 'Afroj',
        title: 'Late Night Coding & Beats',
        description: 'Immersive synthwave and lo-fi soundscapes for deep focus sessions.',
        artworkPath: '/src/assets/images/album_midnight_neon_1791657242375.jpg',
        visibility: 'public',
        tracks: [SEED_TRACKS[1], SEED_TRACKS[6], SEED_TRACKS[4]],
        createdAt: '2026-02-01T12:00:00Z',
        updatedAt: '2026-02-01T12:00:00Z',
      },
      {
        id: 'pl-2',
        ownerId: 'usr-100-demo',
        ownerName: 'Afroj',
        title: 'Desi Bass & Heavy Grooves',
        description: 'Pumping Punjabi dhol, desi trap and modern rhythm collective.',
        artworkPath: '/src/assets/images/album_desi_beats_1791657260109.jpg',
        visibility: 'public',
        tracks: [SEED_TRACKS[2], SEED_TRACKS[7], SEED_TRACKS[0]],
        createdAt: '2026-02-15T10:00:00Z',
        updatedAt: '2026-02-15T10:00:00Z',
      },
    ];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [SEED_TRACKS[0].id, SEED_TRACKS[2].id];
  });

  const [uploadedTracks, setUploadedTracks] = useState<Track[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(UPLOADS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });

  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'hist-1',
        trackId: SEED_TRACKS[0].id,
        track: SEED_TRACKS[0],
        listenedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        listenedSeconds: 240,
      },
      {
        id: 'hist-2',
        trackId: SEED_TRACKS[2].id,
        track: SEED_TRACKS[2],
        listenedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        listenedSeconds: 310,
      },
      {
        id: 'hist-3',
        trackId: SEED_TRACKS[1].id,
        track: SEED_TRACKS[1],
        listenedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        listenedSeconds: 190,
      },
    ];
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'rep-1',
        trackId: 'track-4',
        trackTitle: 'Purvanchal Sunset',
        reason: 'Metadata discrepancy',
        description: 'Artist biographical link requires updated cultural attribution label.',
        status: 'pending',
        createdAt: '2026-03-01T12:00:00Z',
      },
    ];
  });

  // Combined tracks (seed catalog + user uploaded tracks)
  const allTracks = [...SEED_TRACKS, ...uploadedTracks];

  // Save changes to localStorage and optionally sync to Supabase
  useEffect(() => {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(uploadedTracks));
  }, [uploadedTracks]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(listeningHistory));
  }, [listeningHistory]);

  useEffect(() => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const createPlaylist = useCallback((
    title: string,
    description = '',
    visibility: 'public' | 'unlisted' | 'private' = 'public'
  ): Playlist => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      ownerId: user?.id || 'usr-anon',
      ownerName: user?.displayName || 'User',
      title: title.trim(),
      description: description.trim(),
      artworkPath: '/src/assets/images/hero_featured_album_1791657226361.jpg',
      visibility,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPlaylists((prev) => [newPlaylist, ...prev]);

    // Supabase sync if active
    const supabase = getSupabase();
    if (supabase && user) {
      supabase.from('playlists').insert({
        id: newPlaylist.id,
        owner_id: user.id,
        title: newPlaylist.title,
        description: newPlaylist.description,
        visibility: newPlaylist.visibility,
        artwork_path: newPlaylist.artworkPath,
      }).then(() => {});
    }

    return newPlaylist;
  }, [user]);

  const updatePlaylist = useCallback((id: string, updates: Partial<Playlist>) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('playlists').delete().eq('id', id).then(() => {});
    }
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          // Avoid duplicates if already present
          if (p.tracks.some((t) => t.id === track.id)) return p;
          return {
            ...p,
            tracks: [...p.tracks, track],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return {
            ...p,
            tracks: p.tracks.filter((t) => t.id !== trackId),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  }, []);

  const reorderPlaylistTracks = useCallback((playlistId: string, startIndex: number, endIndex: number) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          const result = Array.from(p.tracks);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return {
            ...p,
            tracks: result,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(trackId);
      const next = exists ? prev.filter((id) => id !== trackId) : [...prev, trackId];

      const supabase = getSupabase();
      if (supabase && user) {
        if (exists) {
          supabase.from('favorites').delete().eq('user_id', user.id).eq('track_id', trackId).then(() => {});
        } else {
          supabase.from('favorites').insert({ user_id: user.id, track_id: trackId }).then(() => {});
        }
      }

      return next;
    });
  }, [user]);

  const isFavorite = useCallback((trackId: string) => {
    return favorites.includes(trackId);
  }, [favorites]);

  const recordListen = useCallback((track: Track, seconds: number) => {
    if (seconds < 5) return; // avoid spurious 1-second clicks

    const entry: ListeningHistoryEntry = {
      id: `lh-${Date.now()}`,
      trackId: track.id,
      track,
      listenedAt: new Date().toISOString(),
      listenedSeconds: Math.floor(seconds),
    };

    setListeningHistory((prev) => [entry, ...prev.slice(0, 49)]); // keep latest 50

    const supabase = getSupabase();
    if (supabase && user) {
      supabase.from('listening_history').insert({
        user_id: user.id,
        track_id: track.id,
        listened_seconds: Math.floor(seconds),
      }).then(() => {});
    }
  }, [user]);

  const uploadTrack = useCallback(async (trackData: Omit<Track, 'id' | 'createdAt'>): Promise<Track> => {
    const newTrack: Track = {
      ...trackData,
      id: `up-${Date.now()}`,
      ownerId: user?.id,
      createdAt: new Date().toISOString(),
    };

    setUploadedTracks((prev) => [newTrack, ...prev]);

    // Supabase insertion if configured
    const supabase = getSupabase();
    if (supabase && user) {
      await supabase.from('tracks').insert({
        id: newTrack.id,
        title: newTrack.title,
        artist_name: newTrack.artistName,
        duration_seconds: newTrack.durationSeconds,
        genre: newTrack.genre,
        language: newTrack.language,
        artwork_path: newTrack.artworkPath,
        source_type: newTrack.sourceType,
        source_url: newTrack.sourceUrl,
        owner_id: user.id,
        visibility: newTrack.visibility,
        license_type: newTrack.licenseType,
        license_reference: newTrack.licenseReference,
        license_verified_at: newTrack.licenseVerifiedAt,
        is_published: newTrack.isPublished,
      });
    }

    return newTrack;
  }, [user]);

  const deleteTrack = useCallback(async (trackId: string) => {
    setUploadedTracks((prev) => prev.filter((t) => t.id !== trackId));
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('tracks').delete().eq('id', trackId);
    }
  }, []);

  const submitReport = useCallback((trackId: string, trackTitle: string, reason: string, description = '') => {
    const report: ReportItem = {
      id: `rep-${Date.now()}`,
      reporterId: user?.id,
      trackId,
      trackTitle,
      reason,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [report, ...prev]);
  }, [user]);

  const updateReportStatus = useCallback((reportId: string, status: ReportItem['status']) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
  }, []);

  return (
    <LibraryContext.Provider
      value={{
        playlists,
        favorites,
        uploadedTracks,
        listeningHistory,
        reports,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        reorderPlaylistTracks,
        toggleFavorite,
        isFavorite,
        recordListen,
        uploadTrack,
        deleteTrack,
        submitReport,
        updateReportStatus,
        allTracks,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
