#!/bin/sh
if [ -n "$CALLE_TOKEN_B64" ]; then
  mkdir -p "$HOME/.calle-mcp/cli/4811f3e50259ff50339bb2feef40c0e9"
  echo "$CALLE_TOKEN_B64" | base64 -d > "$HOME/.calle-mcp/cli/4811f3e50259ff50339bb2feef40c0e9/token.json"
fi
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
