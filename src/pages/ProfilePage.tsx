import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, LogOut, Trash2, Database, Check, Edit2 } from 'lucide-react';

interface ProfilePageProps {
  onOpenAuth: () => void;
  onOpenSupabaseConfig: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onOpenAuth,
  onOpenSupabaseConfig,
}) => {
  const { user, logout, updateProfile, deleteAccount, toggleRole, isSupabaseConnected } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [msg, setMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4 max-w-sm mx-auto pb-28">
        <div className="w-16 h-16 rounded-full bg-purple-950/60 border border-purple-500/20 mx-auto flex items-center justify-center text-cyan-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Sign In to Your Account</h2>
        <p className="text-xs text-slate-400">
          Log in with your credentials or create a new profile to personalize your music experience.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg"
        >
          Open Authentication
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ displayName, bio });
    setIsEditing(false);
    setMsg('Profile updated successfully!');
    setTimeout(() => setMsg(null), 2000);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      await deleteAccount();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <User className="w-7 h-7 text-cyan-400" />
          <span>Profile &amp; Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account credentials, roles, and connected storage
        </p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center">
          {msg}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-[#130E26]/90 border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-xl shrink-0">
            <div className="w-full h-full bg-[#130E26] rounded-[14px] flex items-center justify-center text-2xl font-black text-cyan-400">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-bold text-white">{user.displayName}</h2>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-900/40 border border-purple-500/30 text-cyan-300">
                {user.role}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">@{user.username} · {user.email}</p>
            <p className="text-xs text-slate-300 pt-1">{user.bio || 'Music enthusiast on VYBE'}</p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-slate-400 hover:text-cyan-300 rounded-xl bg-[#1A1333] border border-purple-900/30 transition-colors"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="pt-4 border-t border-purple-900/30 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Role Switcher (For Evaluation and Testing) */}
        <div className="pt-4 border-t border-purple-900/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Tester Role Switcher</span>
            </span>
            <span className="text-[11px] text-slate-400">Allows instant evaluation of Admin views</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['listener', 'artist', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRole(r)}
                className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                  user.role === r
                    ? 'bg-purple-600/40 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-[#1A1333] border-purple-900/30 text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Supabase Connection */}
        <div className="pt-4 border-t border-purple-900/30 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-slate-300">Backend Provider</p>
            <p className="text-[11px] text-slate-400">
              {isSupabaseConnected ? 'Connected to live Supabase project' : 'Local persistent sandbox active'}
            </p>
          </div>
          <button
            onClick={onOpenSupabaseConfig}
            className="px-3 py-1.5 rounded-xl bg-[#1A1333] hover:bg-[#251A48] border border-purple-500/20 text-cyan-300 text-xs font-medium flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Configure</span>
          </button>
        </div>

        {/* Danger zone & Logout */}
        <div className="pt-4 border-t border-purple-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={logout}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account &amp; Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
