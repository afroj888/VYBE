import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { X, Music2 } from 'lucide-react';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createPlaylist } = useLibrary();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createPlaylist(title, description, visibility);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#130E26] border border-purple-500/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-cyan-400">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Playlist</h3>
              <p className="text-xs text-slate-400">Curate and organize your favorite audio tracks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Playlist Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Synth Sessions"
              className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a mood or thematic description..."
              className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Visibility</label>
            <div className="grid grid-cols-3 gap-2">
              {(['public', 'unlisted', 'private'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                    visibility === v
                      ? 'bg-purple-600/30 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-[#1A1333] border-purple-900/30 text-slate-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
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
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
