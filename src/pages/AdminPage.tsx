import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertTriangle, Check, Trash2, Globe, Lock, Eye, CheckCircle2 } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { allTracks, deleteTrack, reports, updateReportStatus } = useLibrary();
  const { user } = useAuth();
  const [tab, setTab] = useState<'catalog' | 'reports'>('catalog');

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3 max-w-md mx-auto">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Administrative Access Restricted</h2>
        <p className="text-xs text-slate-400">
          This section requires the verified <code className="text-cyan-300">admin</code> or{' '}
          <code className="text-cyan-300">moderator</code> role in Supabase PostgreSQL user_roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-amber-400" />
            <span>Admin &amp; Moderation Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Catalog governance, metadata auditing, copyright disputes, and visibility controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            Role: {user.role.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-900/30 pb-2 text-xs">
        <button
          onClick={() => setTab('catalog')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            tab === 'catalog' ? 'bg-purple-600/40 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Catalog Tracks ({allTracks.length})
        </button>
        <button
          onClick={() => setTab('reports')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
            tab === 'reports' ? 'bg-purple-600/40 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Reports Queue ({reports.filter((r) => r.status === 'pending').length} pending)</span>
        </button>
      </div>

      {/* Catalog Table */}
      {tab === 'catalog' && (
        <div className="bg-[#130E26]/80 border border-purple-500/20 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1A1333] text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-purple-900/30">
              <tr>
                <th className="p-3.5">Track &amp; Artist</th>
                <th className="p-3.5">Genre / Lang</th>
                <th className="p-3.5">Licensing</th>
                <th className="p-3.5">Visibility</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/40">
              {allTracks.map((track) => (
                <tr key={track.id} className="hover:bg-purple-950/20">
                  <td className="p-3.5 flex items-center gap-3">
                    <img src={track.artworkPath} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div className="min-w-0 max-w-xs">
                      <p className="font-semibold text-white truncate">{track.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{track.artistName}</p>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">
                    {track.genre} · {track.language}
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-400 max-w-xs truncate">
                    {track.licenseType}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        track.visibility === 'public'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      {track.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span className="capitalize">{track.visibility}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${track.title}" from catalog?`)) {
                          deleteTrack(track.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Delete Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Queue */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-[#130E26]/80 border border-purple-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300">
                    {report.status}
                  </span>
                  <span className="text-xs font-semibold text-white">Track: {report.trackTitle}</span>
                </div>
                <p className="text-xs text-rose-300 font-medium">Reason: {report.reason}</p>
                {report.description && (
                  <p className="text-xs text-slate-400 max-w-xl">{report.description}</p>
                )}
                <p className="text-[10px] text-slate-400 font-mono">
                  Reported on {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {report.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateReportStatus(report.id, 'reviewed')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/40 text-cyan-300 text-xs font-semibold hover:bg-purple-600/60 transition-colors"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'resolved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/60 transition-colors"
                    >
                      Resolve &amp; Close
                    </button>
                  </>
                )}
                {report.status !== 'pending' && (
                  <span className="text-xs text-slate-400 italic">No action needed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
