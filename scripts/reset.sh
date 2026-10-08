#!/usr/bin/env bash
# Back to a clean start between rehearsals (or if the demo goes sideways).
set -e
cd "$(dirname "$0")/.."
git reset --hard demo-start
git clean -fdq
echo "Reset to demo-start. The browser will reload by itself."
