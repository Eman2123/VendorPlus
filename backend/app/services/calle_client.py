"""
calle_client.py — thin wrapper around the CALL-E CLI.

CALL-E has no Python SDK — it's an MCP server accessed via the `calle` CLI
(npm package @call-e/cli), authenticated once via `calle auth login`.
This wrapper shells out to that CLI as subprocesses, using --json for
machine-readable output.
"""

import json
import subprocess
import time
from typing import Optional


CALLE_TIMEOUT_SECONDS = 15
POLL_INTERVAL_SECONDS = 10
MAX_POLL_ATTEMPTS = 18  # ~3 minutes max wait


def _run_calle_command(args: list[str]) -> dict:
    """Run a `calle` CLI command with --json and return the parsed JSON output."""
    import shutil
    calle_path = shutil.which("calle") or "calle"

    result = subprocess.run(
        [calle_path] + args + ["--json"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=180,
        shell=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"calle CLI failed: {result.stderr or result.stdout}")

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        raise RuntimeError(f"calle CLI returned non-JSON output: {result.stdout}")


def build_goal_prompt(vendor_name: str, order_id: str, deadline: str) -> str:
    """
    Builds the Day 3 adaptive check-in goal prompt, filled with real vendor/order data.
    Covers all 4 branches: hesitation, explicit delay, new/high-risk vendor, language switch.
    """
    return (
        f"You are calling {vendor_name} to check in on order {order_id}, "
        f"which is due on {deadline}. Start by asking: Hi, this is a check-in call about "
        f"order {order_id} — is it still on track to be delivered by {deadline}? "
        f"Then adapt: if they seem hesitant or vague, gently probe for the real reason. "
        f"If there's an explicit delay, ask how many days late and whether it's fixable, "
        f"and note that this should be escalated to a human for follow-up "
        f"(do not attempt to transfer the call). If this is a new or high-risk vendor, "
        f"verify contact info and ask about past issues. IMPORTANT: If the user responds "
        f"in Urdu or any language other than English at any point, you MUST immediately "
        f"switch to replying in that same language for the rest of the call, even "
        f"mid-sentence. End the call politely once you have a clear answer, and "
        f"summarize what you learned."
    )


def place_call(vendor_phone: str, vendor_name: str, order_id: str, deadline: str) -> dict:
    """
    Places a real outbound check-in call via CALL-E CLI and blocks until it completes.
    Returns the raw final call result dict (status, transcript, call_id, etc.)
    for result_extractor.py to parse.
    """
    goal = build_goal_prompt(vendor_name, order_id, deadline)

    plan_result = _run_calle_command([
        "call", "plan",
        "--to-phone", vendor_phone,
        "--goal", goal,
    ])

    plan_text = json.loads(plan_result["result"]["content"][0]["text"])
    if not plan_text.get("ready_to_run"):
        raise RuntimeError(f"CALL-E plan not ready to run: {plan_text.get('clarifying_questions')}")

    plan_id = plan_text["plan_id"]
    confirm_token = plan_text["confirm_token"]

    run_result = _run_calle_command([
        "call", "run",
        "--plan-id", plan_id,
        "--confirm-token", confirm_token,
    ])

    run_id = run_result["run_id"]

    # Poll until the call reaches a terminal status
    final_status: Optional[dict] = None
    for _ in range(MAX_POLL_ATTEMPTS):
        status_result = _run_calle_command([
            "call", "status",
            "--run-id", run_id,
        ])
        status_text = json.loads(status_result["result"]["content"][0]["text"])
        if status_text.get("status") in ("COMPLETED", "FAILED"):
            final_status = status_text
            break
        time.sleep(POLL_INTERVAL_SECONDS)

    if final_status is None:
        raise RuntimeError(f"CALL-E call {run_id} did not complete within polling window")

    return final_status