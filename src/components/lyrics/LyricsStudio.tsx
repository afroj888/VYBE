import React, { useEffect, useRef, useMemo } from 'react';
import { useAudio } from '../../context/AudioContext';
import { parseLrcLyrics } from '../../data/catalog';
import { Mic2, Music, CheckCircle2 } from 'lucide-react';

interface LyricsStudioProps {
  className?: string;
}

export const LyricsStudio: React.FC<LyricsStudioProps> = ({ className = '' }) => {
  const { currentTrack, currentTime, seek } = useAudio();
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const parsedLines = useMemo(() => {
    if (!currentTrack?.lyrics) return [];
    return parseLrcLyrics(currentTrack.lyrics);
  }, [currentTrack?.lyrics]);

  // Find active line index based on currentTime
  const activeIndex = useMemo(() => {
    if (parsedLines.length === 0) return -1;
    for (let i = parsedLines.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLines[i].time) {
        return i;
      }
    }
    return 0;
  }, [parsedLines, currentTime]);

  // Scroll active line smoothly into view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!currentTrack?.lyrics || parsedLines.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center text-slate-400 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-purple-950/40 border border-purple-800/30 flex items-center justify-center mb-3 text-purple-400">
          <Music className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">No Verified Lyrics Available</h4>
        <p className="text-xs text-slate-400 max-w-xs">
          Synchronized lyrics for &ldquo;{currentTrack?.title || 'this track'}&rdquo; are not licensed or uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-purple-900/20 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-purple-300 font-medium">
          <Mic2 className="w-3.5 h-3.5 text-cyan-400" />
          Synchronized Lyrics
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Tap any line to seek
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-5 scroll-smooth"
      >
        {parsedLines.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPast = idx < activeIndex;

          return (
            <div
              key={`${line.time}-${idx}`}
              ref={isActive ? activeLineRef : null}
              onClick={() => seek(line.time)}
              className={`cursor-pointer transition-all duration-300 select-none py-1.5 px-3 rounded-xl ${
                isActive
                  ? 'text-lg md:text-xl font-bold text-cyan-300 bg-purple-950/40 shadow-[0_0_20px_rgba(34,211,238,0.15)] scale-[1.02]'
                  : isPast
                  ? 'text-sm md:text-base font-medium text-slate-400 hover:text-slate-200'
                  : 'text-sm md:text-base font-medium text-slate-500 hover:text-slate-300'
              }`}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
