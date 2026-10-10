import React, { useState } from 'react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  resetSupabaseClient,
} from '../../lib/supabase';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.key);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    saveSupabaseCredentials(url, anonKey);
    const client = resetSupabaseClient();

    if (!client) {
      setTestResult('Credentials invalid or missing. Ensure URL begins with https:// and Anon Key is complete.');
      setTesting(false);
      return;
    }

    try {
      const { data, error } = await client.from('tracks').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        setTestResult(`Connected to Supabase project, but query returned: ${error.message}. Please apply the SQL migration schema in the Supabase SQL editor.`);
      } else {
        setTestResult('Successfully connected to Supabase PostgreSQL database!');
      }
    } catch (err: unknown) {
      setTestResult(`Network or connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const handleCopyMigrationNotice = () => {
    navigator.clipboard.writeText('supabase/migrations/20261010_initial_vybe_schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#130E26] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Supabase Connection</h3>
              <p className="text-xs text-slate-400">Database, Auth & Storage Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="my-4 p-3 rounded-2xl bg-[#1A1333] border border-purple-500/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {currentCreds.isConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-slate-300 font-medium">
              {currentCreds.isConfigured ? 'Supabase Credentials Detected' : 'Local Fallback Sandbox Active'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {currentCreds.isConfigured ? 'Connected' : 'Offline Mode'}
          </span>
        </div>

        <form onSubmit={handleSaveAndTest} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              VITE_SUPABASE_URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              VITE_SUPABASE_ANON_KEY
            </label>
            <input
              type="text"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                testResult.includes('Successfully')
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              {testResult}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setUrl('');
                setAnonKey('');
                saveSupabaseCredentials('', '');
                resetSupabaseClient();
                setTestResult('Reset to built-in local persistence sandbox.');
              }}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Reset to Sandbox
            </button>

            <button
              type="submit"
              disabled={testing}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-lg"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>Test & Save Connection</span>
            </button>
          </div>
        </form>

        {/* Database setup instructions */}
        <div className="mt-6 pt-5 border-t border-purple-900/30 space-y-3">
          <h4 className="text-xs font-bold text-slate-200">Database & Storage Setup Checklist</h4>
          <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
            <li>
              <span>Create project in Supabase dashboard.</span>
            </li>
            <li>
              <span>Execute SQL migration file: </span>
              <button
                onClick={handleCopyMigrationNotice}
                className="inline-flex items-center gap-1 text-cyan-400 font-mono text-[11px] underline underline-offset-2 ml-1"
              >
                <span>supabase/migrations/20261010_initial_vybe_schema.sql</span>
                <Copy className="w-3 h-3" />
              </button>
              {copied && <span className="text-emerald-400 ml-1">Copied!</span>}
            </li>
            <li>
              <span>Create storage buckets: </span>
              <span className="font-mono text-purple-300">music-audio</span> (private) &amp;{' '}
              <span className="font-mono text-purple-300">music-artwork</span> (public).
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
