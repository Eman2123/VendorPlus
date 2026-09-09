# Technical Notes: CALL-E Runtime Invocation

## Overview
CALL-E is not a traditional REST API or Python SDK — it is an MCP (Model Context
Protocol) server accessed via the official `@call-e/cli` npm package. The backend
invokes this CLI as a subprocess from Python (`app/services/calle_client.py`),
parsing its `--json` output.

## Authentication
Authentication is a one-time, machine-level step: `calle auth login` opens a
browser-based OAuth flow and caches a long-lived token locally
(`~/.calle-mcp/cli/.../token.json`). This is not re-run per request — the CLI
reuses the cached token automatically. Token validity was confirmed through 2029.

## Call Flow
Each check-in call goes through three CLI commands, called in sequence:

1. **`calle call plan --to-phone <phone> --goal <text> --json`**
   Submits the call intent (a natural-language goal prompt, not a rigid script)
   and returns a `plan_id` + `confirm_token`. No call is placed at this stage.

2. **`calle call run --plan-id <id> --confirm-token <token> --json`**
   Confirms and actually places the outbound call. Returns a `run_id`
   immediately; the call itself proceeds asynchronously on CALL-E's side.

3. **`calle call status --run-id <id> --json`**
   Polled every 10 seconds by the backend until status reaches `COMPLETED`
   or `FAILED` (capped at ~3 minutes). Returns the full transcript, call
   duration, and outcome once finished.

## Goal Prompt Design
Rather than a fixed script or state machine, CALL-E's bot is steered by a single
natural-language "goal" describing the check-in purpose and how to adapt to four
scenarios: hesitant/vague answers, explicit delays, new/high-risk vendors, and
non-English responses (with an explicit instruction to switch language
immediately once detected). This goal is built per-call in
`calle_client.build_goal_prompt()`, filled with real vendor/order data.

## Windows-Specific Fixes
Two Windows-only issues were found and fixed during integration:
- **Subprocess PATH resolution**: `subprocess.run(["calle", ...])` failed with
  `WinError 2` because npm's global install creates a `.cmd` wrapper Windows
  doesn't resolve directly. Fixed with `shutil.which("calle")` plus `shell=True`.
- **Output encoding**: CALL-E transcripts can contain Urdu/Arabic script (from
  the language-switch branch), which crashed with `UnicodeDecodeError` under
  Windows' default `cp1252` terminal encoding. Fixed by forcing
  `encoding="utf-8", errors="replace"` on the subprocess call.

## Known Limitations
- CALL-E's account used for this project does not support live call transfer,
  so the "escalate to human" branch only *notes* the need for follow-up rather
  than transferring the call.
- CALL-E introduced regional calling restrictions mid-project; some phone
  numbers began failing silently. CALL-E's official US testing hotline
  (+1 276-322-9632) was used for testing from that point onward.
- The retry sequence (up to 3 attempts) runs synchronously within a single
  `POST /call` request, meaning the HTTP response is held open until all
  attempts finish (or one succeeds). This is acceptable for hackathon MVP
  scope but would need to move to a background job for production use.