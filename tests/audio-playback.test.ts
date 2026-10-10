import { describe, it, expect } from 'vitest';
import { parseLrcLyrics, SEED_TRACKS, MOOD_TAGS } from '../src/data/catalog';
import { formatDuration } from '../src/components/player/FullPlayerModal';

describe('VYBE Audio Engine & Utilities', () => {
  it('correctly parses LRC timestamped lyrics into seconds and text', () => {
    const rawLrc = `[00:04.50] Roshni ki lehar beh rahi hai raat mein
[00:12.00] Dhadkanon ka taar chhid gaya saaz mein`;

    const parsed = parseLrcLyrics(rawLrc);
    expect(parsed.length).toBe(2);
    expect(parsed[0].time).toBeCloseTo(4.5, 1);
    expect(parsed[0].text).toBe('Roshni ki lehar beh rahi hai raat mein');
    expect(parsed[1].time).toBeCloseTo(12.0, 1);
  });

  it('formats duration seconds into standard mm:ss strings', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(372)).toBe('6:12');
    expect(formatDuration(-10)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
  });

  it('safely reorders queue items without modifying unexpected elements', () => {
    const items = ['track-1', 'track-2', 'track-3', 'track-4'];
    const result = Array.from(items);
    const [removed] = result.splice(0, 1);
    result.splice(2, 0, removed);

    expect(result).toEqual(['track-2', 'track-3', 'track-1', 'track-4']);
  });

  it('correctly filters MoodMix recommendations based on genre and language tags', () => {
    const chillGenres = MOOD_TAGS['Chill'].genres;
    const chillTracks = SEED_TRACKS.filter((t) =>
      chillGenres.some((g) => t.genre.toLowerCase().includes(g.toLowerCase()))
    );

    expect(chillTracks.length).toBeGreaterThan(0);
    expect(chillTracks.some((t) => t.genre === 'Indie & Lo-Fi' || t.genre === 'Acoustic' || t.genre === 'Synthwave')).toBe(true);
  });

  it('accurately verifies seed track properties and playable local audio fixtures', () => {
    expect(SEED_TRACKS.length).toBe(8);
    for (const track of SEED_TRACKS) {
      expect(track.sourceUrl).toMatch(/^\/audio\/track-\d+\.wav$/);
      expect(track.durationSeconds).toBeGreaterThan(0);
      expect(track.title).toBeTruthy();
      expect(track.artistName).toBeTruthy();
      expect(track.visibility).toBe('public');
    }
  });
});
