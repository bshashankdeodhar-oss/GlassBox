import React from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Coins, 
  AlertOctagon, 
  Terminal,
  Cpu,
  CheckCircle2
} from 'lucide-react';

interface ObservabilitySpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ObservabilitySpecModal: React.FC<ObservabilitySpecModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-cyan-500/30 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                GlassBox Observability & Context Engineering Specification
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mono">
                RULE 5 COMPLIANT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Architectural transparency: What we track, why it is tracked, and how context is governed.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="space-y-4 text-xs">
          
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Activity className="w-4 h-4" />
              <span>1. Step-by-Step Spans & Deterministic Tracing</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>What is tracked:</strong> Every LLM invocation, system prompt, temperature, completion text, tool payload, and latency waterfall.
            </p>
            <p className="text-slate-400 leading-relaxed">
              <strong>Why:</strong> Traditional AI pipelines treat model calls as a black-box function. By logging discrete immutable steps with parent-child span IDs, judges and developers can scrub through historical execution like video footage, pinpointing exactly which step introduced a defect.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>2. Active Context Engineering & Token Budgeting</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>What is tracked:</strong> Context composition breakdown across System Instructions (15%), Living Memory (25%), Ephemeral Tool Buffer (25%), and Recent Dialogue Window (35%), alongside eviction counts.
            </p>
            <p className="text-slate-400 leading-relaxed">
              <strong>Why:</strong> In long (15-20+ turn) conversations, unmanaged pipelines explode in token count and cost, eventually causing context truncation crashes. GlassBox actively evicts stale raw tool outputs once synthesized, while progressively compacting historical turns into a structured Living Memory state.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertOctagon className="w-4 h-4" />
              <span>3. Failure Interception & Root-Cause Autopsy</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>What is tracked:</strong> Failure Type, Severity, Root Cause, Observed Impact, Intercept Mechanism, Remediation Applied, and Tokens Saved.
            </p>
            <p className="text-slate-400 leading-relaxed">
              <strong>Why:</strong> When a tool dumps a massive 20,000-token unparsed log or the model hallucinates an invalid parameter, GlassBox intercepts the anomaly before injecting it into the LLM prompt. It logs a transparent diagnostic autopsy and triggers a targeted self-healing recovery loop.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Coins className="w-4 h-4" />
              <span>4. Micro-Cent Unit Economics & Pricing Models</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>What is tracked:</strong> Input token count, output token count, and exact dollar calculation based on provider tariffs (e.g. Gemini 1.5 Pro: $3.50/1M input, $10.50/1M output).
            </p>
            <p className="text-slate-400 leading-relaxed">
              <strong>Why:</strong> Cost transparency is critical for production AI systems. GlassBox displays exact cumulative cost per run and quantifies the dollars saved through context compaction.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors"
          >
            Close Specification
          </button>
        </div>

      </div>
    </div>
  );
};
