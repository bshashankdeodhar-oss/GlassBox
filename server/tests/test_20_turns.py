"""
Benchmark test for the 20-Turn Messy Conversation resilience (Hackathon Rule 3).
"""

from engine.scenarios import ScenarioManager


def test_20_turn_benchmark_execution():
    manager = ScenarioManager()
    report = manager.run_20_turn_benchmark("test_bench_20")

    assert report.total_turns == 20
    assert len(report.turns) == 20
    
    # Verify that Naive token count accumulates heavily
    assert report.naive_final_tokens > report.glassbox_final_tokens
    
    # Verify significant token and cost savings (>50%)
    assert report.percent_savings > 50.0
    assert report.total_cost_saved_usd > 0.0

    # Verify that the GlassBox token count stayed bounded and never blew out
    for turn in report.turns:
        assert turn.glassbox_tokens <= 2500, f"Turn {turn.turn_number} exceeded bound: {turn.glassbox_tokens}"
