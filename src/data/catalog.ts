import { Track, Artist, Album, MoodCategory } from '../types/music';

// Generated artwork images from phase 1
const HERO_ARTWORK = '/src/assets/images/hero_featured_album_1791657226361.jpg';
const MIDNIGHT_ARTWORK = '/src/assets/images/album_midnight_neon_1791657242375.jpg';
const DESI_ARTWORK = '/src/assets/images/album_desi_beats_1791657260109.jpg';
const ACOUSTIC_ARTWORK = '/src/assets/images/album_acoustic_breeze_1791657276219.jpg';

// Helper to parse LRC timestamped lyrics
export function parseLrcLyrics(lrc: string) {
  const lines = lrc.split('\n');
  const result: { time: number; text: string }[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const line of lines) {
    const match = timeRegex.exec(line.trim());
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = parseInt(match[3].padEnd(3, '0').slice(0, 3), 10);
      const totalSeconds = minutes * 60 + seconds + millis / 1000;
      const text = match[4].trim();
      if (text) {
        result.push({ time: totalSeconds, text });
      }
    } else if (line.trim()) {
      result.push({ time: result.length * 4, text: line.trim() });
    }
  }
  return result;
}

export const SEED_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Neon Horizon',
    artistName: 'Kavita & The Cyber Collective',
    albumTitle: 'VYBE Essentials Vol. 1',
    durationSeconds: 12,
    genre: 'Electronic',
    language: 'Hindi',
    artworkPath: HERO_ARTWORK,
    sourceType: 'stream',
    sourceUrl: '/audio/track-1.wav',
    visibility: 'public',
    licenseType: 'Creative Commons / Authorized',
    licenseReference: 'CC-BY 4.0 Open Audio Project (VYBE Audio Lab)',
    licenseVerifiedAt: '2026-03-01T00:00:00Z',
    isPublished: true,
    playCount: 1420,
    lyrics: `[00:01.00] Roshni ki lehar beh rahi hai raat mein
[00:03.50] Dhadkanon ka taar chhid gaya saaz mein
[00:06.00] Chaand bhi thehra hai asmaan ke paar
[00:08.50] Har taraf hai bas tera hi intezaar
[00:10.50] Feel the vybe, feel the sound`,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'track-2',
    title: 'Midnight Reverie',
    artistName: 'Arjun Verma',
    albumTitle: 'Midnight Reflections',
    durationSeconds: 12,
    genre: 'Synthwave',
    language: 'English',
    artworkPath: MIDNIGHT_ARTWORK,
    sourceType: 'stream',
    sourceUrl: '/audio/track-2.wav',
    visibility: 'public',
    licenseType: 'Creative Commons / Authorized',
    licenseReference: 'CC-BY 4.0 Open Audio Project (VYBE Audio Lab)',
    licenseVerifiedAt: '2026-02-10T00:00:00Z',
    isPublished: true,
    playCount: 980,
    lyrics: `[00:01.00] Electric shadows on the boulevard
[00:03.50] Neon raindrops falling on my car
[00:06.00] Speeding through the purple haze tonight
[00:08.50] Looking for the frequency in the light
[00:10.50] Can you hear the synthesized frequency?`,
    createdAt: '2026-02-01T12:00:00Z',
  },
  {
    id: 'track-3',
    title: 'Pind Di Beat',
    artistName: 'Naveen Khan & Gurpreet',
    albumTitle: 'Dhun: The Echoes',
    durationSeconds: 12,
    genre: 'Desi Hip-Hop',
    language: 'Punjabi',
    artworkPath: DESI_ARTWORK,
    sourceType: 'stream',
    sourceUrl: '/audio/track-3.wav',
    visibility: 'public',
    licenseType: 'Creative Commons / Authorized',
    licenseReference: 'CC-BY 4.0 Open Audio Project (VYBE Audio Lab)',
    licenseVerifiedAt: '2026-02-15T00:00:00Z',
    isPublished: true,
    playCount: 2310,
    lyrics: `[00:01.00] Bass wajdi te dhol khadke
[00:03.50] Pind de munde nachde bhadke
[00:06.00] Akhaan vich rab da noor ae
[00:08.50] Sadda swag hi sab ton door ae
[00:10.50] Aaja nach lai mere naal soniye`,
    createdAt: '2026-02-18T14:30:00Z',
  },
  {
    id: 'track-4',
    title: 'Purvanchal Sunset',
    artistName: 'Ravi Bhojpuriya & Swati',
    albumTitle: 'Mitti Ke Sur',
    durationSeconds: 12,
    genre: 'Bhojpuri Pop',
    language: 'Bhojpuri',
    artworkPath: ACOUSTIC_ARTWORK,
    sourceType: 'stream',
    sourceUrl: '/audio/track-4.wav',
    visibility: 'public',
    licenseType: 'Public Domain',
    licenseReference: 'Folk Archive Public License (VYBE Audio Lab)',
    licenseVerifiedAt: '2026-01-20T00:00:00Z',
    isPublished: true,
    playCount: 875,
    lyrics: `[00:01.00] Gaon ke gali mein dhoop chhanv ba
[00:03.50] Nadiya kinare man mast magan ba
[00:06.00] Bansuriya ke sur ba meeth meeth
[00:08.50] Bhor ke gawaat ba pyara geet
[00:10.50] Chali aawa saheli khetwa mein`,
    createdAt: '2026-02-22T08:00:00Z',
  },
  {
    id: 'track-5',
    title: 'Aurora Drift',
    artistName: 'Siddharth Rao',
    albumTitle: 'Acoustic Melody',
    durationSeconds: 12,
    genre: 'Acoustic',
    language: 'English',
    artworkPath: ACOUSTIC_ARTWORK,
    sourceType: 'stream',
    sourceUrl: '/audio/track-5.wav',
    visibility: 'public',
    licenseType: 'Creative Commons / Authorized',
    licenseReference: 'CC-BY 4.0 Open Audio Project (VYBE Audio Lab)',
    licenseVerifiedAt: '2026-03-05T00:00:00Z',
    isPublished: true,
    playCount: 1650,
    lyrics: `[00:01.00] Under the stars with my six-string guitar
[00:03.50] Watching the galaxies drift from afar
[00:06.00] Whispers of quiet, no city noise here
[00:08.50] Every small breath makes the melody clear
[00:10.50] Breathe in the silence, let the rhythm bloom`,
    createdAt: '2026-03-01T15:00:00Z',
  },
  {
    id: 'track-6',
    title: 'Cyber Banaras',
    artistName: 'Kavita & The Cyber Collective',
    albumTitle: 'VYBE Essentials Vol. 1',
    durationSeconds: 12,
    genre: 'Electronic',
    language: 'Hindi',
    artworkPath: HERO_ARTWORK,
    sourceType: 'stream',
    sourceUrl: '/audio/track-6.wav',
    visibility: 'public',
    licenseType: 'Creative Commons / Authorized',
    licenseReference: 'CC-BY 4.0 Open Audio Project (VYBE Audio Lab)',
    licenseVerifiedAt: '2026-03-02T00:00:00Z',
    isPublished: true,
    playCount: 1890,
    lyrics: `[00:01.00] Ghaton pe aarti, taaron mein noor
[00:03.50] Electronic sitar ka sargam suroor
[00:06.00] Ganga ke paani mein roshan umeed
[00:08.50] Har ek saans bani hai sangeet
[00:10.50] Shanti aur tej ka anokha sangam`,
    createdAt: '2026-03-04T11:00:00Z',
  },
  {
    id: 'track-7',
    title: 'Soulful Lofi Monsoon',
    artistName: 'Aanya Sen',
    albumTitle: 'Raindrop Diaries',
    durationSeconds: 12,
    genre: 'Indie & Lo-Fi',
    language: 'Hindi',
    artworkPath: MIDNIGHT_ARTWORK,
    sourceType: 'stream',
    sourceUrl: '/audio/track-7.wav',
    visibility: 'public',
    licenseType: 'Creative Commons / Authorized',
    licenseReference: 'CC-BY 4.0 Open Audio Project (VYBE Audio Lab)',
    licenseVerifiedAt: '2026-03-08T00:00:00Z',
    isPublished: true,
    playCount: 1120,
    lyrics: `[00:01.00] Khidki pe aayi rimjhim barsaat
[00:03.50] Chai ki pyali aur beete lamhaat
[00:06.00] Purani kitabein aur halki si dhoop
[00:08.50] Mann ko chhoo jaye ye khamosh roop
[00:10.50] Raat ke baadal rimjhim barsenge`,
    createdAt: '2026-03-08T09:00:00Z',
  },
  {
    id: 'track-8',
    title: 'Desi Trap Odyssey',
    artistName: 'Naveen Khan & Gurpreet',
    albumTitle: 'Dhun: The Echoes',
    durationSeconds: 12,
    genre: 'Desi Hip-Hop',
    language: 'Punjabi',
    artworkPath: DESI_ARTWORK,
    sourceType: 'stream',
    sourceUrl: '/audio/track-8.wav',
    visibility: 'public',
    licenseType: 'Creative Commons / Authorized',
    licenseReference: 'CC-BY 4.0 Open Audio Project (VYBE Audio Lab)',
    licenseVerifiedAt: '2026-03-10T00:00:00Z',
    isPublished: true,
    playCount: 2780,
    lyrics: `[00:01.00] Bass pump kardi subwoofers te
[00:03.50] Saara shehar ghume sadkaan te
[00:06.00] Trap di beat utte Punjabi flow
[00:08.50] Lights low te speakers glow
[00:10.50] Saari raat chalegi beat`,
    createdAt: '2026-03-10T14:00:00Z',
  }
];

export const SEED_ARTISTS: Artist[] = [
  {
    id: 'artist-1',
    name: 'Kavita & The Cyber Collective',
    biography: 'Electronic fusion pioneers blending traditional Indian ragas with cyberpunk synthesizers and lush pads.',
    artworkPath: HERO_ARTWORK,
    genres: ['Electronic', 'Fusion', 'Ambient'],
    trackCount: 4,
  },
  {
    id: 'artist-2',
    name: 'Naveen Khan & Gurpreet',
    biography: 'High-energy urban Punjabi and Desi hip-hop duo known for heavy dhol grooves and modern 808 percussion.',
    artworkPath: DESI_ARTWORK,
    genres: ['Desi Hip-Hop', 'Punjabi', 'Trap'],
    trackCount: 6,
  },
  {
    id: 'artist-3',
    name: 'Arjun Verma',
    biography: 'Synthwave producer and cinematic sound designer crafting nostalgic 80s cityscapes.',
    artworkPath: MIDNIGHT_ARTWORK,
    genres: ['Synthwave', 'Electronic', 'Retrowave'],
    trackCount: 5,
  },
  {
    id: 'artist-4',
    name: 'Siddharth Rao',
    biography: 'Acoustic fingerstyle guitarist exploring twilight meditative melodies and folk instrumentation.',
    artworkPath: ACOUSTIC_ARTWORK,
    genres: ['Acoustic', 'Folk', 'Indie'],
    trackCount: 3,
  },
];

export const SEED_ALBUMS: Album[] = [
  {
    id: 'album-1',
    title: 'VYBE Essentials Vol. 1',
    artistName: 'Kavita & The Cyber Collective',
    artworkPath: HERO_ARTWORK,
    releaseDate: '2026-01-15',
    tracks: [SEED_TRACKS[0], SEED_TRACKS[5]],
  },
  {
    id: 'album-2',
    title: 'Midnight Reflections',
    artistName: 'Arjun Verma',
    artworkPath: MIDNIGHT_ARTWORK,
    releaseDate: '2026-02-01',
    tracks: [SEED_TRACKS[1], SEED_TRACKS[6]],
  },
  {
    id: 'album-3',
    title: 'Dhun: The Echoes',
    artistName: 'Naveen Khan & Gurpreet',
    artworkPath: DESI_ARTWORK,
    releaseDate: '2026-02-18',
    tracks: [SEED_TRACKS[2], SEED_TRACKS[7]],
  },
  {
    id: 'album-4',
    title: 'Acoustic Melody',
    artistName: 'Siddharth Rao',
    artworkPath: ACOUSTIC_ARTWORK,
    releaseDate: '2026-03-01',
    tracks: [SEED_TRACKS[4], SEED_TRACKS[3]],
  },
];

// Mood mappings for MoodMix
export const MOOD_TAGS: Record<MoodCategory, { description: string; genres: string[]; color: string }> = {
  Happy: {
    description: 'Upbeat rhythms and vibrant frequencies to elevate your energy',
    genres: ['Desi Hip-Hop', 'Electronic', 'Bhojpuri Pop'],
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
  },
  Chill: {
    description: 'Soft synthesizers and acoustic breezes for relaxation',
    genres: ['Indie & Lo-Fi', 'Acoustic', 'Synthwave'],
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
  },
  Romantic: {
    description: 'Intimate melodies and soulful poetic lyrics',
    genres: ['Acoustic', 'Indie & Lo-Fi', 'Classical & Folk'],
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300',
  },
  Focus: {
    description: 'Steady rhythmic pulses to enhance concentration without distraction',
    genres: ['Electronic', 'Synthwave', 'Indie & Lo-Fi'],
    color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-300',
  },
  Workout: {
    description: 'Driving basslines and maximum tempo to power your sweat session',
    genres: ['Desi Hip-Hop', 'Electronic'],
    color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30 text-purple-300',
  },
  Sad: {
    description: 'Comforting minor chords and introspective acoustic strings',
    genres: ['Acoustic', 'Indie & Lo-Fi'],
    color: 'from-slate-500/20 to-slate-700/10 border-slate-500/30 text-slate-300',
  },
  Sleep: {
    description: 'Dreamy low-frequency drones and soothing nighttime pads',
    genres: ['Indie & Lo-Fi', 'Acoustic', 'Ambient'],
    color: 'from-violet-900/40 to-blue-900/20 border-violet-700/30 text-violet-300',
  },
};
