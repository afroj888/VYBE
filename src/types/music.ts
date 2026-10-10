export type AudioSourceType = 'storage' | 'stream' | 'sample' | 'external';
export type TrackVisibility = 'public' | 'unlisted' | 'private';
export type LicenseType = 
  | 'Owner Original' 
  | 'Creative Commons / Authorized' 
  | 'Public Domain' 
  | 'Licensed Streaming';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artistId?: string;
  artistName: string;
  albumId?: string;
  albumTitle?: string;
  durationSeconds: number;
  genre: string;
  language: 'Hindi' | 'Punjabi' | 'Bhojpuri' | 'English' | 'International';
  artworkPath: string;
  sourceType: AudioSourceType;
  sourceUrl: string;
  storagePath?: string;
  ownerId?: string;
  visibility: TrackVisibility;
  licenseType: LicenseType;
  licenseReference?: string;
  licenseVerifiedAt?: string;
  isPublished: boolean;
  lyrics?: string; // Raw or timestamped [00:12.30] lyrics
  parsedLyrics?: LyricLine[];
  playCount?: number;
  createdAt: string;
}

export interface Artist {
  id: string;
  name: string;
  biography?: string;
  artworkPath: string;
  genres: string[];
  trackCount: number;
}

export interface Album {
  id: string;
  title: string;
  artistId?: string;
  artistName: string;
  artworkPath: string;
  releaseDate: string;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  ownerId: string;
  ownerName?: string;
  title: string;
  description?: string;
  artworkPath?: string;
  visibility: TrackVisibility;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarPath?: string;
  bio?: string;
  role: 'listener' | 'artist' | 'admin' | 'moderator';
  createdAt: string;
}

export interface ListeningHistoryEntry {
  id: string;
  trackId: string;
  track: Track;
  listenedAt: string;
  listenedSeconds: number;
}

export interface ReportItem {
  id: string;
  reporterId?: string;
  trackId: string;
  trackTitle: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'resolved';
  createdAt: string;
}

export type MoodCategory = 'Happy' | 'Chill' | 'Romantic' | 'Focus' | 'Workout' | 'Sad' | 'Sleep';
export type LanguageCategory = 'All' | 'Hindi' | 'Punjabi' | 'Bhojpuri' | 'English' | 'International';
export type GenreCategory = 'All' | 'Electronic' | 'Indie & Lo-Fi' | 'Desi Hip-Hop' | 'Classical & Folk' | 'Acoustic' | 'Synthwave' | 'Bhojpuri Pop';
