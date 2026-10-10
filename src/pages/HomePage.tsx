import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { SEED_TRACKS, SEED_ALBUMS, SEED_ARTISTS, MOOD_TAGS } from '../data/catalog';
import { Track, MoodCategory, LanguageCategory } from '../types/music';
import { TrackCard } from '../components/catalog/TrackCard';
import { TrackRow } from '../components/catalog/TrackRow';
import {
  Play,
  Pause,
  Sparkles,
  Flame,
  Globe2,
  Disc,
  Headphones,
  ArrowRight,
  Radio,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenAddToPlaylist: (track: Track) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAddToPlaylist }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const { user } = useAuth();
  const { allTracks } = useLibrary();

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCategory>('All');

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const featuredAlbum = SEED_ALBUMS[0];
  const featuredTrack = featuredAlbum.tracks[0];
  const isPlayingFeatured = currentTrack?.id === featuredTrack?.id && isPlaying;

  // Filtered tracks by language
  const languageFilteredTracks = allTracks.filter((t) => {
    if (selectedLanguage === 'All') return true;
    return t.language === selectedLanguage;
  });

  const languages: LanguageCategory[] = ['All', 'Hindi', 'Punjabi', 'Bhojpuri', 'English'];
  const moods: MoodCategory[] = ['Chill', 'Workout', 'Happy', 'Focus', 'Romantic', 'Sleep'];

  return (
    <div className="space-y-10 pb-28">
      {/* 1. Personalized Welcome & Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#20153D] via-[#140D28] to-[#0B0813] border border-purple-500/20 p-6 sm:p-8 md:p-10 shadow-2xl">
        {/* Cinematic ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="flex-1 space-y-3.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-cyan-400 tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>FEATURED ALBUM SPOTLIGHT</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {getGreeting()}, {user?.displayName || 'Sonic Traveler'}.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Experience &ldquo;{featuredAlbum.title}&rdquo; by {featuredAlbum.artistName}. High-definition synthetic waveforms and authentic traditional acoustic cadences.
            </p>

            {/* Editorial track kicker with unboxed metadata */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 pt-1">
              <span>{featuredTrack.title}</span>
              <span aria-hidden="true">·</span>
              <span>{featuredTrack.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{featuredTrack.language}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              <button
                onClick={() => {
                  if (isPlayingFeatured) {
                    togglePlay();
                  } else {
                    playTrack(featuredTrack, featuredAlbum.tracks);
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
              >
                {isPlayingFeatured ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
                <span>{isPlayingFeatured ? 'Pause Album' : 'Play Featured Album'}</span>
              </button>

              <button
                onClick={() => onNavigate('discover')}
                className="px-5 py-3 rounded-2xl bg-[#1A1333]/80 hover:bg-[#1A1333] border border-purple-500/20 text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Launch MoodMix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Album Cover Graphic */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.8)] border border-purple-500/30 shrink-0 group relative">
            <img
              src={featuredAlbum.artworkPath}
              alt={featuredAlbum.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <span className="text-xs font-semibold text-white truncate">{featuredAlbum.title}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Language Categories & Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-cyan-400" />
              <span>Explore by Language</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Discover authentic Hindi, Punjabi, Bhojpuri, and International sounds
            </p>
          </div>

          {/* Interactive filter tabs (functional buttons) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#130E26] rounded-xl border border-purple-900/30 overflow-x-auto">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-purple-600/40 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered Track Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {languageFilteredTracks.slice(0, 5).map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              queueContext={languageFilteredTracks}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
            />
          ))}
        </div>
      </section>

      {/* 3. Mood-Based Quick Collections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              <span>Mood Collections</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tune into sonic spaces mapped to how you feel
            </p>
          </div>
          <button
            onClick={() => onNavigate('discover')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>MoodMix Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {moods.map((mood) => {
            const tag = MOOD_TAGS[mood];
            return (
              <div
                key={mood}
                onClick={() => onNavigate('discover')}
                className={`p-4 rounded-2xl border bg-gradient-to-br cursor-pointer hover:scale-[1.02] transition-transform ${tag.color}`}
              >
                <h3 className="text-sm font-bold text-white mb-1">{mood}</h3>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                  {tag.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Trending & Editor's Picks (Honest Catalog Data) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Trending &amp; Editor&rsquo;s Picks</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified legal audio streams based on listener frequency
            </p>
          </div>
        </div>

        <div className="bg-[#130E26]/60 border border-purple-500/10 rounded-2xl divide-y divide-purple-950/40 p-1 sm:p-2">
          {allTracks.slice(0, 5).map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              queueContext={allTracks}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
            />
          ))}
        </div>
      </section>

      {/* 5. Popular Artists */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-cyan-400" />
            <span>Featured Artists</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Innovators shaping contemporary fusion and electronic soundscapes
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SEED_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              className="bg-[#130E26]/80 border border-purple-500/10 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-purple-500/30 transition-all"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-purple-500/20 group-hover:scale-105 transition-transform">
                <img
                  src={artist.artworkPath}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-bold text-white truncate w-full">{artist.name}</h3>
              <p className="text-xs text-slate-400 truncate w-full mt-0.5">
                {artist.genres.join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
