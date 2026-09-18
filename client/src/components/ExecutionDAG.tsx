import React from 'react';
import { 
  Layers, 
  Compass, 
  Wrench, 
  ShieldCheck, 
  Cpu, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { StepRecord } from '../types';

interface ExecutionDAGProps {
  steps: StepRecord[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const ExecutionDAG: React.FC<ExecutionDAGProps> = ({
  steps,
  activeStepIndex,
  onSelectStep,
}) => {
  // Compute total duration for relative waterfall progress bars
  const totalLatency = steps.reduce((sum, s) => sum + (s.latency_ms || 100), 0) || 1;

  // Compute start offsets
  let runningOffset = 0;
  const stepsWithOffsets = steps.map((s) => {
    const start = runningOffset;
    const duration = s.latency_ms || 100;
    runningOffset += duration;
    return { ...s, startOffset: start, duration };
  });

  const getStepIcon = (type: string, status: string) => {
    if (status === 'HEALED') return <ShieldCheck className="w-3.5 h-3.5 text-[#62c073]" />;
    if (status === 'FAILED') return <AlertTriangle className="w-3.5 h-3.5 text-[#f43f5e]" />;
    
    switch (type) {
      case 'PLAN':
        return <Compass className="w-3.5 h-3.5 text-[#52a8ff]" />;
      case 'TOOL_EXECUTION':
        return <Wrench className="w-3.5 h-3.5 text-[#f59e0b]" />;
      case 'CONTEXT_MAINTENANCE':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'FAILURE_RECOVERY':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#62c073]" />;
      case 'REASONING_SYNTHESIS':
        return <Cpu className="w-3.5 h-3.5 text-[#52a8ff]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-white/50" />;
    }
  };

  return (
    <div className="liquid-glass rounded-2xl p-4 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#52a8ff]" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mono">
            EVENT STREAM & SPANS
          </h2>
        </div>
        <div className="v-chip text-[10px]">
          <span className="v-chip-dot bg-[#52a8ff]" />
          <span>{steps.length} SPANS TRACED</span>
        </div>
      </div>

      {/* Waterfall Table Header */}
      <div className="grid grid-cols-12 gap-2 text-[10px] mono text-[#999999] uppercase tracking-wider pb-2 border-b border-white/5 px-2">
        <div className="col-span-6">Span / Operation</div>
        <div className="col-span-4">Timeline (Waterfall)</div>
        <div className="col-span-2 text-right">Cost</div>
      </div>

      {/* Waterfall Rows */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 mt-2">
        {stepsWithOffsets.map((step, idx) => {
          const isSelected = idx === activeStepIndex;
          const leftPct = Math.min(95, (step.startOffset / totalLatency) * 100);
          const widthPct = Math.max(5, Math.min(100 - leftPct, (step.duration / totalLatency) * 100));

          let borderHighlight = 'border-white/5';
          let bgClass = 'bg-[#0a0a0a]/70 hover:bg-[#141414]';

          if (isSelected) {
            borderHighlight = 'border-[#52a8ff] ring-1 ring-[#52a8ff]/40 shadow-lg';
            bgClass = 'bg-[#141824]';
          } else if (step.status === 'HEALED') {
            borderHighlight = 'border-[#62c073]/40';
          }

          return (
            <div
              key={step.step_id}
              onClick={() => onSelectStep(idx)}
              className={`p-2.5 rounded-xl border ${borderHighlight} ${bgClass} cursor-pointer transition-all text-xs`}
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                
                {/* Span Title & Icon */}
                <div className="col-span-6 flex items-center gap-2 overflow-hidden">
                  <div className="w-5 h-5 rounded-md bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                    {getStepIcon(step.step_type, step.status)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="mono text-[10px] text-[#999999]">#{step.step_number}</span>
                      <span className="text-white font-medium truncate text-xs">
                        {step.title.replace(/^Step \d+:\s*/, '')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Progress Bar (Dark Tech Spec) */}
                <div className="col-span-4 flex flex-col justify-center">
                  <div className="w-full h-2 bg-white/10 rounded-sm relative overflow-hidden">
                    <div
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                      }}
                      className={`absolute top-0 bottom-0 rounded-sm ${
                        isSelected
                          ? 'bg-[#52a8ff] shadow-sm shadow-[#52a8ff]'
                          : step.status === 'HEALED'
                          ? 'bg-[#62c073]'
                          : 'bg-white/35'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] mono text-[#999999] mt-1">
                    <span>{Math.round(step.startOffset)}ms</span>
                    <span>{Math.round(step.duration)}ms</span>
                  </div>
                </div>

                {/* Cost */}
                <div className="col-span-2 text-right mono text-[11px] text-[#62c073]">
                  ${step.step_cost_usd.toFixed(5)}
                </div>

              </div>

              {/* Autopsy indicator if present */}
              {step.autopsy && (
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] mono text-[#fb7185]">
                  <span>INTERCEPTED: {step.autopsy.failure_type}</span>
                  <span className="text-[#62c073]">AUTONOMOUSLY HEALED</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
