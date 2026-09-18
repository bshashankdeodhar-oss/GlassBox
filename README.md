# 🔍 GlassBox: The Observable AI Agent Runtime & Time-Machine Studio

> **"Your AI pipeline works today. Nobody knows why it will break tomorrow, and when it does, nobody can tell what went wrong."**
> 
> **GlassBox** solves this fundamental flaw with 100% deterministic step-by-step tracing, dynamic context engineering, live failure autopsies, and a time-machine replay studio.

---

## 🏆 Hackathon Rules Compliance Matrix

| Track Rule | How GlassBox Conquers It | Where to Inspect |
| :--- | :--- | :--- |
| **1. Trace/Log Every Run** | Every run produces an immutable step-by-step execution DAG, full prompt snapshot, tool I/O, latency waterfall, and cost log. Exportable as JSON. | Execution DAG & Deep Inspector in Studio |
| **2. Caught Real Failure Case** | Detects **Context Payload Bloat Overflow** (7,400+ token unparsed syslog dump) and **Tool Argument Hallucinations**, generates a diagnostic **Root-Cause Autopsy**, and autonomously self-heals. | "Failure & Autopsy" button & Failure Autopsy tab |
| **3. 15–20 Turn Long / Messy Conversations** | Dedicated **20-Turn Stress Benchmark** with topic pivots across 5 domains. GlassBox uses progressive compaction and stale-tool eviction to keep context bounded at <870 tokens (vs 3,700+ exploding), saving **71.8% tokens**. | "20-Turn Benchmark" tab in Studio |
| **4. Token Usage & Cost Tracking** | Real-time HUD showing input/output tokens, latency (ms), and exact USD cost ($) with micro-cent accuracy, plus tokens & dollars saved. | Top Telemetry HUD & Cost Breakdown Tab |
| **5. Zero Black-Box Observability** | Native telemetry schemas with an in-app **Observability Specification** detailing every metric, budget formula, and decision. | "Observability Spec" modal in Studio |

---

## 🏛 Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   GlassBox Studio UI                                   │
│  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌──────────────────────┐  │
│  │  Interactive Agent Chat │  │   Execution Flow & Spans  │  │    Deep Inspector    │  │
│  │  • Multi-turn dialogue  │  │   • Visual step DAG nodes │  │    • Raw Prompts     │  │
│  │  • Failure injections   │  │   • Token budget meter    │  │    • Tool I/O Payloads│  │
│  │  • Live briefings       │  │   • Status pills & alerts │  │    • Failure Autopsy │  │
│  └─────────────────────────┘  └───────────────────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │            Time-Machine Scrubber (Step-by-step replay & state diffs)              │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────▲─────────────────────────────────────────────┘
                                           │ REST / SSE API (Proxy :3000 -> :8000)
┌──────────────────────────────────────────┴─────────────────────────────────────────────┐
│                                   GlassBox Core Runtime                                 │
│                                                                                        │
│  ┌───────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────┐  │
│  │      Tracing Engine       │  │  Context Engineering    │  │    Agent & Tools     │  │
│  │  • Span & Event Manager   │  │  • Token Budget Slicer  │  │  • Multi-step Agent  │  │
│  │  • Cost & Latency Tracker │  │  • Progressive Compactor│  │  • Financial DB      │  │
│  │  • State Checkpointer     │  │  • Stale Output Evictor │  │  • SEC Web Search RAG│  │
│  │  • Failure Autopsy Gen    │  │  • Drift Sentinel       │  │  • Self-Healing Loop │  │
│  └───────────────────────────┘  └─────────────────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Presentation Guide

### 1. Launch with One Command
Double-click `run.bat` or run:
```bash
# Terminal 1: Backend
cd server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
cd client
npm run dev
```
Open **http://localhost:3000** in your browser.

---

### 2. Hackathon Demo Presentation Script (3 Minutes)

1. **Minute 1: The Observability Studio & Deterministic Replay (Rule 1 & 4)**
   - Click **"Clean Run"**.
   - Show the **Execution Flow & Spans DAG**: Step 1 Plan → Step 2 Tool Intelligence (SEC Filings + Financial DB) → Step 4 Context Maintenance → Step 5 Audited Synthesis.
   - Point to the **Top Telemetry HUD**: Live tokens, exact micro-cent USD cost, and latency.
   - Scrub the **Time-Machine Replay bar** at the bottom: Step backward to Step 2 to see the exact prompt and tool payloads at that moment in time.

2. **Minute 2: The Real Failure Case & Diagnostic Autopsy (Rule 2)**
   - Click **"Failure & Autopsy"**.
   - Watch Step 3 light up in red and emerald: `[AUTONOMOUS RECOVERY] Context Overflow Intercept & Distillation`.
   - Open the **Failure Autopsy Tab**:
     - *Root Cause:* Legacy subsystem dumped 28,236 characters (~7,430 tokens) of unparsed syslog noise.
     - *Observed Impact:* Imminent context budget overflow (would exceed 4,000-token limit and crash pipeline).
     - *Intercept Mechanism:* GlassBox Token Budget Sentinel intercepted the raw payload before LLM injection.
     - *Remediation Applied:* Extracted vital health metrics (`Transaction Success Rate: 99.98%`), discarded 7,385 tokens of noise, and self-healed.

3. **Minute 3: The 20-Turn Messy Conversation Benchmark (Rule 3 & 5)**
   - Click **"20-Turn Benchmark"** in the header.
   - Show the **Comparative Token Growth Curve**:
     - The red line (Naive pipeline) explodes exponentially over 3,700 tokens.
     - The cyan line (GlassBox) stays completely flat and bounded at <870 tokens.
   - Show the summary: **+71.8% token savings, $0.106 USD saved in one session, 20/20 turns resilient**.
   - Click **"Observability Spec"** to show judges the architectural transparency specification explaining every metric.

---

## 🧪 Automated Test Suite
To run the automated verification suite:
```bash
cd server
python -m pytest tests -v
```
Output:
```
tests/test_20_turns.py::test_20_turn_benchmark_execution PASSED
tests/test_context_engine.py::test_context_engine_budgeting PASSED
tests/test_context_engine.py::test_stale_tool_eviction PASSED
tests/test_context_engine.py::test_progressive_compaction PASSED
tests/test_context_engine.py::test_context_drift_detection PASSED
tests/test_tracer.py::test_estimate_tokens PASSED
tests/test_tracer.py::test_tracer_session_and_steps PASSED
tests/test_tracer.py::test_tracer_failure_autopsy PASSED
============================== 8 passed in 0.20s ==============================
```
