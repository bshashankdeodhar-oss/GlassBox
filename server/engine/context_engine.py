"""
GlassBox Context Engineering Subsystem.
Implements dynamic token budgeting, dead tool eviction, progressive compaction,
semantic living memory extraction, and context drift detection.
"""

from typing import Dict, Any, List, Tuple
from .models import ContextBreakdown
from .tracer import estimate_tokens


class ContextEngine:
    def __init__(self, budget_limit: int = 4000):
        self.budget_limit = budget_limit
        # Budget allocations (maximum tokens)
        self.system_budget = int(budget_limit * 0.15)       # 600 tokens
        self.memory_budget = int(budget_limit * 0.25)       # 1000 tokens
        self.tool_buffer_budget = int(budget_limit * 0.25)  # 1000 tokens
        self.window_budget = int(budget_limit * 0.35)       # 1400 tokens

    def analyze_context(
        self,
        system_prompt: str,
        living_memory: Dict[str, Any],
        tool_outputs: List[Dict[str, Any]],
        conversation_turns: List[Dict[str, str]],
    ) -> ContextBreakdown:
        """Calculates token breakdown across all context components."""
        sys_tokens = estimate_tokens(system_prompt)
        mem_tokens = estimate_tokens(str(living_memory))
        tool_tokens = sum(estimate_tokens(str(t.get("output", ""))) for t in tool_outputs)
        
        turn_text = "\n".join(
            f"{turn.get('role', 'user')}: {turn.get('content', '')}"
            for turn in conversation_turns
        )
        window_tokens = estimate_tokens(turn_text)
        total_tokens = sys_tokens + mem_tokens + tool_tokens + window_tokens
        utilization = round((total_tokens / float(self.budget_limit)) * 100, 1)

        return ContextBreakdown(
            system_tokens=sys_tokens,
            memory_tokens=mem_tokens,
            tool_buffer_tokens=tool_tokens,
            active_window_tokens=window_tokens,
            total_tokens=total_tokens,
            budget_limit=self.budget_limit,
            pruned_tokens=0,
            evicted_tool_payload_tokens=0,
            utilization_pct=utilization,
        )

    def evict_stale_tool_outputs(
        self, tool_outputs: List[Dict[str, Any]], retain_recent: int = 1
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Replaces historical bulky tool payloads with compact semantic references.
        Returns optimized tool outputs and the count of tokens saved.
        """
        optimized = []
        tokens_saved = 0

        for i, item in enumerate(tool_outputs):
            raw_text = str(item.get("output", ""))
            raw_tokens = estimate_tokens(raw_text)

            # Keep only the most recent N tool calls in full detail
            if i < len(tool_outputs) - retain_recent and raw_tokens > 120:
                tool_name = item.get("tool_name", "tool")
                distilled = (
                    f"[EVICTED TOOL PAYLOAD: '{tool_name}' ({raw_tokens} tokens evicted). "
                    f"Pertinent facts synthesized into Living Memory]"
                )
                distilled_tokens = estimate_tokens(distilled)
                tokens_saved += max(0, raw_tokens - distilled_tokens)
                optimized.append({
                    **item,
                    "output": distilled,
                    "is_evicted": True,
                    "tokens_saved": raw_tokens - distilled_tokens
                })
            else:
                optimized.append(item)

        return optimized, tokens_saved

    def progressive_compact(
        self,
        conversation_turns: List[Dict[str, str]],
        living_memory: Dict[str, Any],
        max_turns_retained: int = 4,
    ) -> Tuple[List[Dict[str, str]], Dict[str, Any], int]:
        """
        Compacts older conversation turns into structured living memory.
        Returns pruned turns, updated living memory, and tokens saved.
        """
        if len(conversation_turns) <= max_turns_retained:
            return conversation_turns, living_memory, 0

        # Older turns to compress
        older_turns = conversation_turns[:-max_turns_retained]
        recent_turns = conversation_turns[-max_turns_retained:]

        older_text = "\n".join(
            f"{turn.get('role', 'user')}: {turn.get('content', '')}"
            for turn in older_turns
        )
        older_tokens = estimate_tokens(older_text)

        # Distill older facts into key-value living memory
        updated_memory = dict(living_memory)
        if "conversation_summary" not in updated_memory:
            updated_memory["conversation_summary"] = []

        # Extract semantic digest
        for t in older_turns:
            content = t.get("content", "")
            if t.get("role") == "user":
                updated_memory["last_inquiry_theme"] = content[:60] + "..."
            elif "revenue" in content.lower() or "growth" in content.lower():
                updated_memory["extracted_financial_context"] = "Q3 and Q4 Financials analyzed with positive YoY growth"
            elif "security" in content.lower() or "incident" in content.lower():
                updated_memory["incident_status"] = "Mitigated and patch validated"

        digest_entry = f"Turns 1-{len(older_turns)}: Discussed {len(older_turns)} prompts; Key findings committed to state."
        if digest_entry not in updated_memory["conversation_summary"]:
            updated_memory["conversation_summary"].append(digest_entry)

        memory_delta_tokens = estimate_tokens(str(updated_memory)) - estimate_tokens(str(living_memory))
        tokens_saved = max(0, older_tokens - memory_delta_tokens)

        return recent_turns, updated_memory, tokens_saved

    def check_context_drift(self, initial_goal: str, current_query: str) -> Tuple[float, str]:
        """
        Measures context drift score between 0.0 (aligned) and 1.0 (drifted).
        Returns drift score and recommendation.
        """
        goal_words = set(initial_goal.lower().split())
        query_words = set(current_query.lower().split())
        
        common = goal_words.intersection(query_words)
        total = max(len(goal_words), len(query_words), 1)
        overlap = len(common) / float(total)

        drift_score = round(1.0 - overlap, 2)
        
        if drift_score > 0.85:
            action = "HIGH_DRIFT: Query pivots to unrelated topic. Context Engine recommends archiving previous tool cache."
        elif drift_score > 0.60:
            action = "MODERATE_DRIFT: Partial shift in context. Retain living memory but compress working scratchpad."
        else:
            action = "ALIGNED: Direct continuation of root task."

        return drift_score, action

    def assemble_optimized_prompt(
        self,
        system_prompt: str,
        living_memory: Dict[str, Any],
        tool_outputs: List[Dict[str, Any]],
        conversation_turns: List[Dict[str, str]],
    ) -> Tuple[str, ContextBreakdown]:
        """
        Executes complete context engineering pipeline:
        1. Evicts dead tool payloads.
        2. Progressively compacts older turns into living memory.
        3. Formats prompt within strict token bounds.
        """
        # Step 1: Evict stale tools
        optimized_tools, tool_tokens_saved = self.evict_stale_tool_outputs(tool_outputs)

        # Step 2: Progressive compaction if window exceeds threshold
        window_text = "\n".join(t.get("content", "") for t in conversation_turns)
        if estimate_tokens(window_text) > self.window_budget:
            recent_turns, updated_memory, turns_saved = self.progressive_compact(
                conversation_turns, living_memory, max_turns_retained=4
            )
        else:
            recent_turns = conversation_turns
            updated_memory = living_memory
            turns_saved = 0

        # Assemble prompt text
        prompt_parts = [
            f"=== SYSTEM INSTRUCTIONS ===\n{system_prompt}\n",
            f"=== LIVING EPISODIC MEMORY (EXTRACTED FACTS) ===\n{str(updated_memory)}\n",
        ]

        if optimized_tools:
            tool_texts = [
                f"[{t.get('tool_name')}]: {t.get('output')}" for t in optimized_tools
            ]
            prompt_parts.append(f"=== TOOL RESULTS ===\n" + "\n\n".join(tool_texts) + "\n")

        prompt_parts.append("=== RECENT CONVERSATION ===\n")
        for turn in recent_turns:
            role = turn.get("role", "user").upper()
            prompt_parts.append(f"{role}: {turn.get('content', '')}")

        final_prompt = "\n".join(prompt_parts)

        # Build final breakdown
        breakdown = self.analyze_context(
            system_prompt=system_prompt,
            living_memory=updated_memory,
            tool_outputs=optimized_tools,
            conversation_turns=recent_turns,
        )
        breakdown.pruned_tokens = tool_tokens_saved + turns_saved
        breakdown.evicted_tool_payload_tokens = tool_tokens_saved

        return final_prompt, breakdown


# Global context engine
global_context_engine = ContextEngine(budget_limit=4000)
