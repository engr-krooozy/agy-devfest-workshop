#!/usr/bin/env bash
# Serve the demo site locally so no demo depends on conference wifi.
# Then: python -m pagetext.fetch http://localhost:8000/index.html
cd "$(dirname "$0")/../demo/site" || exit 1
echo "Serving demo/site on http://localhost:8000  (Ctrl+C to stop)"
exec python3 -m http.server 8000
