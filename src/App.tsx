import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { AudioProvider } from './context/AudioContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullPlayerModal } from './components/player/FullPlayerModal';
import { AuthModal } from './components/modals/AuthModal';
import { PlaylistModal } from './components/modals/PlaylistModal';
import { AddToPlaylistModal } from './components/modals/AddToPlaylistModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { ReportModal } from './components/modals/ReportModal';

import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { UploadPage } from './pages/UploadPage';
import { InsightsPage } from './pages/InsightsPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { LegalPage } from './pages/LegalPage';

import { Track } from './types/music';
import { useAudio } from './context/AudioContext';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [reportModalTrack, setReportModalTrack] = useState<Track | null>(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  const { currentTrack } = useAudio();

  // Render the active view
  const renderContent = () => {
    if (currentTab.startsWith('playlist-')) {
      const plId = currentTab.replace('playlist-', '');
      return (
        <LibraryPage
          initialPlaylistId={plId}
          onOpenCreatePlaylist={() => setPlaylistModalOpen(true)}
          onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
        />
      );
    }

    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
          />
        );
      case 'discover':
        return (
          <DiscoverPage
            onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
          />
        );
      case 'search':
        return (
          <SearchPage
            onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
          />
        );
      case 'library':
        return (
          <LibraryPage
            initialTab="playlists"
            onOpenCreatePlaylist={() => setPlaylistModalOpen(true)}
            onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
          />
        );
      case 'favorites':
        return (
          <LibraryPage
            initialTab="favorites"
            onOpenCreatePlaylist={() => setPlaylistModalOpen(true)}
            onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
          />
        );
      case 'upload':
        return (
          <UploadPage
            onUploadSuccess={() => setCurrentTab('library')}
          />
        );
      case 'insights':
        return <InsightsPage />;
      case 'admin':
        return <AdminPage />;
      case 'profile':
        return (
          <ProfilePage
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenSupabaseConfig={() => setSupabaseModalOpen(true)}
          />
        );
      case 'legal':
        return <LegalPage />;
      default:
        return (
          <HomePage
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0813] text-slate-100">
      {/* Desktop & Mobile Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSupabaseConfig={() => setSupabaseModalOpen(true)}
      />

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onCreatePlaylist={() => setPlaylistModalOpen(true)}
        />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Persistent Mini Player */}
      <MiniPlayer />

      {/* Mobile Bottom Tab Bar */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Full-Screen Expanded Player Modal */}
      <FullPlayerModal
        onOpenAddToPlaylist={() => {
          if (currentTrack) setAddToPlaylistTrack(currentTrack);
        }}
        onOpenReport={() => {
          if (currentTrack) setReportModalTrack(currentTrack);
        }}
      />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <PlaylistModal
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
      />

      <AddToPlaylistModal
        track={addToPlaylistTrack}
        onClose={() => setAddToPlaylistTrack(null)}
        onCreateNewPlaylist={() => {
          setAddToPlaylistTrack(null);
          setPlaylistModalOpen(true);
        }}
      />

      <SupabaseConfigModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      <ReportModal
        track={reportModalTrack}
        onClose={() => setReportModalTrack(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <AudioProvider>
          <MainApp />
        </AudioProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}
