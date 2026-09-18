import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Bot
} from 'lucide-react';
import { SessionTrace } from '../types';

interface InteractiveChatProps {
  currentTrace: SessionTrace | null;
  onSendMessage: (message: string, failureMode?: string) => void;
  isLoading: boolean;
}

export const InteractiveChat: React.FC<InteractiveChatProps> = ({
  currentTrace,
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const [failureMode, setFailureMode] = useState<string>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input, failureMode === 'none' ? undefined : failureMode);
    setInput('');
  };

  return (
    <div className="liquid-glass rounded-2xl p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#52a8ff]" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mono">
            AGENT REASONING CONSOLE
          </h2>
        </div>
        <div className="v-chip text-[10px]">
          <span>{currentTrace?.model_name || 'gemini-1.5-pro'}</span>
        </div>
      </div>

      {/* Message History & Synthesis */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {currentTrace ? (
          <div className="space-y-3">
            {/* Session Info card */}
            <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1">
              <span className="text-[10px] text-[#52a8ff] uppercase font-bold mono">Active Session:</span>
              <h4 className="text-white font-semibold text-xs">{currentTrace.title}</h4>
              <p className="text-[#999999] text-[11px] mono">
                Scenario: <span className="text-white">{currentTrace.scenario}</span> • Spans: <span className="text-white">{currentTrace.total_steps}</span>
              </p>
            </div>

            {/* Audited Synthesis Briefing */}
            {currentTrace.steps.some(s => s.step_type === 'REASONING_SYNTHESIS') && (
              <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-white font-bold text-xs mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#52a8ff]" />
                  <span>Audited Executive Synthesis:</span>
                </div>
                <div className="text-white/90 whitespace-pre-wrap leading-relaxed text-xs">
                  {currentTrace.steps.find(s => s.step_type === 'REASONING_SYNTHESIS')?.raw_response}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#999999] py-10">
            <Bot className="w-8 h-8 mb-2 opacity-30 text-white" />
            <p className="text-xs">Select a scenario or send a custom prompt to trace execution.</p>
          </div>
        )}
      </div>

      {/* Input Box & Injections */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#999999] mono">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
            Failure Test:
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="failure_mode"
                value="none"
                checked={failureMode === 'none'}
                onChange={() => setFailureMode('none')}
                className="accent-white"
              />
              <span>Clean</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-[#f43f5e]">
              <input
                type="radio"
                name="failure_mode"
                value="bloat"
                checked={failureMode === 'bloat'}
                onChange={() => setFailureMode('bloat')}
                className="accent-[#f43f5e]"
              />
              <span>Bloat</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-[#f59e0b]">
              <input
                type="radio"
                name="failure_mode"
                value="schema_error"
                checked={failureMode === 'schema_error'}
                onChange={() => setFailureMode('schema_error')}
                className="accent-[#f59e0b]"
              />
              <span>Schema</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Prompt agent (e.g. 'Investigate TechNova FY2024 revenue & CloudScale M&A')..."
            disabled={isLoading}
            className="w-full bg-black/90 border border-white/15 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-[#777777] focus:outline-none focus:border-white transition-all disabled:opacity-50 mono"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-square absolute right-1.5 p-1.5 text-black disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
