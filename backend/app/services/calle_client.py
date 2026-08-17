"""
calle_client.py — thin wrapper around the CALL-E SDK.
Target: Day 2 ('hello world' test call), Day 3 (adaptive script + branches).

Keep all CALL-E SDK invocation isolated here so the rest of the backend
(risk engine, routers) never talks to the SDK directly — makes the Day 9
"technical notes on how CALL-E is invoked at runtime" easy to write.
"""

# TODO (Day 1): pip install the CALL-E SDK, set API key via env var CALLE_API_KEY
# TODO (Day 2): implement place_call() with the base check-in script
# TODO (Day 3): add branch logic — hesitation, explicit delay, new/high-risk
#               vendor, language mismatch (auto-switch mid-call)
# TODO (Day 7): retry manager — up to 3 attempts, spaced out, log every
#               attempt's status (no_answer / busy / voicemail / picked_up)


def place_call(vendor_phone: str, vendor_language: str, order_context: dict) -> dict:
    """Place an outbound check-in call. Returns raw CALL-E call result
    (to be parsed by result_extractor.py)."""
    raise NotImplementedError("Integrate CALL-E SDK here")


def parse_transcript(raw_call_result: dict) -> dict:
    """result_extractor.py logic — turn the raw CALL-E transcript into the
    structured JSON described in docs/apicontract.md (Result Schema)."""
    raise NotImplementedError("Implement result_extractor.py logic here")
