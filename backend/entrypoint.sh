#!/bin/bash
set -e

# Recreate the CALL-E auth token from the environment variable at container startup
if [ -n "$CALLE_TOKEN_JSON" ]; then
    mkdir -p /root/.calle-mcp/cli/4811f3e50259ff50339bb2feef40c0e9
    echo "$CALLE_TOKEN_JSON" > /root/.calle-mcp/cli/4811f3e50259ff50339bb2feef40c0e9/token.json
    echo "CALL-E token restored from environment variable"
else
    echo "WARNING: CALLE_TOKEN_JSON not set — CALL-E calls will fail"
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
