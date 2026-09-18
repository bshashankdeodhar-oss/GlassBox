"""
GlassBox FastAPI Server.
Exposes REST and streaming APIs for traces, multi-step agent execution,
failure autopsies, and the 20-Turn Messy Conversation Benchmark.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uuid

from engine.models import SessionTrace, BenchmarkReport
from engine.tracer import global_tracer
from engine.context_engine import global_context_engine
from engine.agent import global_agent
from engine.scenarios import global_scenarios

app = FastAPI(
    title="GlassBox Observability & Context Engineering Runtime",
    version="1.0.0",
    description="Glass-box AI agent runtime with step-by-step tracing, failure autopsy, and active context governance.",
)

# Enable CORS for frontend Vite app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for latest benchmark
_latest_benchmark: Optional[BenchmarkReport] = None


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    model_name: Optional[str] = "gemini-1.5-pro"
    simulate_failure: Optional[str] = None  # "bloat" or "schema_error"


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GlassBox Runtime",
        "budget_limit_tokens": global_context_engine.budget_limit,
    }


@app.get("/api/traces", response_model=List[Dict[str, Any]])
def list_traces():
    """Returns list of all session trace summaries."""
    return global_tracer.list_traces()


@app.get("/api/traces/{session_id}", response_model=SessionTrace)
def get_trace(session_id: str):
    """Retrieves full trace for a given session."""
    trace = global_tracer.get_trace(session_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Trace session '{session_id}' not found.")
    return trace


@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    """Executes a user message through the GlassBox agent, recording all steps into the trace."""
    session_id = req.session_id or f"session_{uuid.uuid4().hex[:8]}"
    existing_trace = global_tracer.get_trace(session_id)
    if not existing_trace:
        global_tracer.start_session(
            session_id=session_id,
            title=f"Chat: {req.message[:35]}...",
            scenario="interactive_chat",
            model_name=req.model_name or "gemini-1.5-pro",
        )

    result = global_agent.execute_workflow(
        session_id=session_id,
        user_objective=req.message,
        simulate_failure_mode=req.simulate_failure,
    )
    full_trace = global_tracer.get_trace(session_id)
    return {
        "session_id": session_id,
        "result": result,
        "trace": full_trace,
    }


@app.post("/api/scenarios/clean")
def trigger_clean_scenario():
    """Triggers clean multi-step research scenario with full tracing."""
    session_id = f"clean_run_{uuid.uuid4().hex[:6]}"
    result = global_scenarios.run_clean_scenario(session_id=session_id)
    full_trace = global_tracer.get_trace(session_id)
    return {"session_id": session_id, "result": result, "trace": full_trace}


@app.post("/api/scenarios/failure")
def trigger_failure_scenario():
    """Triggers failure case intercept & self-healing autopsy demo (Satisfies Rule 2)."""
    session_id = f"failure_autopsy_{uuid.uuid4().hex[:6]}"
    result = global_scenarios.run_failure_scenario(session_id=session_id)
    full_trace = global_tracer.get_trace(session_id)
    return {"session_id": session_id, "result": result, "trace": full_trace}


@app.post("/api/scenarios/benchmark", response_model=BenchmarkReport)
def trigger_benchmark():
    """Executes the 20-Turn Messy Conversation Benchmark (Satisfies Rule 3)."""
    global _latest_benchmark
    benchmark_id = f"benchmark_20turns_{uuid.uuid4().hex[:6]}"
    report = global_scenarios.run_20_turn_benchmark(benchmark_id=benchmark_id)
    _latest_benchmark = report
    return report


@app.get("/api/benchmarks/latest", response_model=BenchmarkReport)
def get_latest_benchmark():
    """Returns the latest 20-turn benchmark report, generating one if not yet run."""
    global _latest_benchmark
    if not _latest_benchmark:
        _latest_benchmark = global_scenarios.run_20_turn_benchmark()
    return _latest_benchmark


@app.get("/api/spec")
def get_observability_spec():
    """Returns the architectural observability guide and telemetry explanation (Satisfies Rule 5)."""
    return {
        "architecture": "GlassBox Zero-Black-Box Observability Engine",
        "pillars": [
            {
                "name": "Deterministic Step Tracing",
                "metrics_tracked": ["Prompt Tokens", "Completion Tokens", "Latency (ms)", "USD Cost ($)", "Living Memory State"],
                "purpose": "Enables judges to replay exact model inputs, system prompts, and responses step-by-step."
            },
            {
                "name": "Dynamic Context Engineering & Token Budgeting",
                "metrics_tracked": ["System Tokens", "Living Memory Tokens", "Tool Buffer Tokens", "Window Tokens", "Pruned Tokens", "Eviction Count"],
                "purpose": "Ensures 20+ turn messy conversations never blow past the context window budget or crash."
            },
            {
                "name": "Failure Interception & Diagnostic Autopsy",
                "metrics_tracked": ["Failure Type", "Severity", "Root Cause", "Observed Impact", "Remediation Applied", "Tokens Saved"],
                "purpose": "Catches payload blowups and hallucinated parameters before catastrophic pipeline failure, self-healing autonomously."
            },
            {
                "name": "Micro-Cent Cost Accounting",
                "metrics_tracked": ["Input Cost ($3.50/1M)", "Output Cost ($10.50/1M)", "Cumulative Cost", "Dollar Savings vs Naive Pipeline"],
                "purpose": "Transparent unit-economics monitoring for every step in the pipeline."
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
