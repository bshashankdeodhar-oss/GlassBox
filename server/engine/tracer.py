"""
GlassBox Tracing and Telemetry Engine.
Logs and tracks every LLM call, tool call, step, token usage, latency, and cost.
Generates Failure Autopsies and provides complete deterministic replay traces.
"""

import os
import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
from .models import (
    SessionTrace,
    StepRecord,
    StepStatus,
    ToolCallRecord,
    FailureAutopsy,
    ContextBreakdown,
)

# Model pricing table per 1M tokens (USD)
PRICING_TABLE = {
    "gemini-1.5-pro": {"input_per_million": 3.50, "output_per_million": 10.50},
    "gemini-1.5-flash": {"input_per_million": 0.075, "output_per_million": 0.30},
    "gpt-4o": {"input_per_million": 2.50, "output_per_million": 10.00},
}


def estimate_tokens(text: str) -> int:
    """Accurate token estimator based on typical BPE tokenizer heuristics."""
    if not text:
        return 0
    # Average ~3.8 characters per token for typical English text + code/JSON
    return max(1, int(len(text) / 3.8))


class Tracer:
    def __init__(self, trace_dir: str = "traces"):
        self.trace_dir = trace_dir
        os.makedirs(self.trace_dir, exist_ok=True)
        self.active_sessions: Dict[str, SessionTrace] = {}

    def start_session(
        self,
        session_id: str,
        title: str,
        scenario: str = "custom",
        model_name: str = "gemini-1.5-pro",
    ) -> SessionTrace:
        """Initializes a new traceable session."""
        pricing = PRICING_TABLE.get(model_name, PRICING_TABLE["gemini-1.5-pro"])
        pricing_str = f"{model_name} (${pricing['input_per_million']:.2f}/1M in, ${pricing['output_per_million']:.2f}/1M out)"
        
        session = SessionTrace(
            session_id=session_id,
            title=title,
            scenario=scenario,
            model_name=model_name,
            pricing_model=pricing_str,
            steps=[],
            living_memory={},
        )
        self.active_sessions[session_id] = session
        self.save_trace(session)
        return session

    def calculate_cost(
        self, model_name: str, prompt_tokens: int, completion_tokens: int
    ) -> float:
        """Calculates exact cost in USD based on token counts."""
        pricing = PRICING_TABLE.get(model_name, PRICING_TABLE["gemini-1.5-pro"])
        cost_in = (prompt_tokens / 1_000_000.0) * pricing["input_per_million"]
        cost_out = (completion_tokens / 1_000_000.0) * pricing["output_per_million"]
        return round(cost_in + cost_out, 6)

    def record_step(
        self,
        session_id: str,
        step_type: str,
        title: str,
        description: str,
        status: StepStatus = StepStatus.SUCCESS,
        raw_prompt: Optional[str] = None,
        raw_response: Optional[str] = None,
        tool_calls: Optional[List[ToolCallRecord]] = None,
        context_breakdown: Optional[ContextBreakdown] = None,
        autopsy: Optional[FailureAutopsy] = None,
        latency_ms: float = 0.0,
        living_memory: Optional[Dict[str, Any]] = None,
    ) -> StepRecord:
        """Records an immutable step into the session trace."""
        session = self.active_sessions.get(session_id)
        if not session:
            session = self.start_session(session_id, title=title)

        step_number = len(session.steps) + 1
        step_id = f"{session_id}_step_{step_number}"

        prompt_tokens = estimate_tokens(raw_prompt or "")
        completion_tokens = estimate_tokens(raw_response or "")
        step_cost = self.calculate_cost(
            session.model_name, prompt_tokens, completion_tokens
        )
        cumulative_cost = round(session.total_cost_usd + step_cost, 6)

        if context_breakdown is None:
            context_breakdown = ContextBreakdown(
                total_tokens=prompt_tokens,
                active_window_tokens=prompt_tokens,
            )

        if living_memory is not None:
            session.living_memory = living_memory

        step = StepRecord(
            step_id=step_id,
            step_number=step_number,
            step_type=step_type,
            title=title,
            description=description,
            status=status,
            latency_ms=round(latency_ms, 2),
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            step_cost_usd=step_cost,
            cumulative_cost_usd=cumulative_cost,
            raw_prompt=raw_prompt,
            raw_response=raw_response,
            tool_calls=tool_calls or [],
            context_breakdown=context_breakdown,
            autopsy=autopsy,
            living_memory_snapshot=session.living_memory.copy(),
        )

        session.steps.append(step)
        session.total_steps = len(session.steps)
        session.total_prompt_tokens += prompt_tokens
        session.total_completion_tokens += completion_tokens
        session.total_tokens += prompt_tokens + completion_tokens
        session.total_cost_usd = cumulative_cost
        session.total_latency_ms = round(session.total_latency_ms + latency_ms, 2)

        if context_breakdown.pruned_tokens > 0:
            session.tokens_saved += context_breakdown.pruned_tokens
            savings_usd = (context_breakdown.pruned_tokens / 1_000_000.0) * PRICING_TABLE[
                session.model_name
            ]["input_per_million"]
            session.cost_saved_usd = round(session.cost_saved_usd + savings_usd, 6)

        self.save_trace(session)
        return step

    def create_failure_autopsy(
        self,
        failure_id: str,
        step_number: int,
        failure_type: str,
        root_cause: str,
        observed_impact: str,
        intercept_mechanism: str,
        remediation_applied: str,
        tokens_saved: int = 0,
        severity: str = "HIGH",
    ) -> FailureAutopsy:
        """Builds a comprehensive diagnostic autopsy for a pipeline failure."""
        return FailureAutopsy(
            failure_id=failure_id,
            step_number=step_number,
            failure_type=failure_type,
            severity=severity,
            root_cause=root_cause,
            observed_impact=observed_impact,
            intercept_mechanism=intercept_mechanism,
            remediation_applied=remediation_applied,
            tokens_saved=tokens_saved,
            healed=True,
        )

    def get_trace(self, session_id: str) -> Optional[SessionTrace]:
        """Retrieves trace from memory or persisted file."""
        if session_id in self.active_sessions:
            return self.active_sessions[session_id]
        file_path = os.path.join(self.trace_dir, f"{session_id}.json")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                session = SessionTrace(**data)
                self.active_sessions[session_id] = session
                return session
        return None

    def list_traces(self) -> List[Dict[str, Any]]:
        """Returns metadata for all available sessions."""
        summaries = []
        # Check files
        for fname in os.listdir(self.trace_dir):
            if fname.endswith(".json"):
                fpath = os.path.join(self.trace_dir, fname)
                try:
                    with open(fpath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        summaries.append(
                            {
                                "session_id": data.get("session_id"),
                                "title": data.get("title"),
                                "scenario": data.get("scenario"),
                                "created_at": data.get("created_at"),
                                "total_steps": data.get("total_steps", 0),
                                "total_tokens": data.get("total_tokens", 0),
                                "total_cost_usd": data.get("total_cost_usd", 0.0),
                                "tokens_saved": data.get("tokens_saved", 0),
                            }
                        )
                except Exception:
                    continue
        return sorted(summaries, key=lambda x: x.get("created_at", ""), reverse=True)

    def save_trace(self, session: SessionTrace):
        """Persists session trace to JSON file."""
        file_path = os.path.join(self.trace_dir, f"{session.session_id}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(session.model_dump_json(indent=2))


# Global Tracer singleton
global_tracer = Tracer(trace_dir=os.path.join(os.path.dirname(__file__), "..", "traces"))
