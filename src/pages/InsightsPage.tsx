import React, { useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useAudio } from '../context/AudioContext';
import { formatDuration } from '../components/player/FullPlayerModal';
import {
  BarChart2,
  Clock,
  Flame,
  Radio,
  Disc,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { listeningHistory, allTracks } = useLibrary();
  const { playTrack } = useAudio();

  // Compute actual measured listening time from history
  const totalMeasuredSeconds = useMemo(() => {
    return listeningHistory.reduce((acc, curr) => acc + (curr.listenedSeconds || 0), 0);
  }, [listeningHistory]);

  const totalMinutes = Math.floor(totalMeasuredSeconds / 60);

  // Compute top tracks based on real play events
  const topTracks = useMemo(() => {
    const counts: Record<string, { count: number; track: typeof allTracks[0] }> = {};

    listeningHistory.forEach((h) => {
      if (!counts[h.trackId]) {
        counts[h.trackId] = { count: 0, track: h.track };
      }
      counts[h.trackId].count += 1;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [listeningHistory, allTracks]);

  // Compute top genres
  const genreBreakdown = useMemo(() => {
    const genres: Record<string, number> = {};
    listeningHistory.forEach((h) => {
      const g = h.track?.genre || 'Electronic';
      genres[g] = (genres[g] || 0) + 1;
    });

    const total = listeningHistory.length || 1;
    return Object.entries(genres)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / total) * 100),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [listeningHistory]);

  return (
    <div className="space-y-8 pb-28">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-cyan-400" />
          <span>Listening Insights</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Measured statistics from your real playback events. Honest metrics without fabricated telemetry.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#130E26]/90 border border-purple-500/20 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Measured Listening Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {totalMinutes} <span className="text-sm font-sans font-medium text-slate-400">min</span>
          </div>
          <p className="text-[11px] text-slate-400">Total verified audio session duration</p>
        </div>

        <div className="bg-[#130E26]/90 border border-purple-500/20 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tracks Streamed</span>
            <Disc className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {listeningHistory.length}
          </div>
          <p className="text-[11px] text-slate-400">Logged session play events</p>
        </div>

        <div className="bg-[#130E26]/90 border border-purple-500/20 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Primary Frequency</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 truncate">
            {genreBreakdown[0]?.name || 'Electronic'}
          </div>
          <p className="text-[11px] text-slate-400">Most frequent genre stream</p>
        </div>
      </div>

      {/* 2-Column Split: Top Tracks and Genre Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Played Tracks */}
        <div className="bg-[#130E26]/80 border border-purple-500/20 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Top Streamed Tracks</span>
          </h2>

          <div className="divide-y divide-purple-950/40">
            {topTracks.map((item, idx) => (
              <div
                key={item.track.id}
                onClick={() => playTrack(item.track)}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-purple-950/20 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-4 text-xs font-mono text-slate-400 font-bold">{idx + 1}</span>
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-950 shrink-0">
                    <img src={item.track.artworkPath} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-100 truncate">{item.track.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.track.artistName}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-mono font-semibold text-cyan-300">
                    {item.count} {item.count === 1 ? 'play' : 'plays'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Genres Spectrum */}
        <div className="bg-[#130E26]/80 border border-purple-500/20 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-cyan-400" />
            <span>Genre Breakdown</span>
          </h2>

          <div className="space-y-4 pt-2">
            {genreBreakdown.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-mono text-cyan-300 tabular-nums">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-purple-950/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
