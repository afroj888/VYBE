import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Track } from '../../types/music';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  track: Track | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ track, onClose }) => {
  const { submitReport } = useLibrary();
  const [reason, setReason] = useState('Copyright or rights concern');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!track) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(track.id, track.title, reason, description);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#130E26] border border-purple-500/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Report Content</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center text-emerald-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto" />
            <p className="text-sm font-semibold">Report Submitted</p>
            <p className="text-xs text-slate-400">Our moderation team will review this track promptly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-300">
                Reporting: <span className="font-semibold text-white">&ldquo;{track.title}&rdquo;</span> by{' '}
                <span className="text-slate-300">{track.artistName}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Copyright or rights concern">Copyright or rights infringement</option>
                <option value="Audio quality or corrupted file">Audio quality or corrupted file</option>
                <option value="Inaccurate metadata or lyrics">Inaccurate metadata or lyrics</option>
                <option value="Inappropriate content">Inappropriate or prohibited content</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Additional Details
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the specific issue with timestamps or verification links..."
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 text-white text-xs font-semibold rounded-xl shadow-lg hover:opacity-90 transition-all"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
