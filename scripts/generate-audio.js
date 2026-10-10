import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'audio');
fs.mkdirSync(outDir, { recursive: true });

function writeWav(filename, durationSec, synthFn) {
  const sampleRate = 22050;
  const numChannels = 1;
  const bytesPerSample = 2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = synthFn(t);
    // Clamp to -1..1
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// 1. Neon Horizon (Electronic Synthwave: arpeggios, sub bass, chords)
writeWav('track-1.wav', 12, (t) => {
  const bassNotes = [110, 110, 130.81, 146.83];
  const bassFreq = bassNotes[Math.floor(t * 2) % bassNotes.length];
  const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.35;

  const arpNotes = [220, 261.63, 329.63, 392, 440, 523.25, 392, 329.63];
  const arpFreq = arpNotes[Math.floor(t * 6) % arpNotes.length];
  const arp = Math.sin(2 * Math.PI * arpFreq * t) * 0.25;

  const beat = (Math.sin(2 * Math.PI * 4 * t) > 0.8 ? 1 : 0) * Math.sin(2 * Math.PI * 60 * t) * 0.2;
  return (bass + arp + beat) * 0.8;
});

// 2. Midnight Reverie (Moody Synth Chords & Soft Lead)
writeWav('track-2.wav', 12, (t) => {
  const pad = (Math.sin(2 * Math.PI * 174.61 * t) + Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 261.63 * t)) * 0.15;
  const leadNotes = [349.23, 392, 440, 523.25, 440, 392];
  const leadFreq = leadNotes[Math.floor(t * 1.5) % leadNotes.length];
  const lead = Math.sin(2 * Math.PI * leadFreq * t) * 0.3;
  return (pad + lead) * 0.8;
});

// 3. Pind Di Beat (Punjabi Dhol & Desi Bass Groove)
writeWav('track-3.wav', 12, (t) => {
  const dhol = Math.sin(2 * Math.PI * (80 - (t % 0.3) * 120) * t) * 0.45 * Math.exp(-(t % 0.3) * 6);
  const melodic = Math.sin(2 * Math.PI * 293.66 * t) * 0.2 + Math.sin(2 * Math.PI * 370 * t) * 0.15;
  const clap = ((Math.random() * 2 - 1) * Math.exp(-(t % 0.6) * 12)) * 0.15;
  return (dhol + melodic + clap) * 0.8;
});

// 4. Purvanchal Sunset (Folk Flute & Acoustic Drone)
writeWav('track-4.wav', 12, (t) => {
  const drone = (Math.sin(2 * Math.PI * 146.83 * t) + Math.sin(2 * Math.PI * 220 * t)) * 0.2;
  const bansuriNotes = [293.66, 329.63, 369.99, 440, 493.88, 440, 369.99];
  const fluteFreq = bansuriNotes[Math.floor(t * 1.2) % bansuriNotes.length];
  const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 5 * t);
  const flute = Math.sin(2 * Math.PI * (fluteFreq * vibrato) * t) * 0.35;
  return (drone + flute) * 0.8;
});

// 5. Aurora Drift (Fingerstyle Acoustic Plucks & Ocean Pad)
writeWav('track-5.wav', 12, (t) => {
  const ocean = ((Math.random() * 2 - 1) * 0.05 * (Math.sin(t * 0.5) * 0.5 + 0.5));
  const guitarNotes = [164.81, 196, 246.94, 329.63, 246.94, 196];
  const guitarFreq = guitarNotes[Math.floor(t * 2.5) % guitarNotes.length];
  const decay = Math.exp(-(t % 0.4) * 5);
  const guitar = Math.sin(2 * Math.PI * guitarFreq * t) * 0.35 * decay;
  return (ocean + guitar) * 0.85;
});

// 6. Cyber Banaras (Sitar Resonance & Cyber Bass)
writeWav('track-6.wav', 12, (t) => {
  const sitarNotes = [261.63, 293.66, 329.63, 392, 440, 523.25, 493.88, 392];
  const sitarFreq = sitarNotes[Math.floor(t * 3) % sitarNotes.length];
  const sitar = (Math.sin(2 * Math.PI * sitarFreq * t) + 0.4 * Math.sin(2 * Math.PI * sitarFreq * 2 * t) + 0.2 * Math.sin(2 * Math.PI * sitarFreq * 3 * t)) * 0.25;
  const sub = Math.sin(2 * Math.PI * 65.41 * t) * 0.3;
  return (sitar + sub) * 0.8;
});

// 7. Soulful Lofi Monsoon (Warm Electric Piano & Rain Hiss)
writeWav('track-7.wav', 12, (t) => {
  const rain = (Math.random() * 2 - 1) * 0.03;
  const chords = [220, 261.63, 329.63, 392];
  const epiano = (Math.sin(2 * Math.PI * chords[0] * t) + Math.sin(2 * Math.PI * chords[1] * t) + Math.sin(2 * Math.PI * chords[2] * t)) * 0.18;
  const beat = (Math.sin(2 * Math.PI * 2 * t) > 0.8 ? 1 : 0) * Math.sin(2 * Math.PI * 55 * t) * 0.25;
  return (rain + epiano + beat) * 0.8;
});

// 8. Desi Trap Odyssey (808 Sub Kick & Trap Hi-Hats)
writeWav('track-8.wav', 12, (t) => {
  const kick = Math.sin(2 * Math.PI * (110 - (t % 0.5) * 160) * t) * 0.45 * Math.exp(-(t % 0.5) * 6);
  const hihat = ((Math.random() * 2 - 1) * Math.exp(-(t % 0.125) * 25)) * 0.15;
  const lead = Math.sin(2 * Math.PI * 440 * t) * 0.15;
  return (kick + hihat + lead) * 0.8;
});

console.log('Successfully generated all 8 audio fixtures in public/audio/');
