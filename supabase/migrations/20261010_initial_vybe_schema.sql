-- ============================================================================
-- VYBE Music Streaming Platform — Database Schema Migration
-- Compatible with Supabase PostgreSQL (auth.users integration)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_path TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. USER ROLES TABLE (strictly managed, no self-promotion)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('listener', 'artist', 'admin', 'moderator')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. ARTISTS TABLE
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    biography TEXT,
    artwork_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    artwork_path TEXT,
    release_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. TRACKS TABLE (hybrid: user-owned & licensed catalog)
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    artist_name TEXT, -- cache/fallback for uploads without artist records
    album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
    duration_seconds INTEGER,
    genre TEXT NOT NULL DEFAULT 'Electronic',
    language TEXT NOT NULL DEFAULT 'English',
    artwork_path TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('storage', 'stream', 'sample', 'external')),
    source_url TEXT,
    storage_path TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('private', 'unlisted', 'public')),
    license_type TEXT NOT NULL DEFAULT 'Creative Commons / Authorized' CHECK (license_type IN ('Owner Original', 'Creative Commons / Authorized', 'Public Domain', 'Licensed Streaming')),
    license_reference TEXT,
    license_verified_at TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    lyrics TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PLAYLISTS TABLE
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    artwork_path TEXT,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('private', 'unlisted', 'public')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. PLAYLIST TRACKS TABLE (Ordered mapping)
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (playlist_id, track_id),
    CONSTRAINT unique_playlist_position UNIQUE (playlist_id, position)
);

-- 8. FAVORITES TABLE (Composite key)
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, track_id)
);

-- 9. LISTENING HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.listening_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
    listened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    listened_seconds INTEGER NOT NULL DEFAULT 0
);

-- 10. CONTENT REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON public.tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_language ON public.tracks(language);
CREATE INDEX IF NOT EXISTS idx_tracks_owner_id ON public.tracks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tracks_visibility ON public.tracks(visibility);
CREATE INDEX IF NOT EXISTS idx_listening_history_user ON public.listening_history(user_id, listened_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_owner ON public.playlists(owner_id);

-- Profile auto-creation trigger on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_path, bio)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
        NULL,
        'Music enthusiast on VYBE'
    );
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'listener')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
