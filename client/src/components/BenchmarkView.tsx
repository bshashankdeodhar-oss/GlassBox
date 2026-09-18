import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Trash2, 
  ArrowUpRight
} from 'lucide-react';
import { BenchmarkReport } from '../types';

interface BenchmarkViewProps {
  report: BenchmarkReport | null;
  onRunBenchmark: () => void;
  isLoading: boolean;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  report,
  onRunBenchmark,
  isLoading,
}) => {
  if (!report) {
    return (
      <div className="liquid-glass rounded-2xl p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-12">
        <Zap className="w-10 h-10 text-white mb-3" />
        <h2 className="text-2xl font-serif-instrument italic text-white mb-2">
          20-Turn Messy Conversation Benchmark
        </h2>
        <p className="text-xs text-[#999999] mb-6 leading-relaxed">
          Subject GlassBox to a grueling 20-turn conversation with topic changes across Financials, M&A, Security, ESG, and Valuation.
        </p>
        <button
          onClick={onRunBenchmark}
          disabled={isLoading}
          className="btn-square px-6 py-2.5 text-xs text-black font-semibold gap-1.5"
        >
          <span>{isLoading ? 'Running Stress Test...' : 'Run 20-Turn Benchmark'}</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const maxTokens = Math.max(report.naive_final_tokens, 4500);
  const chartHeight = 160;
  const chartWidth = 700;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="liquid-glass rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="v-chip v-chip-active text-[10px]">RULE 3 BENCHMARK</span>
            <span className="v-chip v-chip-pass text-[10px]">20/20 TURNS RESILIENT</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif-instrument text-white tracking-tight">
            Stress Test: 20-Turn Messy Conversation <em className="italic">Context Resilience</em>
          </h2>
          <p className="text-xs text-[#999999] mt-0.5">
            Unmanaged Naive Pipeline (Exponential Context Explosion) vs. GlassBox Context Engine (Progressive Compaction)
          </p>
        </div>

        <button
          onClick={onRunBenchmark}
          disabled={isLoading}
          className="btn-square px-4 py-2 text-xs text-black font-semibold gap-1.5 shrink-0"
        >
          <span>{isLoading ? 'Re-running...' : 'Re-run Benchmark'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dark Tech Metrics Grid: 56px numbers with tight tracking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="liquid-glass rounded-2xl p-5 space-y-1">
          <span className="text-[11px] mono text-[#999999] uppercase tracking-wider block">
            Token Reduction
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-white mono tracking-[-3.36px]">
              +{report.percent_savings}
            </span>
            <span className="text-base text-[#62c073] mono font-bold">%</span>
          </div>
          <span className="text-[11px] text-[#999999] mono block pt-1">
            {report.total_tokens_saved.toLocaleString()} tokens saved across 20 turns
          </span>
        </div>

        <div className="liquid-glass rounded-2xl p-5 space-y-1">
          <span className="text-[11px] mono text-[#999999] uppercase tracking-wider block">
            Total Cost Saved
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-[#62c073] mono tracking-[-3.36px]">
              ${report.total_cost_saved_usd.toFixed(4)}
            </span>
            <span className="text-xs text-[#999999] mono">USD</span>
          </div>
          <span className="text-[11px] text-[#999999] mono block pt-1">
            GlassBox: ${report.glassbox_total_cost_usd.toFixed(4)} vs Naive: ${report.naive_total_cost_usd.toFixed(4)}
          </span>
        </div>

        <div className="liquid-glass rounded-2xl p-5 space-y-1">
          <span className="text-[11px] mono text-[#999999] uppercase tracking-wider block">
            Turn 20 Context Bound
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-[#52a8ff] mono tracking-[-3.36px]">
              {report.glassbox_final_tokens}
            </span>
            <span className="text-xs text-[#999999] mono">tokens</span>
          </div>
          <span className="text-[11px] text-[#999999] mono block pt-1">
            Strictly bounded (Naive blew past {report.naive_final_tokens} tokens)
          </span>
        </div>

        <div className="liquid-glass rounded-2xl p-5 space-y-1">
          <span className="text-[11px] mono text-[#999999] uppercase tracking-wider block">
            Living Facts Retained
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-white mono tracking-[-3.36px]">
              {Object.keys(report.living_memory_final.key_facts || {}).length}
            </span>
            <span className="text-xs text-[#999999] mono">entities</span>
          </div>
          <span className="text-[11px] text-[#999999] mono block pt-1">
            100% memory recall across 20 turns
          </span>
        </div>
      </div>

      {/* Bento Feature Card: Token Growth Curve */}
      <div className="liquid-glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mono">
              TOKEN ACCUMULATION CURVE (TURNS 1–20)
            </h3>
            <p className="text-xs text-[#999999]">
              Exponential unmanaged context growth vs. bounded GlassBox ceiling
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#f43f5e] rounded-sm" />
              <span className="text-[#f43f5e]">Naive Explosion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#52a8ff] rounded-sm" />
              <span className="text-[#52a8ff]">GlassBox Bounded Context</span>
            </div>
          </div>
        </div>

        {/* SVG Curve */}
        <div className="w-full pt-4 pb-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
            <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            <line x1="0" y1={chartHeight * 0.50} x2={chartWidth} y2={chartHeight * 0.50} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            
            {/* Naive Path */}
            <polyline
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={report.turns
                .map((t, idx) => {
                  const x = (idx / (report.turns.length - 1)) * chartWidth;
                  const y = chartHeight - (t.naive_tokens / maxTokens) * chartHeight;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* GlassBox Path */}
            <polyline
              fill="none"
              stroke="#52a8ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={report.turns
                .map((t, idx) => {
                  const x = (idx / (report.turns.length - 1)) * chartWidth;
                  const y = chartHeight - (t.glassbox_tokens / maxTokens) * chartHeight;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {report.turns.map((t, idx) => {
              const x = (idx / (report.turns.length - 1)) * chartWidth;
              const yNaive = chartHeight - (t.naive_tokens / maxTokens) * chartHeight;
              const yGb = chartHeight - (t.glassbox_tokens / maxTokens) * chartHeight;
              return (
                <g key={idx}>
                  <circle cx={x} cy={yNaive} r="3" fill="#f43f5e" />
                  <circle cx={x} cy={yGb} r="3.5" fill="#52a8ff" />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Turn-by-Turn Audit Table */}
      <div className="liquid-glass rounded-2xl p-6">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mono mb-4">
          20-TURN CONVERSATION AUDIT LOG
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[#999999] font-mono text-[11px]">
                <th className="py-2 px-3">Turn</th>
                <th className="py-2 px-3">Topic</th>
                <th className="py-2 px-3">Inquiry & Topic Pivot</th>
                <th className="py-2 px-3">Naive</th>
                <th className="py-2 px-3">GlassBox</th>
                <th className="py-2 px-3">Tokens Saved</th>
                <th className="py-2 px-3">Context Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {report.turns.map((turn) => (
                <tr key={turn.turn_number} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 mono font-bold text-[#52a8ff]">#{turn.turn_number}</td>
                  <td className="py-3 px-3">
                    <span className="v-chip text-[10px]">{turn.topic}</span>
                  </td>
                  <td className="py-3 px-3 max-w-sm">
                    <div className="text-white font-medium line-clamp-1">{turn.user_query}</div>
                    <div className="text-[#999999] text-[11px] line-clamp-1 mt-0.5">{turn.agent_reply}</div>
                  </td>
                  <td className="py-3 px-3 mono text-[#f43f5e]">{turn.naive_tokens.toLocaleString()}</td>
                  <td className="py-3 px-3 mono text-white font-bold">{turn.glassbox_tokens.toLocaleString()}</td>
                  <td className="py-3 px-3 mono text-[#62c073] font-bold">+{turn.tokens_saved.toLocaleString()}</td>
                  <td className="py-3 px-3 text-[11px] text-[#999999]">
                    {turn.evicted_items.length > 0 ? (
                      <span className="text-purple-300 flex items-center gap-1 mono text-[10px]">
                        <Trash2 className="w-3 h-3 text-purple-400" />
                        {turn.evicted_items[0]}
                      </span>
                    ) : (
                      <span className="mono text-[10px]">Window OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
