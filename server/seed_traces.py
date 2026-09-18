"""
Pre-seeds demo traces so that GlassBox immediately has rich historical runs ready for judges.
"""

from engine.scenarios import global_scenarios

def seed():
    print("Seeding clean run trace...")
    global_scenarios.run_clean_scenario("demo_clean_run")
    print("Seeding failure autopsy trace...")
    global_scenarios.run_failure_scenario("demo_failure_autopsy")
    print("Seeding 20-turn benchmark...")
    global_scenarios.run_20_turn_benchmark("benchmark_20_turns")
    print("Seeding complete! All traces persisted in server/traces/")

if __name__ == "__main__":
    seed()
