import React from 'react';
import { 
  BrainCircuit, 
  Database, 
  Trash2
} from 'lucide-react';
import { ContextBreakdown } from '../types';

interface ContextFlamegraphProps {
  breakdown: ContextBreakdown;
  livingMemory: Record<string, any>;
  driftScore?: number;
}

export const ContextFlamegraph: React.FC<ContextFlamegraphProps> = ({
  breakdown,
  livingMemory,
  driftScore = 0.0,
}) => {
  const budget = breakdown.budget_limit || 4000;
  const sysPct = Math.min(100, (breakdown.system_tokens / budget) * 100);
  const memPct = Math.min(100, (breakdown.memory_tokens / budget) * 100);
  const toolPct = Math.min(100, (breakdown.tool_buffer_tokens / budget) * 100);
  const winPct = Math.min(100, (breakdown.active_window_tokens / budget) * 100);
  const totalPct = Math.min(100, breakdown.utilization_pct || ((breakdown.total_tokens / budget) * 100));

  return (
    <div className="liquid-glass rounded-2xl p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mono">
            CONTEXT BUDGET SLICER
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="v-chip v-chip-active text-[10px]">
            <span className="v-chip-dot" />
            <span>{totalPct.toFixed(1)}% CAPACITY</span>
          </div>
          <span className="text-xs text-[#999999] mono">
            {breakdown.total_tokens}/{budget} TOKENS
          </span>
        </div>
      </div>

      {/* Stacked Flamegraph Progress Bar */}
      <div className="space-y-2 mb-3">
        <div className="w-full h-6 bg-black/80 rounded-lg overflow-hidden flex border border-white/10 p-0.5">
          <div
            style={{ width: `${sysPct}%` }}
            className="h-full bg-[#52a8ff] transition-all cursor-pointer"
            title={`System Persona: ${breakdown.system_tokens} tokens`}
          />
          <div
            style={{ width: `${memPct}%` }}
            className="h-full bg-purple-500 transition-all cursor-pointer"
            title={`Living Episodic Memory: ${breakdown.memory_tokens} tokens`}
          />
          <div
            style={{ width: `${toolPct}%` }}
            className="h-full bg-[#f59e0b] transition-all cursor-pointer"
            title={`Ephemeral Tool Buffer: ${breakdown.tool_buffer_tokens} tokens`}
          />
          <div
            style={{ width: `${winPct}%` }}
            className="h-full bg-[#62c073] transition-all cursor-pointer"
            title={`Recent Turns Window: ${breakdown.active_window_tokens} tokens`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-2 text-[10px] mono">
          <div className="flex items-center gap-1.5 text-[#999999]">
            <div className="w-2 h-2 rounded-sm bg-[#52a8ff]" />
            <span>SYS: <strong className="text-white">{breakdown.system_tokens}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#999999]">
            <div className="w-2 h-2 rounded-sm bg-purple-500" />
            <span>MEM: <strong className="text-white">{breakdown.memory_tokens}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#999999]">
            <div className="w-2 h-2 rounded-sm bg-[#f59e0b]" />
            <span>TOOLS: <strong className="text-white">{breakdown.tool_buffer_tokens}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#999999]">
            <div className="w-2 h-2 rounded-sm bg-[#62c073]" />
            <span>WINDOW: <strong className="text-white">{breakdown.active_window_tokens}</strong></span>
          </div>
        </div>
      </div>

      {/* Eviction Telemetry Banner */}
      {(breakdown.pruned_tokens > 0 || breakdown.evicted_tool_payload_tokens > 0) && (
        <div className="p-2 rounded-xl bg-black/60 border border-white/10 mb-3 flex items-center justify-between text-xs mono">
          <div className="flex items-center gap-1.5 text-white/80">
            <Trash2 className="w-3.5 h-3.5 text-[#52a8ff]" />
            <span>Context Eviction:</span>
          </div>
          <span className="text-[#62c073] font-bold">
            +{breakdown.pruned_tokens} tokens pruned & saved
          </span>
        </div>
      )}

      {/* Living Episodic Memory Key-Value Explorer */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-[#999999] mono uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Living Episodic Memory (State)</span>
          </div>
          <span className="text-[10px] text-purple-400 mono">
            {Object.keys(livingMemory).length} Facts Committed
          </span>
        </div>

        <div className="flex-1 overflow-y-auto bg-black/70 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs mono">
          {Object.keys(livingMemory).length === 0 ? (
            <p className="text-[#999999] text-center py-4">No living memory committed yet.</p>
          ) : (
            Object.entries(livingMemory).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 pb-1 border-b border-white/5 last:border-0">
                <span className="text-purple-400 text-[10px] font-bold">{k}:</span>
                <span className="text-white/90 pl-2 break-words text-[11px]">
                  {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
