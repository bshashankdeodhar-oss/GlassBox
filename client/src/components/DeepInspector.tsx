import React, { useState } from 'react';
import { 
  FileCode, 
  Wrench, 
  AlertOctagon, 
  Coins, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  Terminal
} from 'lucide-react';
import { StepRecord } from '../types';

interface DeepInspectorProps {
  step: StepRecord | null;
  pricingModel?: string;
}

export const DeepInspector: React.FC<DeepInspectorProps> = ({
  step,
  pricingModel = 'gemini-1.5-pro ($3.50/1M in, $10.50/1M out)',
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'tools' | 'autopsy' | 'cost'>(
    step?.autopsy ? 'autopsy' : 'prompt'
  );
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (step?.autopsy) {
      setActiveTab('autopsy');
    }
  }, [step?.step_id]);

  if (!step) {
    return (
      <div className="liquid-glass rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center text-[#999999]">
        <FileCode className="w-8 h-8 mb-2 opacity-40 text-white" />
        <p className="text-xs">Select a span from the event stream to inspect deep traces.</p>
      </div>
    );
  }

  const handleCopyPrompt = () => {
    if (step.raw_prompt) {
      navigator.clipboard.writeText(step.raw_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="liquid-glass rounded-2xl p-4 h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {step.autopsy && (
            <button
              onClick={() => setActiveTab('autopsy')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'autopsy'
                  ? 'bg-[#f43f5e] text-white shadow-lg shadow-[#f43f5e]/30'
                  : 'text-[#f43f5e] hover:bg-[#f43f5e]/10'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" /> Failure Autopsy
            </button>
          )}

          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'prompt'
                ? 'bg-white text-black font-semibold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Raw Prompt
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'bg-white text-black font-semibold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Tool Payloads ({step.tool_calls.length})
          </button>

          <button
            onClick={() => setActiveTab('cost')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'cost'
                ? 'bg-white text-black font-semibold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" /> Cost Breakdown
          </button>
        </div>

        <div className="v-chip text-[10px]">
          <span>SPAN #{step.step_number}</span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        
        {/* 1. FAILURE AUTOPSY */}
        {activeTab === 'autopsy' && step.autopsy && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#f43f5e]/20 via-[#0a0a0a] to-[#0a0a0a] border border-[#f43f5e]/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="v-chip v-chip-fail">
                  <span className="v-chip-dot" />
                  <span>{step.autopsy.failure_type}</span>
                </span>
                <span className="v-chip v-chip-pass">
                  <span className="v-chip-dot" />
                  <span>AUTONOMOUSLY HEALED</span>
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <h4 className="font-bold text-[#f43f5e] uppercase tracking-wider text-[10px] mb-1 mono">
                    1. Root Cause Analysis
                  </h4>
                  <p className="text-white/90 bg-black/70 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                    {step.autopsy.root_cause}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#f59e0b] uppercase tracking-wider text-[10px] mb-1 mono">
                    2. Observed Impact in Unmanaged System
                  </h4>
                  <p className="text-white/90 bg-black/70 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                    {step.autopsy.observed_impact}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#52a8ff] uppercase tracking-wider text-[10px] mb-1 mono">
                    3. Intercept Mechanism
                  </h4>
                  <p className="text-white/90 bg-black/70 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                    {step.autopsy.intercept_mechanism}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#62c073] uppercase tracking-wider text-[10px] mb-1 mono">
                    4. Remediation & Self-Healing Applied
                  </h4>
                  <p className="text-white/90 bg-black/70 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                    {step.autopsy.remediation_applied}
                  </p>
                </div>
              </div>

              {step.autopsy.tokens_saved > 0 && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs mono">
                  <span className="text-[#999999]">Protected Tokens Saved:</span>
                  <span className="text-[#62c073] font-bold">
                    +{step.autopsy.tokens_saved.toLocaleString()} tokens
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. RAW PROMPT */}
        {activeTab === 'prompt' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#999999] mono">
                {step.prompt_tokens} In / {step.completion_tokens} Out
              </span>
              <button
                onClick={handleCopyPrompt}
                className="btn-square-outline text-[11px] px-2.5 py-1 gap-1"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-[#62c073]" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </button>
            </div>

            <pre className="bg-[#050505] p-3.5 rounded-xl border border-white/10 text-xs text-white/90 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[340px]">
              {step.raw_prompt || '(No prompt emitted for this operation)'}
            </pre>

            {step.raw_response && (
              <div className="mt-3">
                <span className="text-xs text-[#999999] mono block mb-1">
                  Model Output / Completion:
                </span>
                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-xs text-white/90 font-sans whitespace-pre-wrap leading-relaxed">
                  {step.raw_response}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TOOL PAYLOADS */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            {step.tool_calls.length === 0 ? (
              <p className="text-xs text-[#999999] text-center py-6">
                No external tool calls invoked in this span.
              </p>
            ) : (
              step.tool_calls.map((tool, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="mono text-xs font-bold text-[#52a8ff]">
                      {tool.tool_name}
                    </span>
                    <div className="v-chip v-chip-active text-[10px]">
                      <span className="v-chip-dot" />
                      <span>{tool.status} ({Math.round(tool.latency_ms)}ms)</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#999999] mono">Input Arguments:</span>
                    <pre className="bg-black/70 p-2 rounded text-[11px] text-white/90 mono overflow-x-auto">
                      {JSON.stringify(tool.tool_args, null, 2)}
                    </pre>
                  </div>

                  {tool.distilled_output && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#62c073] mono">
                        Distilled Fact (Committed to Memory):
                      </span>
                      <p className="bg-[#62c073]/10 border border-[#62c073]/30 p-2 rounded text-xs text-[#62c073]">
                        {tool.distilled_output}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#999999] mono">Raw Return Payload:</span>
                    <pre className="bg-black/90 p-2 rounded text-[11px] text-[#999999] mono overflow-x-auto max-h-28">
                      {typeof tool.raw_output === 'object'
                        ? JSON.stringify(tool.raw_output, null, 2)
                        : String(tool.raw_output)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. COST BREAKDOWN */}
        {activeTab === 'cost' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs mono">
              <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/10">
                <span className="text-[#999999] block text-[10px]">Prompt Input:</span>
                <span className="text-white font-bold text-base">
                  ${((step.prompt_tokens / 1_000_000) * 3.50).toFixed(6)}
                </span>
                <span className="text-[#999999] text-[10px] block mt-0.5">
                  {step.prompt_tokens} tokens @ $3.50/1M
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/10">
                <span className="text-[#999999] block text-[10px]">Completion Output:</span>
                <span className="text-white font-bold text-base">
                  ${((step.completion_tokens / 1_000_000) * 10.50).toFixed(6)}
                </span>
                <span className="text-[#999999] text-[10px] block mt-0.5">
                  {step.completion_tokens} tokens @ $10.50/1M
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#62c073]/10 border border-[#62c073]/30 flex items-center justify-between text-xs mono">
              <span className="text-white">Total Span Cost:</span>
              <span className="text-[#62c073] font-bold text-sm">
                ${step.step_cost_usd.toFixed(6)} USD
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-between text-xs mono">
              <span className="text-[#999999]">Cumulative Session Cost:</span>
              <span className="text-white font-bold">
                ${step.cumulative_cost_usd.toFixed(5)} USD
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
