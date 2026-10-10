import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Track } from '../types/music';
import { TrackRow } from '../components/catalog/TrackRow';
import { Search, X, Filter, Music, AlertCircle } from 'lucide-react';

interface SearchPageProps {
  onOpenAddToPlaylist: (track: Track) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onOpenAddToPlaylist }) => {
  const { allTracks } = useLibrary();
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const languages = ['All', 'Hindi', 'Punjabi', 'Bhojpuri', 'English'];
  const genres = ['All', 'Electronic', 'Synthwave', 'Desi Hip-Hop', 'Acoustic', 'Indie & Lo-Fi', 'Bhojpuri Pop'];

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    return allTracks.filter((track) => {
      // Query match across title, artist, album, genre, language
      const matchesQuery =
        !q ||
        track.title.toLowerCase().includes(q) ||
        track.artistName.toLowerCase().includes(q) ||
        (track.albumTitle && track.albumTitle.toLowerCase().includes(q)) ||
        track.genre.toLowerCase().includes(q) ||
        track.language.toLowerCase().includes(q);

      // Filters
      const matchesLang = selectedLanguage === 'All' || track.language === selectedLanguage;
      const matchesGenre = selectedGenre === 'All' || track.genre === selectedGenre;

      return matchesQuery && matchesLang && matchesGenre;
    });
  }, [allTracks, query, selectedLanguage, selectedGenre]);

  return (
    <div className="space-y-6 pb-28">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Search className="w-7 h-7 text-cyan-400" />
          <span>Search Catalog</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Search across verified tracks, artists, albums, genres, and languages
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to? (e.g. Neon Horizon, Punjabi, Lo-Fi, Kavita)"
          className="w-full bg-[#130E26] border border-purple-500/20 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-xl"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Language filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">
            Language:
          </span>
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLanguage(l)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedLanguage === l
                  ? 'bg-purple-600/40 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white bg-[#1A1333]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Genre filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">
            Genre:
          </span>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedGenre === g
                  ? 'bg-purple-600/40 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white bg-[#1A1333]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{results.length} playable results found</span>
          <span>All tracks streamable via HTML5 Audio</span>
        </div>

        {results.length > 0 ? (
          <div className="bg-[#130E26]/70 border border-purple-500/10 rounded-2xl divide-y divide-purple-950/40 p-2 shadow-xl">
            {results.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                queueContext={results}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#130E26]/40 border border-purple-500/10 rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/20 mx-auto flex items-center justify-center text-purple-400">
              <Music className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No tracks match your query</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your spelling or reset the language and genre filter buttons to browse the catalog.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setSelectedLanguage('All');
                setSelectedGenre('All');
              }}
              className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-cyan-300 text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
