#!/usr/bin/env bash
# Run before the talk. Every line should say OK.
cd "$(dirname "$0")/.." || exit 1
ok()  { printf '  \033[32mOK\033[0m    %s\n' "$1"; }
bad() { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; FAILED=1; }
echo "workshop preflight"
command -v agy >/dev/null     && ok "agy installed ($(agy --version 2>/dev/null | head -n1))" || bad "agy not found (see the install slide)"
command -v python3 >/dev/null && ok "python3 $(python3 --version | cut -d' ' -f2)" || bad "python3 missing"
command -v jq >/dev/null      && ok "jq installed (used in the headless demos)" || bad "jq missing (brew install jq)"
git rev-parse demo-start >/dev/null 2>&1 && ok "tag demo-start exists" || bad "tag demo-start missing"
[ -z "$(git status --porcelain)" ] && ok "working tree clean" || bad "working tree dirty. Run ./scripts/reset.sh"
python3 -m unittest discover -s tests >/dev/null 2>&1 && ok "tests/ pass" || bad "tests/ should pass at demo-start"
python3 -m unittest discover -s bugs >/dev/null 2>&1 && bad "bugs/ should FAIL at demo-start (that is the demo)" || ok "bugs/ fail on purpose (the schedule clash)"
[ -f .agents/skills/explain-flow.md ] && ok "explain-flow skill present" || bad "explain-flow skill missing"
[ -f demo/standup.md ] && [ ! -f .agents/skills/standup.md ] && ok "standup skill ready, not yet installed" || bad "standup skill state is wrong"
(echo > /dev/tcp/127.0.0.1/8000) >/dev/null 2>&1 && bad "port 8000 is busy, stop whatever is using it" || ok "port 8000 is free"
[ -n "$FAILED" ] && { echo; echo "Fix the FAIL lines above."; exit 1; }
echo; echo "All good. Three windows: agy (terminal), browser on http://localhost:8000, and optionally make follow."
