"""
Unit tests for GlassBox Context Engine.
"""

from engine.context_engine import ContextEngine


def test_context_engine_budgeting():
    engine = ContextEngine(budget_limit=4000)
    system_prompt = "You are an AI research assistant with high fidelity."
    memory = {"target": "TechNova", "year": 2024}
    tools = [{"tool_name": "db", "output": "Revenue: $4.82B"}]
    turns = [{"role": "user", "content": "What is the revenue?"}]

    breakdown = engine.analyze_context(system_prompt, memory, tools, turns)
    assert breakdown.system_tokens > 0
    assert breakdown.memory_tokens > 0
    assert breakdown.total_tokens < 4000
    assert breakdown.utilization_pct > 0.0


def test_stale_tool_eviction():
    engine = ContextEngine(budget_limit=4000)
    bulky_output = "LOG_LINE_ITEM_" * 100  # ~300 tokens
    tools = [
        {"tool_name": "db_query_step1", "output": bulky_output},
        {"tool_name": "db_query_step2", "output": "Recent output - keep full detail"},
    ]

    optimized, tokens_saved = engine.evict_stale_tool_outputs(tools, retain_recent=1)
    assert tokens_saved > 0
    assert len(optimized) == 2
    assert "EVICTED TOOL PAYLOAD" in str(optimized[0]["output"])
    assert "Recent output" in str(optimized[1]["output"])


def test_progressive_compaction():
    engine = ContextEngine(budget_limit=4000)
    turns = [
        {"role": "user", "content": f"Turn query #{i}: In-depth analysis of corporate revenue, EBITDA, free cash flow and acquisitions."}
        for i in range(10)
    ]
    memory = {"existing": "facts"}

    recent, updated_memory, saved = engine.progressive_compact(
        turns, memory, max_turns_retained=3
    )

    assert len(recent) == 3
    assert saved > 0
    assert "conversation_summary" in updated_memory


def test_context_drift_detection():
    engine = ContextEngine(budget_limit=4000)
    goal = "Investigate TechNova financial metrics and earnings"
    aligned_query = "What were TechNova earnings for the fourth quarter?"
    drifted_query = "Can you write a poem about tropical pineapples on Mars?"

    score_aligned, action_aligned = engine.check_context_drift(goal, aligned_query)
    score_drifted, action_drifted = engine.check_context_drift(goal, drifted_query)

    assert score_aligned < score_drifted
    assert "HIGH_DRIFT" in action_drifted
