#!/usr/bin/env bash
# Append a speaker record (JSON on stdin) to site/data/speakers.json.
# Used on the "typed output" slide:
#   agy -p "..." --output-format json --json-schema demo/speaker.schema.json \
#     | jq '.structured_output' | ./scripts/add-speaker.sh
exec python3 "$(dirname "$0")/add_speaker.py"
