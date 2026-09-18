export type StepStatus = 'SUCCESS' | 'WARNING' | 'FAILED' | 'HEALED';

export interface ContextBreakdown {
  system_tokens: number;
  memory_tokens: number;
  tool_buffer_tokens: number;
  active_window_tokens: number;
  total_tokens: number;
  budget_limit: number;
  pruned_tokens: number;
  evicted_tool_payload_tokens: number;
  utilization_pct: number;
}

export interface ToolCallRecord {
  tool_name: string;
  tool_args: Record<string, any>;
  raw_output: any;
  distilled_output?: string;
  raw_tokens: number;
  distilled_tokens: number;
  latency_ms: number;
  status: string;
  error_message?: string;
}

export interface FailureAutopsy {
  failure_id: string;
  step_number: number;
  failure_type: string;
  severity: string;
  root_cause: string;
  observed_impact: string;
  intercept_mechanism: string;
  remediation_applied: string;
  tokens_saved: number;
  healed: boolean;
  timestamp: string;
}

export interface StepRecord {
  step_id: string;
  step_number: number;
  step_type: string;
  title: string;
  description: string;
  status: StepStatus;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  step_cost_usd: number;
  cumulative_cost_usd: number;
  raw_prompt?: string;
  raw_response?: string;
  tool_calls: ToolCallRecord[];
  context_breakdown: ContextBreakdown;
  autopsy?: FailureAutopsy;
  living_memory_snapshot: Record<string, any>;
}

export interface SessionTrace {
  session_id: string;
  title: string;
  scenario: string;
  created_at: string;
  model_name: string;
  pricing_model: string;
  total_steps: number;
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost_usd: number;
  total_latency_ms: number;
  tokens_saved: number;
  cost_saved_usd: number;
  drift_score: number;
  steps: StepRecord[];
  living_memory: Record<string, any>;
}

export interface BenchmarkTurn {
  turn_number: number;
  user_query: string;
  agent_reply: string;
  topic: string;
  naive_tokens: number;
  glassbox_tokens: number;
  naive_cost_usd: number;
  glassbox_cost_usd: number;
  tokens_saved: number;
  memory_entities_count: number;
  active_context_summary: string;
  evicted_items: string[];
  status: string;
}

export interface BenchmarkReport {
  benchmark_id: string;
  title: string;
  total_turns: number;
  naive_final_tokens: number;
  glassbox_final_tokens: number;
  naive_total_cost_usd: number;
  glassbox_total_cost_usd: number;
  total_tokens_saved: number;
  total_cost_saved_usd: number;
  percent_savings: number;
  turns: BenchmarkTurn[];
  living_memory_final: Record<string, any>;
}
