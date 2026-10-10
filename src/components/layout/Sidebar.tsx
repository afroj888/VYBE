import React from 'react';
import {
  Home,
  Compass,
  Search,
  Library,
  Upload,
  Heart,
  BarChart2,
  Shield,
  FileText,
  PlusSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onCreatePlaylist,
}) => {
  const { user } = useAuth();
  const { playlists } = useLibrary();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover & MoodMix', icon: Compass },
    { id: 'search', label: 'Search Catalog', icon: Search },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'upload', label: 'Upload Music', icon: Upload },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'insights', label: 'Listening Insights', icon: BarChart2 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0E0A1A]/95 border-r border-purple-950/40 p-4 space-y-6">
      {/* Primary Navigation */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 tracking-wider">
          MENU
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-950/70 text-cyan-300 border border-purple-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/20'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Playlist Section */}
      <div className="space-y-2 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
            YOUR PLAYLISTS
          </span>
          <button
            onClick={onCreatePlaylist}
            className="p-1 text-slate-400 hover:text-cyan-300 rounded transition-colors"
            title="Create Playlist"
            aria-label="Create playlist"
          >
            <PlusSquare className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setCurrentTab(`playlist-${pl.id}`)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors ${
                currentTab === `playlist-${pl.id}`
                  ? 'text-cyan-300 font-semibold bg-purple-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/20'
              }`}
            >
              {pl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom utility & admin links */}
      <div className="pt-3 border-t border-purple-950/40 space-y-1">
        {user?.role === 'admin' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'admin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Admin Console</span>
          </button>
        )}

        <button
          onClick={() => setCurrentTab('legal')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentTab === 'legal'
              ? 'text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Terms & Privacy</span>
        </button>
      </div>
    </aside>
  );
};
