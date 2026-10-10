import React, { useState } from 'react';
import { Shield, FileText, Lock, Mail, AlertTriangle } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'copyright'>('privacy');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <FileText className="w-7 h-7 text-cyan-400" />
          <span>Privacy, Terms &amp; Content Rights</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Transparent policies governing audio distribution, user data privacy, and copyright compliance
        </p>
      </div>

      {/* Segmented Controls */}
      <div className="flex items-center gap-2 border-b border-purple-900/30 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            activeTab === 'privacy' ? 'bg-purple-600/40 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            activeTab === 'terms' ? 'bg-purple-600/40 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setActiveTab('copyright')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            activeTab === 'copyright' ? 'bg-purple-600/40 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          DMCA &amp; Content Rights
        </button>
      </div>

      <div className="bg-[#130E26]/90 border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6">
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              VYBE collects minimal, necessary account information including your email address, chosen username, display name, and optional avatar image when you create an account via Supabase Authentication.
            </p>

            <h2 className="text-base font-bold text-white">2. Listening History &amp; Analytics</h2>
            <p>
              When audio streams play for more than 5 seconds, an event is logged in your personal listening history to calculate listening insights, favorite genres, and resume queues. We do not sell your personal listening records or user metadata to third-party ad brokers.
            </p>

            <h2 className="text-base font-bold text-white">3. Audio Uploads &amp; Storage</h2>
            <p>
              Audio files uploaded to VYBE are stored in secured storage buckets. Private tracks remain accessible only to the authenticated uploader via secure Row Level Security policies. Public tracks are subject to moderation and community reporting.
            </p>

            <h2 className="text-base font-bold text-white">4. Data Deletion &amp; Account Purge</h2>
            <p>
              Users can initiate complete account and associated listening history deletion directly from the Profile Settings tab at any time.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or streaming music on VYBE (&ldquo;Feel Every Beat&rdquo;), you agree to comply with these terms, browser security standards, and applicable copyright laws.
            </p>

            <h2 className="text-base font-bold text-white">2. Permitted Use</h2>
            <p>
              You agree not to reverse engineer the audio delivery pipeline, extract protected files without authorization, or inject automated scraping routines that degrade streaming performance for other listeners.
            </p>

            <h2 className="text-base font-bold text-white">3. User Submissions &amp; Distribution Warranty</h2>
            <p>
              When uploading music files, you explicitly represent and warrant that you own or have obtained all necessary licenses, copyrights, master rights, and performance authorizations from the respective rights holders.
            </p>
          </div>
        )}

        {activeTab === 'copyright' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">DMCA &amp; Content Takedown Process</h2>
            <p>
              VYBE respects the intellectual property rights of artists, publishers, and record labels. We operate a prompt notice-and-takedown procedure in accordance with the Digital Millennium Copyright Act.
            </p>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 space-y-2">
              <h3 className="font-semibold text-white">Submitting a Takedown Notice</h3>
              <p className="text-xs text-slate-300">
                To request immediate removal of allegedly infringing content, please submit the following to our designated agent:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                <li>Identification of the copyrighted work claimed to be infringed.</li>
                <li>Specific URL or Track ID on VYBE.</li>
                <li>Your contact information and legal statement of good faith belief.</li>
                <li>Physical or electronic signature of the authorized copyright owner.</li>
              </ul>
              <div className="pt-2 text-xs text-cyan-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>Designated Copyright Agent: copyright@vybe-audio.internal</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
