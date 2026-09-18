import React from 'react';
import { 
  ArrowUpRight, 
  BookOpen, 
  Sparkles, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Layers,
  Activity
} from 'lucide-react';
import { SessionTrace } from '../types';

interface HeaderProps {
  currentTrace: SessionTrace | null;
  activeView: 'trace' | 'benchmark';
  setActiveView: (view: 'trace' | 'benchmark') => void;
  onRunClean: () => void;
  onRunFailure: () => void;
  onRunBenchmark: () => void;
  onOpenSpec: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrace,
  activeView,
  setActiveView,
  onRunClean,
  onRunFailure,
  onRunBenchmark,
  onOpenSpec,
  isLoading,
}) => {
  const totalTokens = currentTrace?.total_tokens ?? 0;
  const totalCost = currentTrace?.total_cost_usd ?? 0;
  const totalLatency = currentTrace?.total_latency_ms ?? 0;
  const tokensSaved = currentTrace?.tokens_saved ?? 0;

  return (
    <header className="relative z-30 px-6 py-4">
      <div className="liquid-glass rounded-full max-w-[1650px] mx-auto px-5 py-2 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-2xl">
        
        {/* Left: Observe Noise-to-Form Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('trace')}>
            {/* The Observe SVG Logo */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-6 h-6 text-white shrink-0">
              <path d="M4.21 16.5 A9 9 0 0 1 16.5 4.21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16.5 4.21 A9 9 0 0 1 19.79 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2.4 2.3"/>
              <path d="M19.79 16.5 A9 9 0 0 1 4.21 16.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.01 4.7"/>
              <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
            </svg>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base tracking-tight text-white">
                GlassBox
              </span>
              <span className="text-xs text-white/50 font-serif-instrument italic">
                See the shape of the pipeline
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />

          {/* View Mode Pills */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => setActiveView('trace')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeView === 'trace'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Trace & Replay
            </button>
            <button
              onClick={() => setActiveView('benchmark')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'benchmark'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3 text-purple-400" />
              20-Turn Benchmark
            </button>
          </div>
        </div>

        {/* Center: Real-time Telemetry v-chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="v-chip v-chip-active">
            <span className="v-chip-dot" />
            <span>TOKENS: <strong className="text-white">{totalTokens.toLocaleString()}</strong></span>
          </div>

          <div className="v-chip v-chip-pass">
            <span className="v-chip-dot" />
            <span>COST: <strong className="text-[#62c073]">${totalCost.toFixed(5)}</strong></span>
          </div>

          <div className="v-chip">
            <span className="v-chip-dot bg-[#999999]" />
            <span>LATENCY: <strong className="text-white">{Math.round(totalLatency)}ms</strong></span>
          </div>

          {tokensSaved > 0 && (
            <div className="v-chip v-chip-pass bg-[#62c073]/10 border-[#62c073]/30">
              <span className="v-chip-dot" />
              <span className="text-[#62c073]">SAVED: +{tokensSaved.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Right: Dark Tech Square Buttons & Circular Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunClean}
            disabled={isLoading}
            className="btn-square px-3 py-1.5 text-xs text-[#121212] font-semibold gap-1 tracking-tight"
            title="Run standard clean research agent with full trace"
          >
            <span>Run Clean</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRunFailure}
            disabled={isLoading}
            className="btn-square-outline px-3 py-1.5 text-xs text-rose-300 border-rose-500/40 hover:bg-rose-500/10 gap-1 tracking-tight"
            title="Demonstrate payload overflow and hallucinated param caught & self-healed"
          >
            <span>Failure Autopsy</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </button>

          <button
            onClick={onOpenSpec}
            className="liquid-glass-circle w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all ml-1"
            title="View Observability Spec (Rule 5)"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
