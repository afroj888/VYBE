import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Track } from '../types/music';
import { SEED_TRACKS } from '../data/catalog';

export type RepeatMode = 'off' | 'all' | 'one';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  queue: Track[];
  queueIndex: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isLoading: boolean;
  error: string | null;
  isVisualizerActive: boolean;
  isFullPlayerOpen: boolean;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (track: Track) => void;
  addToQueueNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  clearQueue: () => void;
  setFullPlayerOpen: (open: boolean) => void;
  toggleVisualizer: () => void;
  getFrequencyData: () => Uint8Array | null;
  audioContextState: AudioContextState | 'unsupported';
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Web Audio graph singleton variables to prevent multiple connections
let webAudioCtx: AudioContext | null = null;
let webAudioSource: MediaElementAudioSourceNode | null = null;
let webAudioAnalyser: AnalyserNode | null = null;
let frequencyDataArray: Uint8Array | null = null;

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Core state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(SEED_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(SEED_TRACKS[0].durationSeconds);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [queue, setQueue] = useState<Track[]>(SEED_TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState<boolean>(false);
  const [isVisualizerActive, setIsVisualizerActive] = useState<boolean>(false);
  const [audioContextState, setAudioContextState] = useState<AudioContextState | 'unsupported'>('suspended');

  // Ref to hold current state values for event listeners without stale closures
  const stateRef = useRef({
    currentTrack,
    queue,
    queueIndex,
    repeatMode,
    isShuffle,
    volume,
    isMuted,
  });

  useEffect(() => {
    stateRef.current = {
      currentTrack,
      queue,
      queueIndex,
      repeatMode,
      isShuffle,
      volume,
      isMuted,
    };
  }, [currentTrack, queue, queueIndex, repeatMode, isShuffle, volume, isMuted]);

  // Initialize Web Audio Analyzer graph safely
  const initWebAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!audioRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        setAudioContextState('unsupported');
        return;
      }

      if (!webAudioCtx) {
        webAudioCtx = new AudioContextClass();
      }

      if (webAudioCtx.state === 'suspended') {
        webAudioCtx.resume().then(() => {
          if (webAudioCtx) setAudioContextState(webAudioCtx.state);
        }).catch(() => {});
      } else {
        setAudioContextState(webAudioCtx.state);
      }

      if (!webAudioAnalyser && webAudioCtx) {
        webAudioAnalyser = webAudioCtx.createAnalyser();
        webAudioAnalyser.fftSize = 128;
        webAudioAnalyser.smoothingTimeConstant = 0.8;
        const bufferLength = webAudioAnalyser.frequencyBinCount;
        frequencyDataArray = new Uint8Array(bufferLength);
      }

      // Connect source node only once to this audio element
      if (!webAudioSource && webAudioCtx && webAudioAnalyser && audioRef.current) {
        try {
          webAudioSource = webAudioCtx.createMediaElementSource(audioRef.current);
          webAudioSource.connect(webAudioAnalyser);
          webAudioAnalyser.connect(webAudioCtx.destination);
        } catch {
          // If already connected or restricted by CORS on certain audio fixtures
        }
      }
    } catch (err) {
      console.warn('Web Audio API initialization note:', err);
    }
  }, []);

  const getFrequencyData = useCallback((): Uint8Array | null => {
    if (webAudioAnalyser && frequencyDataArray) {
      webAudioAnalyser.getByteFrequencyData(frequencyDataArray as unknown as Uint8Array<ArrayBuffer>);
      return frequencyDataArray;
    }
    return null;
  }, []);

  // Initialize HTML Audio Element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
      setError(null);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      const mediaErr = audio.error;
      const message = mediaErr?.message || 'Unable to play this audio stream. Check network or source.';
      setError(message);
    };

    const onEnded = () => {
      const { repeatMode, queue, queueIndex, isShuffle } = stateRef.current;
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
        // Play next track
        if (isShuffle) {
          const nextRandomIndex = Math.floor(Math.random() * queue.length);
          const nextTrack = queue[nextRandomIndex];
          if (nextTrack) {
            setQueueIndex(nextRandomIndex);
            loadAndPlayTrack(nextTrack);
          }
        } else {
          const nextIdx = (queueIndex + 1) % queue.length;
          const nextTrack = queue[nextIdx];
          if (nextTrack) {
            setQueueIndex(nextIdx);
            loadAndPlayTrack(nextTrack);
          }
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    // Initial track source setup without autoplay
    if (SEED_TRACKS[0]?.sourceUrl) {
      audio.src = SEED_TRACKS[0].sourceUrl;
    }

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const loadAndPlayTrack = useCallback((track: Track) => {
    if (!audioRef.current) return;
    initWebAudio();

    setError(null);
    setIsLoading(true);
    setCurrentTrack(track);

    if (track.durationSeconds) {
      setDuration(track.durationSeconds);
    }

    if (
      track.sourceUrl.startsWith('/') ||
      track.sourceUrl.startsWith('data:') ||
      track.sourceUrl.startsWith('blob:')
    ) {
      audioRef.current.crossOrigin = 'anonymous';
    } else {
      audioRef.current.removeAttribute('crossorigin');
    }

    audioRef.current.src = track.sourceUrl;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch((err) => {
        // Autoplay policy or format error
        setIsPlaying(false);
        setIsLoading(false);
        if (err.name !== 'AbortError') {
          setError('Playback paused by browser or network error. Press play to start.');
        }
      });
  }, [initWebAudio]);

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else {
      // Find or append in current queue
      const existingIdx = queue.findIndex((t) => t.id === track.id);
      if (existingIdx >= 0) {
        setQueueIndex(existingIdx);
      } else {
        setQueue((prev) => [...prev, track]);
        setQueueIndex(queue.length);
      }
    }
    loadAndPlayTrack(track);
  }, [queue, loadAndPlayTrack]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    initWebAudio();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === '') {
        audioRef.current.src = currentTrack.sourceUrl;
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((err) => {
          console.error('Play failure:', err);
          setError('Could not start playback. Please click play again.');
        });
    }
  }, [currentTrack, isPlaying, initWebAudio]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0;
    }
    setQueueIndex(nextIdx);
    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      loadAndPlayTrack(nextTrack);
    }
  }, [queue, queueIndex, isShuffle, loadAndPlayTrack]);

  const playPrevious = useCallback(() => {
    if (!audioRef.current || queue.length === 0) return;
    // If more than 3 seconds in, restart track
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setQueueIndex(prevIdx);
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      loadAndPlayTrack(prevTrack);
    }
  }, [queue, queueIndex, loadAndPlayTrack]);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((val: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, val));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRateState(rate);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const addToQueueNext = useCallback((track: Track) => {
    setQueue((prev) => {
      const copy = [...prev];
      copy.splice(queueIndex + 1, 0, track);
      return copy;
    });
  }, [queueIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      if (prev.length <= 1) return prev;
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  }, [queueIndex]);

  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setQueue((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    }
  }, [currentTrack]);

  const toggleVisualizer = useCallback(() => {
    initWebAudio();
    setIsVisualizerActive((prev) => !prev);
  }, [initWebAudio]);

  // Media Session API integration
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artistName,
        album: currentTrack.albumTitle || 'VYBE Music',
        artwork: [
          { src: currentTrack.artworkPath, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        togglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        togglePlay();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrevious();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNext();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession handler error:', e);
    }
  }, [currentTrack, togglePlay, playNext, playPrevious, seek]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (audioRef.current) {
            seek(Math.max(0, audioRef.current.currentTime - 5));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (audioRef.current) {
            seek(Math.min(duration, audioRef.current.currentTime + 5));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 0.1);
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyV':
          toggleVisualizer();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, duration, volume, setVolume, toggleMute, toggleVisualizer]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        queue,
        queueIndex,
        isShuffle,
        repeatMode,
        isLoading,
        error,
        isVisualizerActive,
        isFullPlayerOpen,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleMute,
        setPlaybackRate,
        toggleShuffle,
        cycleRepeatMode,
        addToQueue,
        addToQueueNext,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        setFullPlayerOpen,
        toggleVisualizer,
        getFrequencyData,
        audioContextState,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
