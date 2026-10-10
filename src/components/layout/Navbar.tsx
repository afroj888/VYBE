import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogIn, Database } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenSupabaseConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenSupabaseConfig,
}) => {
  const { user, isSupabaseConnected } = useAuth();

  return (
    <header className="sticky top-0 z-20 w-full bg-[#0B0813]/90 backdrop-blur-xl border-b border-purple-950/40 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <div
        onClick={() => setCurrentTab('home')}
        className="cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 select-none group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#0B0813] rounded-[10px] flex items-center justify-center">
            <span className="text-cyan-400 font-extrabold text-sm tracking-widest">V</span>
          </div>
        </div>
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
          VYBE
        </span>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links (hidden on mobile, visible on desktop) */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <button
          onClick={() => setCurrentTab('home')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'home' ? 'text-cyan-300 font-semibold' : ''
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentTab('discover')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'discover' ? 'text-cyan-300 font-semibold' : ''
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setCurrentTab('search')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'search' ? 'text-cyan-300 font-semibold' : ''
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setCurrentTab('library')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'library' ? 'text-cyan-300 font-semibold' : ''
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setCurrentTab('insights')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'insights' ? 'text-cyan-300 font-semibold' : ''
          }`}
        >
          Insights
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Supabase status indicator & config trigger */}
        <button
          onClick={onOpenSupabaseConfig}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#1A1333]/70 hover:bg-[#1A1333] border border-purple-500/20 transition-colors"
          title="Supabase Database Connection"
        >
          <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="hidden lg:inline">{isSupabaseConnected ? 'Supabase Connected' : 'Supabase Setup'}</span>
        </button>

        {user ? (
          <button
            onClick={() => setCurrentTab('profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 text-xs font-medium text-slate-200 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {user.displayName.charAt(0)}
            </div>
            <span className="hidden sm:inline max-w-[100px] truncate">{user.displayName}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
