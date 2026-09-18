"""
Tool definitions and registry for the GlassBox Agent.
"""

from typing import Dict, Any, List, Optional
import json


class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Any] = {}
        self._register_default_tools()

    def register(self, name: str, description: str, parameters: Dict[str, Any], handler):
        self.tools[name] = {
            "name": name,
            "description": description,
            "parameters": parameters,
            "handler": handler,
        }

    def execute(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        if name not in self.tools:
            return {"error": f"Unknown tool: '{name}'", "status": "ERROR"}
        try:
            handler = self.tools[name]["handler"]
            return handler(args)
        except Exception as e:
            return {"error": str(e), "status": "ERROR"}

    def get_tool_specs(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": t["name"],
                "description": t["description"],
                "parameters": t["parameters"],
            }
            for t in self.tools.values()
        ]

    def _register_default_tools(self):
        # 1. Financial DB Query
        def handle_fin_query(args: Dict[str, Any]):
            ticker = args.get("ticker", "TECHNOVA").upper()
            year = args.get("year", 2024)
            db = {
                "TECHNOVA": {
                    2024: {"revenue": "$4.82B", "yoy_growth": "+28.4%", "ebitda_margin": "31.2%", "free_cash_flow": "$1.15B", "rd_expense": "$820M"},
                    2023: {"revenue": "$3.75B", "yoy_growth": "+22.1%", "ebitda_margin": "29.0%", "free_cash_flow": "$890M", "rd_expense": "$640M"},
                },
                "ACME": {
                    2024: {"revenue": "$12.1B", "yoy_growth": "+8.1%", "ebitda_margin": "18.5%", "free_cash_flow": "$1.80B", "rd_expense": "$1.10B"},
                }
            }
            res = db.get(ticker, {}).get(year, {"error": f"No data found for ticker {ticker} and year {year}"})
            return {"ticker": ticker, "year": year, "financials": res, "status": "OK"}

        self.register(
            name="financial_database_query",
            description="Query verified quarterly/annual corporate financial metrics (Revenue, EBITDA, FCF, R&D).",
            parameters={"ticker": "string (e.g. TECHNOVA, ACME)", "year": "integer (e.g. 2024)"},
            handler=handle_fin_query,
        )

        # 2. Web Search RAG
        def handle_web_search(args: Dict[str, Any]):
            query = args.get("query", "").lower()
            if "technova" in query or "acquisition" in query or "competitor" in query:
                return {
                    "source": "https://sec.gov/edgar/filings/technova/10-q.pdf",
                    "snippets": [
                        "TechNova announced definitive agreement to acquire CloudScale Labs for $420M in cash and stock.",
                        "CloudScale Labs expands TechNova's multi-cloud infrastructure offering, projected to add $85M in ARR within 12 months.",
                        "Regulatory review is ongoing; closing expected in Q1 2025."
                    ],
                    "status": "OK",
                }
            elif "market share" in query or "gartner" in query:
                return {
                    "source": "https://analyst-reports.com/cloud-ai-2024",
                    "snippets": [
                        "Global Enterprise Cloud AI market expanded by 34% YoY in 2024.",
                        "Top vendors by market share: Hyperscaler A (38%), Hyperscaler B (26%), TechNova (14%), Others (22%)."
                    ],
                    "status": "OK",
                }
            return {
                "source": "WebSearchEngine",
                "snippets": [f"Standard market search results for query: '{query}'."],
                "status": "OK",
            }

        self.register(
            name="web_search_rag",
            description="Perform semantic web research across regulatory SEC filings and analyst market reports.",
            parameters={"query": "string"},
            handler=handle_web_search,
        )

        # 3. Metric Calculator
        def handle_calculator(args: Dict[str, Any]):
            expression = args.get("expression", "")
            # Safe evaluation for math expressions
            allowed_chars = set("0123456789+-*/. ()")
            if not all(c in allowed_chars for c in expression):
                return {"error": "Invalid characters in mathematical expression", "status": "ERROR"}
            try:
                result = eval(expression, {"__builtins__": None}, {})
                return {"expression": expression, "result": result, "status": "OK"}
            except Exception as e:
                return {"error": f"Calculation error: {e}", "status": "ERROR"}

        self.register(
            name="metric_calculator",
            description="Perform precision arithmetic calculations (CAGR, percentages, multiples).",
            parameters={"expression": "string (e.g. '4.82 / 3.75 - 1')"},
            handler=handle_calculator,
        )

        # 4. Unreliable Legacy Tool (Demonstrates Failure Autopsy & Recovery)
        def handle_unreliable_legacy(args: Dict[str, Any]):
            mode = args.get("mode", "overflow")
            if mode == "overflow":
                # Returns an authentic 16,000+ char raw syslog dump with embedded telemetry JSON
                log_lines = [
                    f"2026-09-18T10:14:{i%60:02d}.{i*7%1000:03d}Z [KERNEL-DBG] [thread-{i%8}] packet_rx_ack id={10000+i} checksum=OK latency={12.4 + (i%5)*0.3:.1f}ms buffer_alloc={4096*i} status=PASS"
                    for i in range(180)
                ]
                embedded_metrics = {
                    "cluster_id": "prod-east-cluster-9",
                    "uptime_hours": 8760,
                    "transaction_success_rate": "99.98%",
                    "p99_latency_ms": 14.2,
                    "memory_leak_detected": False,
                    "critical_finding": "Legacy auth gateway patched; zero memory leaks detected in production rollout",
                    "active_connections": 14205,
                    "audit_signature": "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
                }
                raw_payload = (
                    "=== BEGIN RAW SYSTEM DIAGNOSTIC DUMP ===\n"
                    + "\n".join(log_lines)
                    + "\n=== EMBEDDED SUBSYSTEM METRICS TELEMETRY ===\n"
                    + json.dumps(embedded_metrics, indent=2)
                    + "\n=== END RAW SYSTEM DIAGNOSTIC DUMP ==="
                )
                return {
                    "payload": raw_payload,
                    "warning": "MASSIVE_RAW_UNPARSED_PAYLOAD",
                    "size_chars": len(raw_payload),
                    "raw_tokens_approx": len(raw_payload) // 4,
                    "status": "UNFILTERED_RAW",
                }
            elif mode == "compact":
                return {
                    "cluster_id": "prod-east-cluster-9",
                    "transaction_success_rate": "99.98%",
                    "p99_latency_ms": 14.2,
                    "critical_finding": "Legacy auth gateway patched; zero memory leaks detected",
                    "status": "VERIFIED_COMPACT"
                }
            else:
                raise ValueError(
                    f"INVALID_PARAMETER: Parameter 'mode' received unexpected value '{mode}'. "
                    f"Permitted schema options are: ['compact', 'overflow']."
                )

        self.register(
            name="unreliable_legacy_system",
            description="Legacy enterprise subsystem tool that may produce context-exploding dumps or parameter errors.",
            parameters={"mode": "string ('overflow' or 'compact')"},
            handler=handle_unreliable_legacy,
        )



# Global tool registry
global_tools = ToolRegistry()
