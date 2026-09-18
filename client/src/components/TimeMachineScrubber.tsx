import React, { useState, useEffect } from 'react';
import { 
  History, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw
} from 'lucide-react';
import { StepRecord } from '../types';

interface TimeMachineScrubberProps {
  steps: StepRecord[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const TimeMachineScrubber: React.FC<TimeMachineScrubberProps> = ({
  steps,
  activeStepIndex,
  onSelectStep,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        onSelectStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, onSelectStep]);

  if (steps.length === 0) return null;

  return (
    <div className="liquid-glass rounded-full px-6 py-2.5 max-w-[1650px] mx-auto sticky bottom-4 z-30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/10">
      
      {/* Left: Info Label */}
      <div className="flex items-center gap-2 shrink-0">
        <History className="w-4 h-4 text-[#52a8ff]" />
        <div className="text-xs">
          <span className="font-bold text-white uppercase tracking-wider mono">
            TIME-MACHINE REPLAY
          </span>
          <span className="text-[#999999] ml-2 mono text-[11px]">
            [{activeStepIndex + 1} / {steps.length}]
          </span>
        </div>
      </div>

      {/* Center: Playback Controls & Slider */}
      <div className="flex-1 max-w-2xl w-full flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectStep(Math.max(0, activeStepIndex - 1))}
            disabled={activeStepIndex === 0}
            className="p-1 rounded-md hover:bg-white/10 text-white disabled:opacity-25 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-square px-2.5 py-1 text-[11px] text-black"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onSelectStep(Math.min(steps.length - 1, activeStepIndex + 1))}
            disabled={activeStepIndex === steps.length - 1}
            className="p-1 rounded-md hover:bg-white/10 text-white disabled:opacity-25 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onSelectStep(0);
            }}
            className="p-1 rounded-md hover:bg-white/10 text-[#999999] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Track & Scrubber Slider */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={activeStepIndex}
            onChange={(e) => onSelectStep(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
          />

          <div className="absolute w-full flex justify-between pointer-events-none px-1">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transform -translate-y-0.5 ${
                  idx === activeStepIndex
                    ? 'bg-white ring-2 ring-white/50 shadow-md'
                    : step.status === 'HEALED'
                    ? 'bg-[#62c073]'
                    : step.status === 'FAILED'
                    ? 'bg-[#f43f5e]'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Active Span Name */}
      <div className="text-right shrink-0 hidden md:block">
        <div className="text-xs font-medium text-white line-clamp-1 max-w-[200px]">
          {steps[activeStepIndex]?.title.replace(/^Step \d+:\s*/, '')}
        </div>
        <div className="text-[10px] text-[#62c073] mono">
          STATUS: {steps[activeStepIndex]?.status}
        </div>
      </div>

    </div>
  );
};
