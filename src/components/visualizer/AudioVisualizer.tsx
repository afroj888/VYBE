import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { Disc3, BarChart3, Volume2 } from 'lucide-react';

interface AudioVisualizerProps {
  className?: string;
  defaultMode?: 'circular' | 'equalizer';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  className = '',
  defaultMode = 'circular',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { getFrequencyData, isPlaying, audioContextState } = useAudio();
  const [mode, setMode] = useState<'circular' | 'equalizer'>(defaultMode);
  const [isLiveStream, setIsLiveStream] = useState<boolean>(false);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const freqData = getFrequencyData();
      const hasRealAudio =
        freqData &&
        isPlaying &&
        freqData.some((v) => v > 0);

      setIsLiveStream(Boolean(hasRealAudio));

      if (mode === 'circular') {
        // CIRCULAR VISUALIZER
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.45;
        const barsCount = 64;
        const angleStep = (Math.PI * 2) / barsCount;

        // Draw ambient glow center
        const grad = ctx.createRadialGradient(
          centerX,
          centerY,
          10,
          centerX,
          centerY,
          baseRadius * 1.5
        );
        grad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
        grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.15)');
        grad.addColorStop(1, 'rgba(11, 8, 19, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < barsCount; i++) {
          const angle = i * angleStep;
          let magnitude = 0;

          if (hasRealAudio && freqData) {
            const dataIndex = Math.floor((i / barsCount) * freqData.length);
            magnitude = (freqData[dataIndex] / 255) * (baseRadius * 0.85);
          } else if (isPlaying) {
            // Smooth harmonic fallback wave
            magnitude =
              Math.sin(phase + i * 0.2) * 12 +
              Math.cos(phase * 0.7 + i * 0.3) * 8 +
              14;
          } else {
            magnitude = 2;
          }

          const r1 = baseRadius;
          const r2 = baseRadius + Math.max(3, magnitude);

          const x1 = centerX + Math.cos(angle) * r1;
          const y1 = centerY + Math.sin(angle) * r1;
          const x2 = centerX + Math.cos(angle) * r2;
          const y2 = centerY + Math.sin(angle) * r2;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';

          // Electric Violet to Cyan gradient
          const barGrad = ctx.createLinearGradient(x1, y1, x2, y2);
          barGrad.addColorStop(0, '#8B5CF6'); // Electric Violet
          barGrad.addColorStop(1, '#22D3EE'); // Cyan
          ctx.strokeStyle = barGrad;
          ctx.stroke();
        }

        // Inner core border
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius - 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // EQUALIZER SPECTRUM VIEW
        const barWidth = 6;
        const gap = 4;
        const totalBars = Math.floor(width / (barWidth + gap));
        const startX = (width - totalBars * (barWidth + gap)) / 2;

        for (let i = 0; i < totalBars; i++) {
          let heightVal = 0;

          if (hasRealAudio && freqData) {
            const dataIndex = Math.floor((i / totalBars) * freqData.length);
            heightVal = (freqData[dataIndex] / 255) * (height * 0.85);
          } else if (isPlaying) {
            heightVal =
              (Math.sin(phase + i * 0.25) * 0.3 + 0.5) * (height * 0.6) +
              Math.cos(phase * 0.5 + i * 0.1) * 10;
          } else {
            heightVal = 4;
          }

          const clampedHeight = Math.max(4, Math.min(height - 10, heightVal));
          const x = startX + i * (barWidth + gap);
          const y = height - clampedHeight - 5;

          const barGrad = ctx.createLinearGradient(x, height, x, y);
          barGrad.addColorStop(0, '#7C3AED');
          barGrad.addColorStop(0.5, '#A855F7');
          barGrad.addColorStop(1, '#22D3EE');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, clampedHeight, [3, 3, 0, 0]);
          ctx.fill();
        }
      }

      phase += 0.04;
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [getFrequencyData, isPlaying, mode]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Visualizer Mode Switch & Status */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-[#120D24]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-purple-500/20 text-xs">
        <button
          onClick={() => setMode('circular')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
            mode === 'circular' ? 'bg-purple-600/40 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
          }`}
          title="Circular Visualizer"
          aria-label="Circular Visualizer"
        >
          <Disc3 className="w-3.5 h-3.5" />
          <span>Orb</span>
        </button>
        <button
          onClick={() => setMode('equalizer')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
            mode === 'equalizer' ? 'bg-purple-600/40 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
          }`}
          title="Equalizer Spectrum"
          aria-label="Equalizer Spectrum"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>EQ</span>
        </button>
      </div>

      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Volume2 className="w-3 h-3 text-cyan-400" />
        <span>{isLiveStream ? 'Live Web Audio FFT' : audioContextState === 'suspended' ? 'Harmonic Flow' : 'Reactive Wave'}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={360}
        height={260}
        className="w-full max-w-[360px] h-[220px] rounded-2xl"
      />
    </div>
  );
};
