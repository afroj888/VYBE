import React, { useState, useRef } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { Track, TrackVisibility, LicenseType } from '../types/music';
import {
  Upload,
  FileAudio,
  Image,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Loader2,
  ShieldCheck,
  Disc,
} from 'lucide-react';

interface UploadPageProps {
  onUploadSuccess: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  const { uploadTrack } = useLibrary();
  const { user } = useAuth();

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(180);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState(user?.displayName || 'Independent Artist');
  const [albumTitle, setAlbumTitle] = useState('');
  const [genre, setGenre] = useState('Electronic');
  const [language, setLanguage] = useState<'Hindi' | 'Punjabi' | 'Bhojpuri' | 'English' | 'International'>('English');
  const [visibility, setVisibility] = useState<TrackVisibility>('private');
  const [licenseType, setLicenseType] = useState<LicenseType>('Owner Original');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const genres = ['Electronic', 'Synthwave', 'Indie & Lo-Fi', 'Desi Hip-Hop', 'Acoustic', 'Bhojpuri Pop', 'Classical & Folk'];

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate type
    const validMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4', 'audio/flac'];
    const validExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!validMimes.includes(file.type) && !hasValidExt) {
      setError('Please select a valid audio file (MP3, WAV, OGG, M4A, or FLAC).');
      return;
    }

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB maximum limit.');
      return;
    }

    setAudioFile(file);
    if (!title) {
      // Auto-extract title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Create preview URL and measure duration
    const objectUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(objectUrl);

    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setAudioDuration(Math.round(tempAudio.duration));
      }
    };
  };

  const togglePreview = () => {
    if (!audioPreviewUrl) return;
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioPreviewUrl);
      previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
    }

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play().then(() => setIsPreviewPlaying(true)).catch(() => {});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select an audio file to upload.');
      return;
    }
    if (!rightsConfirmed) {
      setError('You must confirm that you have distribution rights for this audio.');
      return;
    }

    setError(null);
    setUploadProgress(15);

    try {
      // Simulated upload progress with real persistent storage ingestion
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p === null) return 30;
          if (p >= 90) {
            clearInterval(interval);
            return 90;
          }
          return p + 25;
        });
      }, 150);

      // In real browser runtime, convert to Data URL or store Object URL for persistent session playback
      const reader = new FileReader();
      reader.onload = async () => {
        clearInterval(interval);
        setUploadProgress(100);

        const playableDataUrl = reader.result as string;

        await uploadTrack({
          title: title.trim(),
          artistName: artistName.trim(),
          albumTitle: albumTitle.trim() || undefined,
          durationSeconds: audioDuration,
          genre,
          language,
          artworkPath: '/src/assets/images/hero_featured_album_1791657226361.jpg',
          sourceType: 'storage',
          sourceUrl: playableDataUrl,
          visibility,
          licenseType,
          licenseReference: `User Upload (${user?.email || 'Anonymous'})`,
          licenseVerifiedAt: new Date().toISOString(),
          isPublished: visibility === 'public',
        });

        setSuccess(`"${title}" uploaded successfully to your library!`);
        setTimeout(() => {
          onUploadSuccess();
        }, 1500);
      };
      reader.readAsDataURL(audioFile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Upload className="w-7 h-7 text-cyan-400" />
          <span>Upload Music</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Publish and stream original user-owned audio or licensed masters
        </p>
      </div>

      <div className="bg-[#130E26]/90 border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File drop zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Audio File (MP3, WAV, M4A, OGG up to 50MB)
            </label>
            <div className="relative border-2 border-dashed border-purple-500/30 hover:border-cyan-400/50 rounded-2xl p-6 text-center bg-[#1A1333]/50 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileAudio className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              {audioFile ? (
                <div>
                  <p className="text-xs font-semibold text-cyan-300">{audioFile.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB · {Math.floor(audioDuration / 60)}:
                    {(audioDuration % 60).toString().padStart(2, '0')} duration
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-slate-200">
                    Click to browse or drag and drop audio file
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">High fidelity lossless or 320kbps MP3 supported</p>
                </div>
              )}
            </div>

            {/* Audio Preview playback button */}
            {audioPreviewUrl && (
              <div className="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-cyan-400" />
                  <span>Preview Audio Before Submitting</span>
                </span>
                <button
                  type="button"
                  onClick={togglePreview}
                  className="px-3 py-1 rounded-lg bg-cyan-500 text-black font-semibold text-xs flex items-center gap-1 hover:bg-cyan-400"
                >
                  {isPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPreviewPlaying ? 'Pause' : 'Play'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Track details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Track Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electric Monsoon"
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Artist Name</label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="e.g. Afroj Beats"
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Hindi">Hindi</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Bhojpuri">Bhojpuri</option>
                <option value="English">English</option>
                <option value="International">International</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as TrackVisibility)}
                className="w-full bg-[#1A1333] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="private">Private (Only You)</option>
                <option value="unlisted">Unlisted (Link Only)</option>
                <option value="public">Public (Discoverable)</option>
              </select>
            </div>
          </div>

          {/* Licensing and Rights Confirmation (Legal Requirement from Section 10) */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Content Authorization &amp; Rights Confirmation</span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                required
                checked={rightsConfirmed}
                onChange={(e) => setRightsConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-purple-500/40 text-cyan-500 focus:ring-0"
              />
              <span>
                I confirm that I own all copyrights or possess express authorized licensing to upload and distribute this audio recording on VYBE. I agree to the Content Rights policy.
              </span>
            </label>
          </div>

          {/* Progress bar */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading track...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-purple-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploadProgress !== null}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploadProgress !== null ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploadProgress !== null ? 'Publishing Track...' : 'Upload & Publish to VYBE'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
