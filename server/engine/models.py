"""
Data models and schemas for GlassBox Observability and Context Engineering.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class StepStatus(str, Enum):
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    FAILED = "FAILED"
    HEALED = "HEALED"


class EventType(str, Enum):
    LLM_CALL = "llm_call"
    TOOL_CALL = "tool_call"
    CONTEXT_PRUNE = "context_prune"
    CONTEXT_EVICT = "context_evict"
    FAILURE_INTERCEPT = "failure_intercept"
    SELF_HEAL = "self_heal"
    STATE_UPDATE = "state_update"


class ContextBreakdown(BaseModel):
    system_tokens: int = 0
    memory_tokens: int = 0
    tool_buffer_tokens: int = 0
    active_window_tokens: int = 0
    total_tokens: int = 0
    budget_limit: int = 4000
    pruned_tokens: int = 0
    evicted_tool_payload_tokens: int = 0
    utilization_pct: float = 0.0


class ToolCallRecord(BaseModel):
    tool_name: str
    tool_args: Dict[str, Any] = Field(default_factory=dict)
    raw_output: Any = None
    distilled_output: Optional[str] = None
    raw_tokens: int = 0
    distilled_tokens: int = 0
    latency_ms: float = 0.0
    status: str = "OK"  # OK, ERROR, INTERCEPTED
    error_message: Optional[str] = None


class FailureAutopsy(BaseModel):
    failure_id: str
    step_number: int
    failure_type: str  # e.g., "PAYLOAD_BLOAT_OVERFLOW", "HALLUCINATED_TOOL_PARAM", "DRIFT_POISONING"
    severity: str = "HIGH"
    root_cause: str
    observed_impact: str
    intercept_mechanism: str
    remediation_applied: str
    tokens_saved: int = 0
    healed: bool = True
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StepRecord(BaseModel):
    step_id: str
    step_number: int
    step_type: str  # PLAN, TOOL_EXECUTION, CONTEXT_MAINTENANCE, REASONING_SYNTHESIS, FAILURE_RECOVERY
    title: str
    description: str
    status: StepStatus = StepStatus.SUCCESS
    latency_ms: float = 0.0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    step_cost_usd: float = 0.0
    cumulative_cost_usd: float = 0.0
    raw_prompt: Optional[str] = None
    raw_response: Optional[str] = None
    tool_calls: List[ToolCallRecord] = Field(default_factory=list)
    context_breakdown: ContextBreakdown = Field(default_factory=ContextBreakdown)
    autopsy: Optional[FailureAutopsy] = None
    living_memory_snapshot: Dict[str, Any] = Field(default_factory=dict)


class SessionTrace(BaseModel):
    session_id: str
    title: str
    scenario: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    model_name: str = "gemini-1.5-pro"
    pricing_model: str = "gemini-1.5-pro ($3.50/1M in, $10.50/1M out)"
    total_steps: int = 0
    total_tokens: int = 0
    total_prompt_tokens: int = 0
    total_completion_tokens: int = 0
    total_cost_usd: float = 0.0
    total_latency_ms: float = 0.0
    tokens_saved: int = 0
    cost_saved_usd: float = 0.0
    drift_score: float = 0.0  # 0.0 (perfect alignment) to 1.0 (severe drift)
    steps: List[StepRecord] = Field(default_factory=list)
    living_memory: Dict[str, Any] = Field(default_factory=dict)


class BenchmarkTurn(BaseModel):
    turn_number: int
    user_query: str
    agent_reply: str
    topic: str
    naive_tokens: int
    glassbox_tokens: int
    naive_cost_usd: float
    glassbox_cost_usd: float
    tokens_saved: int
    memory_entities_count: int
    active_context_summary: str
    evicted_items: List[str] = Field(default_factory=list)
    status: str = "OPTIMIZED"


class BenchmarkReport(BaseModel):
    benchmark_id: str
    title: str
    total_turns: int = 20
    naive_final_tokens: int
    glassbox_final_tokens: int
    naive_total_cost_usd: float
    glassbox_total_cost_usd: float
    total_tokens_saved: int
    total_cost_saved_usd: float
    percent_savings: float
    turns: List[BenchmarkTurn] = Field(default_factory=list)
    living_memory_final: Dict[str, Any] = Field(default_factory=dict)
