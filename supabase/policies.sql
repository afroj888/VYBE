-- ============================================================================
-- VYBE Music Streaming Platform — Row Level Security (RLS) & Storage Policies
-- ============================================================================

-- Enable RLS on all user/content tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Security helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. USER ROLES POLICIES (Users cannot elevate their own roles)
CREATE POLICY "Users can read their own role" 
    ON public.user_roles FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins can modify roles" 
    ON public.user_roles FOR ALL 
    USING (public.is_admin());

-- 3. ARTISTS & ALBUMS POLICIES (Publicly readable; manageable by admin)
CREATE POLICY "Artists are viewable by everyone" 
    ON public.artists FOR SELECT USING (true);

CREATE POLICY "Albums are viewable by everyone" 
    ON public.albums FOR SELECT USING (true);

CREATE POLICY "Admins can manage artists" 
    ON public.artists FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage albums" 
    ON public.albums FOR ALL USING (public.is_admin());

-- 4. TRACKS POLICIES
-- Public published tracks are readable by anyone.
-- Private tracks are only visible to the owner.
-- Unlisted tracks are readable if accessed by direct ID (not restricted, but hidden from discovery).
CREATE POLICY "Published public and unlisted tracks are readable" 
    ON public.tracks FOR SELECT 
    USING (
        (is_published = true AND visibility IN ('public', 'unlisted'))
        OR (auth.uid() = owner_id)
        OR public.is_admin()
    );

CREATE POLICY "Authenticated users can upload tracks" 
    ON public.tracks FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own tracks" 
    ON public.tracks FOR UPDATE 
    USING (auth.uid() = owner_id OR public.is_admin())
    WITH CHECK (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Owners and admins can delete tracks" 
    ON public.tracks FOR DELETE 
    USING (auth.uid() = owner_id OR public.is_admin());

-- 5. PLAYLISTS POLICIES
CREATE POLICY "Public and unlisted playlists are readable by all" 
    ON public.playlists FOR SELECT 
    USING (visibility IN ('public', 'unlisted') OR auth.uid() = owner_id);

CREATE POLICY "Users can create playlists" 
    ON public.playlists FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own playlists" 
    ON public.playlists FOR UPDATE 
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own playlists" 
    ON public.playlists FOR DELETE 
    USING (auth.uid() = owner_id);

-- 6. PLAYLIST TRACKS POLICIES
CREATE POLICY "Playlist tracks readable if playlist is accessible" 
    ON public.playlist_tracks FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.playlists p
            WHERE p.id = playlist_id AND (p.visibility IN ('public', 'unlisted') OR p.owner_id = auth.uid())
        )
    );

CREATE POLICY "Playlist owners can modify playlist tracks" 
    ON public.playlist_tracks FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.playlists p
            WHERE p.id = playlist_id AND p.owner_id = auth.uid()
        )
    );

-- 7. FAVORITES POLICIES
CREATE POLICY "Users can read own favorites" 
    ON public.favorites FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites" 
    ON public.favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" 
    ON public.favorites FOR DELETE 
    USING (auth.uid() = user_id);

-- 8. LISTENING HISTORY POLICIES
CREATE POLICY "Users can read own history" 
    ON public.listening_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" 
    ON public.listening_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 9. REPORTS POLICIES
CREATE POLICY "Users can create reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and manage reports" 
    ON public.reports FOR ALL 
    USING (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS SETUP & SECURITY POLICIES
-- ============================================================================

-- Create buckets via Supabase storage API or SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('music-audio', 'music-audio', false) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('music-artwork', 'music-artwork', true) ON CONFLICT DO NOTHING;

-- Storage RLS:
-- 1. Public artwork bucket is readable by anyone
-- 2. Audio bucket: Public tracks are readable; private files only by owner.
