import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useLibrary } from '../context/LibraryContext';
import { SEED_ALBUMS, MOOD_TAGS } from '../data/catalog';
import { Track, MoodCategory, GenreCategory, LanguageCategory } from '../types/music';
import { TrackCard } from '../components/catalog/TrackCard';
import { TrackRow } from '../components/catalog/TrackRow';
import {
  Compass,
  Sparkles,
  Play,
  Flame,
  Radio,
  Sliders,
  Disc3,
  Shuffle,
  Volume2,
} from 'lucide-react';

interface DiscoverPageProps {
  onOpenAddToPlaylist: (track: Track) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onOpenAddToPlaylist }) => {
  const { playTrack, addToQueue } = useAudio();
  const { allTracks } = useLibrary();

  // MoodMix states
  const [selectedMood, setSelectedMood] = useState<MoodCategory>('Chill');
  const [selectedGenre, setSelectedGenre] = useState<GenreCategory>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCategory>('All');

  const moods: MoodCategory[] = ['Chill', 'Workout', 'Happy', 'Focus', 'Romantic', 'Sad', 'Sleep'];
  const genres: GenreCategory[] = ['All', 'Electronic', 'Indie & Lo-Fi', 'Desi Hip-Hop', 'Acoustic', 'Synthwave', 'Bhojpuri Pop'];
  const languages: LanguageCategory[] = ['All', 'Hindi', 'Punjabi', 'Bhojpuri', 'English'];

  // Transparent rule-based MoodMix filtering
  const moodMixRecommendations = allTracks.filter((track) => {
    // 1. Check genre mapping of mood
    const allowedMoodGenres = MOOD_TAGS[selectedMood].genres;
    const matchesMood = allowedMoodGenres.some((g) =>
      track.genre.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(track.genre.toLowerCase())
    );

    // 2. Check genre filter if not All
    const matchesGenre = selectedGenre === 'All' || track.genre === selectedGenre;

    // 3. Check language filter if not All
    const matchesLang = selectedLanguage === 'All' || track.language === selectedLanguage;

    return (matchesMood || selectedGenre !== 'All') && matchesGenre && matchesLang;
  });

  const finalTracks = moodMixRecommendations.length > 0 ? moodMixRecommendations : allTracks.slice(0, 4);

  // VYBE Flow: Continuous generator
  const handleLaunchVybeFlow = () => {
    // Shuffle all tracks and start continuous sequence
    const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  const handlePlayMoodMix = () => {
    if (finalTracks.length > 0) {
      playTrack(finalTracks[0], finalTracks);
    }
  };

  return (
    <div className="space-y-10 pb-28">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Compass className="w-7 h-7 text-cyan-400" />
          <span>Discover &amp; MoodMix</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Algorithmic mood curation, continuous VYBE Flow, and verified catalog releases
        </p>
      </div>

      {/* VYBE Flow Feature Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 via-[#1F143D] to-cyan-950/60 border border-purple-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>CONTINUOUS LISTENING ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">VYBE Flow Mode</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Never let the cadence stop. Flow mode analyzes acoustic tempo and genre continuity to stitch seamless transitions without repeating tracks.
          </p>
        </div>

        <button
          onClick={handleLaunchVybeFlow}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Shuffle className="w-4 h-4" />
          <span>Start VYBE Flow</span>
        </button>
      </section>

      {/* MoodMix Interactive Studio */}
      <section className="bg-[#130E26]/90 border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/30">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              <span>MoodMix Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your frequency parameters to compute a custom queue
            </p>
          </div>

          <button
            onClick={handlePlayMoodMix}
            disabled={finalTracks.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Play Mix ({finalTracks.length})</span>
          </button>
        </div>

        {/* 1. Mood Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">1. Select Desired Mood</label>
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selectedMood === m
                    ? 'bg-purple-600/40 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-[#1A1333] border-purple-900/30 text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Genre Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">2. Genre Filter</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selectedGenre === g
                    ? 'bg-purple-600/40 border-cyan-400 text-cyan-300'
                    : 'bg-[#1A1333] border-purple-900/30 text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">3. Language Focus</label>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLanguage(l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selectedLanguage === l
                    ? 'bg-purple-600/40 border-cyan-400 text-cyan-300'
                    : 'bg-[#1A1333] border-purple-900/30 text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Computed Recommendations Output */}
        <div className="pt-4 border-t border-purple-900/20">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>
              Matching Tracks for{' '}
              <strong className="text-cyan-300">{selectedMood}</strong> Mood
            </span>
            <span className="font-mono">{finalTracks.length} tracks found</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {finalTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                queueContext={finalTracks}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Curated Albums Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-cyan-400" />
            <span>Curated Releases</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-length artist projects with verified metadata
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEED_ALBUMS.map((album) => (
            <div
              key={album.id}
              className="bg-[#130E26]/80 border border-purple-500/10 p-4 rounded-2xl flex flex-col group hover:border-purple-500/30 transition-all"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-purple-950/40">
                <img
                  src={album.artworkPath}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => playTrack(album.tracks[0], album.tracks)}
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Play Album"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-white truncate">{album.title}</h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">{album.artistName}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                <span>{album.releaseDate}</span>
                <span aria-hidden="true">·</span>
                <span>{album.tracks.length} tracks</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
