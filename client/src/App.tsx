import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ExecutionDAG } from './components/ExecutionDAG';
import { ContextFlamegraph } from './components/ContextFlamegraph';
import { DeepInspector } from './components/DeepInspector';
import { TimeMachineScrubber } from './components/TimeMachineScrubber';
import { BenchmarkView } from './components/BenchmarkView';
import { InteractiveChat } from './components/InteractiveChat';
import { ObservabilitySpecModal } from './components/ObservabilitySpecModal';
import { SessionTrace, BenchmarkReport } from './types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'trace' | 'benchmark'>('trace');
  const [currentTrace, setCurrentTrace] = useState<SessionTrace | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReport | null>(null);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Background Video Ref for 0.5x calm playback rate (Observe spec)
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  // Load initial demo trace
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await fetch('/api/traces/demo_clean_run');
      if (res.ok) {
        const trace = await res.json();
        setCurrentTrace(trace);
        setActiveStepIndex(trace.steps.length - 1);
      } else {
        handleRunClean();
      }

      const benchRes = await fetch('/api/benchmarks/latest');
      if (benchRes.ok) {
        const bench = await benchRes.json();
        setBenchmarkReport(bench);
      }
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  };

  const handleRunClean = async () => {
    setIsLoading(true);
    setActiveView('trace');
    try {
      const res = await fetch('/api/scenarios/clean', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCurrentTrace(data.trace);
        setActiveStepIndex(data.trace.steps.length - 1);
      }
    } catch (e) {
      console.error('Failed to run clean scenario:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunFailure = async () => {
    setIsLoading(true);
    setActiveView('trace');
    try {
      const res = await fetch('/api/scenarios/failure', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCurrentTrace(data.trace);
        const failureStepIdx = data.trace.steps.findIndex((s: any) => s.autopsy != null);
        setActiveStepIndex(failureStepIdx !== -1 ? failureStepIdx : data.trace.steps.length - 1);
      }
    } catch (e) {
      console.error('Failed to run failure scenario:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunBenchmark = async () => {
    setIsLoading(true);
    setActiveView('benchmark');
    try {
      const res = await fetch('/api/scenarios/benchmark', { method: 'POST' });
      if (res.ok) {
        const bench = await res.json();
        setBenchmarkReport(bench);
      }
    } catch (e) {
      console.error('Failed to run benchmark:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string, failureMode?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentTrace?.session_id,
          message,
          simulate_failure: failureMode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentTrace(data.trace);
        setActiveStepIndex(data.trace.steps.length - 1);
      }
    } catch (e) {
      console.error('Failed to send chat message:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeStep = currentTrace?.steps[activeStepIndex] || null;

  return (
    <div className="min-h-screen relative flex flex-col bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Background Video Loop (Observe Spec) */}
      <video
        ref={videoRef}
        className="fixed inset-0 w-full h-full object-cover object-bottom pointer-events-none z-0 opacity-20"
        src="https://designerstephen.github.io/public-assets/videos/observe-hero.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
      />

      {/* Dark Scrim overlay for high legibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black pointer-events-none z-0" />

      {/* App Foreground */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Liquid Glass Pill Navbar */}
        <Header
          currentTrace={currentTrace}
          activeView={activeView}
          setActiveView={setActiveView}
          onRunClean={handleRunClean}
          onRunFailure={handleRunFailure}
          onRunBenchmark={handleRunBenchmark}
          onOpenSpec={() => setIsSpecModalOpen(true)}
          isLoading={isLoading}
        />

        {/* Hero Editorial Subline in Instrument Serif */}
        <div className="px-6 py-2 text-center max-w-4xl mx-auto">
          <h2 className="font-serif-instrument text-2xl sm:text-3xl text-white hero-text-shadow tracking-tight">
            See inside every step, every decision, <em className="italic">every cost.</em>
          </h2>
          <p className="text-[#999999] text-xs subline-text-shadow mt-1 mono">
            Deterministic step replay • Context engineering • Autonomous failure autopsies
          </p>
        </div>

        {/* Main Workspace Layout */}
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 flex flex-col">
          {activeView === 'benchmark' ? (
            <BenchmarkView
              report={benchmarkReport}
              onRunBenchmark={handleRunBenchmark}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Interactive Chat & Agent Reasoning (3 cols) */}
              <div className="lg:col-span-3 h-[calc(100vh-195px)] min-h-[500px]">
                <InteractiveChat
                  currentTrace={currentTrace}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>

              {/* Middle Column: Event Stream & Waterfall Timeline Table (4 cols) */}
              <div className="lg:col-span-4 h-[calc(100vh-195px)] min-h-[500px]">
                <ExecutionDAG
                  steps={currentTrace?.steps || []}
                  activeStepIndex={activeStepIndex}
                  onSelectStep={setActiveStepIndex}
                />
              </div>

              {/* Right Column: Context Budget Slicer & Deep Inspector (5 cols) */}
              <div className="lg:col-span-5 h-[calc(100vh-195px)] min-h-[500px] flex flex-col gap-4">
                {/* Top: Context Budget Flamegraph */}
                <div className="h-[40%] min-h-[200px]">
                  <ContextFlamegraph
                    breakdown={
                      activeStep?.context_breakdown || {
                        system_tokens: 420,
                        memory_tokens: 380,
                        tool_buffer_tokens: 540,
                        active_window_tokens: 400,
                        total_tokens: 1740,
                        budget_limit: 4000,
                        pruned_tokens: 0,
                        evicted_tool_payload_tokens: 0,
                        utilization_pct: 43.5,
                      }
                    }
                    livingMemory={activeStep?.living_memory_snapshot || currentTrace?.living_memory || {}}
                    driftScore={currentTrace?.drift_score || 0.0}
                  />
                </div>

                {/* Bottom: Deep Inspector & Failure Autopsy */}
                <div className="flex-1 min-h-[280px]">
                  <DeepInspector
                    step={activeStep}
                    pricingModel={currentTrace?.pricing_model}
                  />
                </div>
              </div>

            </div>
          )}
        </main>

        {/* Bottom Time-Machine Replay Scrubber */}
        {activeView === 'trace' && currentTrace && (
          <TimeMachineScrubber
            steps={currentTrace.steps}
            activeStepIndex={activeStepIndex}
            onSelectStep={setActiveStepIndex}
          />
        )}

      </div>

      {/* Observability Specification Modal (Rule 5) */}
      <ObservabilitySpecModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />

    </div>
  );
};
