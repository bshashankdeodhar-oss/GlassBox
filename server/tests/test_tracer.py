"""
Unit tests for GlassBox Tracer.
"""

import os
import shutil
import tempfile
import pytest
from engine.tracer import Tracer, estimate_tokens
from engine.models import StepStatus


@pytest.fixture
def temp_tracer():
    tmp_dir = tempfile.mkdtemp()
    tracer = Tracer(trace_dir=tmp_dir)
    yield tracer
    shutil.rmtree(tmp_dir, ignore_errors=True)


def test_estimate_tokens():
    text = "Hello world! This is a test of the GlassBox token estimation engine."
    tokens = estimate_tokens(text)
    assert tokens > 0
    assert tokens < len(text)


def test_tracer_session_and_steps(temp_tracer):
    session = temp_tracer.start_session("sess_test_1", "Test Session")
    assert session.session_id == "sess_test_1"
    assert session.total_steps == 0
    assert session.total_cost_usd == 0.0

    step = temp_tracer.record_step(
        session_id="sess_test_1",
        step_type="PLAN",
        title="Step 1: Test Plan",
        description="Testing step recording",
        status=StepStatus.SUCCESS,
        raw_prompt="Analyze quarterly financials",
        raw_response="Executing financial plan...",
        latency_ms=150.0,
    )

    assert step.step_number == 1
    assert step.prompt_tokens > 0
    assert step.step_cost_usd >= 0.0

    # Retrieve trace
    fetched = temp_tracer.get_trace("sess_test_1")
    assert fetched is not None
    assert fetched.total_steps == 1
    assert len(fetched.steps) == 1


def test_tracer_failure_autopsy(temp_tracer):
    session = temp_tracer.start_session("sess_autopsy_1", "Autopsy Test")
    autopsy = temp_tracer.create_failure_autopsy(
        failure_id="AUTOPSY_001",
        step_number=2,
        failure_type="CONTEXT_PAYLOAD_BLOAT_OVERFLOW",
        root_cause="Legacy tool returned 15k unparsed tokens.",
        observed_impact="Budget overflow warning.",
        intercept_mechanism="Token Budget Sentinel intercepted payload.",
        remediation_applied="Distilled down to 50 tokens.",
        tokens_saved=3800,
    )

    temp_tracer.record_step(
        session_id="sess_autopsy_1",
        step_type="FAILURE_RECOVERY",
        title="Recovered Step",
        description="Recovered from bloat",
        status=StepStatus.HEALED,
        autopsy=autopsy,
    )

    fetched = temp_tracer.get_trace("sess_autopsy_1")
    assert fetched.steps[0].autopsy is not None
    assert fetched.steps[0].autopsy.healed is True
    assert fetched.steps[0].autopsy.failure_type == "CONTEXT_PAYLOAD_BLOAT_OVERFLOW"
