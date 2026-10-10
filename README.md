# VYBE — Feel Every Beat

Production-Oriented Mobile-First Music Streaming Platform.

VYBE is a full-featured music streaming web application built with React, TypeScript, Vite, Tailwind CSS, Web Audio API, and Supabase (PostgreSQL, Auth, Storage, and Row Level Security).

---

## 1. Features Overview

- **Centralized Audio Player**: Persistent `HTMLAudioElement` controller with queue management (shuffle, repeat off/all/one, reorder, play next), seekable timeline, volume/mute, playback speed control (0.75x to 2x), Media Session API integration, and keyboard shortcuts (`Space`, `ArrowLeft`/`ArrowRight`, `ArrowUp`/`ArrowDown`, `M`, `V`).
- **Live Web Audio Visualizer**: Real-time FFT frequency visualizer powered by `AudioContext` and `AnalyserNode` with Circular (Orb) and Equalizer (EQ) modes. Includes smooth harmonic fallback when AudioContext is suspended or pending user gesture.
- **MoodMix Engine**: Transparent rule-based algorithmic filter computing dynamic queues based on selected Mood, Genre, and Language.
- **VYBE Flow**: Continuous listening engine that sequences compatible tracks without repeating songs.
- **Lyrics Studio**: Synchronized karaoke-style lyric reader with tap-to-seek functionality.
- **Hybrid Content Model**:
  - Pre-seeded legal Creative Commons / Public Domain tracks with verified attribution.
  - User-owned audio uploads (supports MP3, WAV, M4A, OGG, FLAC up to 50MB) with audio pre-listen test and copyright rights confirmation.
- **Listening Insights**: Real measured playback statistics (total listening time, track play counts, top genres breakdown) calculated without fabricated data.
- **Personal Library & Playlists**: Create, reorder, share, and delete playlists; toggle favorites; browse upload archives; review playback history.
- **Admin & Moderation Console**: Protected role-based dashboard for reviewing user uploads, managing track visibility, and adjudicating copyright reports.
- **Responsive Architecture**: Mobile-first touch ergonomics (touch targets $\ge 44\text{px}$, sticky height $\le 15\%$, safe areas) scaling up to full 1440px desktop layouts with sidebar navigation and top-bar contract compliance.

---

## 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

> **Note on Sandbox Mode**: VYBE includes an automated fallback persistence layer. If external Supabase credentials have not yet been provided, the application runs in local persistence mode, allowing full evaluation of registration, playlists, uploads, and playback without crashing. You can also connect and test live Supabase credentials on the fly via the **Supabase Setup** button in the top navigation.

---

## 3. Supabase Database & Security Migration

The database schema and Row Level Security policies are located in `supabase/migrations/20261010_initial_vybe_schema.sql` and `supabase/policies.sql`.

### To apply to your Supabase project:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor**.
3. Paste and run `supabase/migrations/20261010_initial_vybe_schema.sql`.
4. Paste and run `supabase/policies.sql`.

### Storage Buckets Setup:
Create two storage buckets under **Storage**:
1. `music-audio`: Private bucket for user uploads and protected audio stems.
2. `music-artwork`: Public bucket for album covers and avatars.

### Admin Provisioning Guide:
To grant admin privileges to a user, run the following SQL command in the Supabase SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<USER_UUID>', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

*(For testing and inspection purposes in this sandbox, a role toggle is also available in Profile Settings).*

---

## 4. Running the Application & Tests

```bash
# Start development server on port 3000
npm run dev

# Run automated Vitest unit tests
npm run test

# Type-check with TypeScript
npm run lint

# Compile production bundle
npm run build
```

---

## 5. Implementation Status Checklist

- [x] Complete React & TypeScript source code
- [x] Mobile-first touch-friendly design (320px, 360px, 390px, 430px, tablet, desktop)
- [x] Centralized persistent audio playback controller
- [x] Web Audio API real-time visualizer (Circular & EQ spectrum)
- [x] MoodMix rule-based recommendation engine
- [x] Synchronized timestamped karaoke lyrics
- [x] Audio file upload with format validation, size limit, preview, and rights declaration
- [x] Supabase Auth, PostgreSQL schema, RLS policies, and storage structure
- [x] Offline / local persistence fallback sandbox
- [x] Measured Listening Insights
- [x] Administrative moderation console
- [x] Privacy Policy, Terms of Service, DMCA Takedown documentation
- [x] Automated unit test suite with Vitest
