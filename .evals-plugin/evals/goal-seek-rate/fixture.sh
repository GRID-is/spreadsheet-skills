#!/usr/bin/env bash
# Runs in the empty workspace before the agent starts (claude plugin eval --scaffold).
# Installs the engine so the agent can import it without network access from
# inside the sandbox. ^17.1.0 is replaced by scripts/run-evals.mjs with
# the version range this repo's package.json pins.
set -euo pipefail
npm init -y >/dev/null
npm install --no-audit --no-fund --silent "@grid-is/spreadsheet-engine@^17.1.0"
