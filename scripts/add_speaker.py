"""Append a speaker record (JSON on stdin) to site/data/speakers.json."""

import json
import os
import re
import sys

PATH = os.path.join(os.path.dirname(__file__), "..", "site", "data", "speakers.json")
PALETTE = ["#4285f4", "#ea4335", "#fbbc04", "#34a853"]

new = json.load(sys.stdin)
with open(PATH, encoding="utf-8") as handle:
    speakers = json.load(handle)

new.setdefault("id", re.sub(r"[^a-z]+", "-", new["name"].split()[0].lower()).strip("-"))
new.setdefault("color", PALETTE[len(speakers) % len(PALETTE)])
if any(s["id"] == new["id"] for s in speakers):
    sys.exit(f"speaker id {new['id']!r} already exists")

speakers.append(new)
with open(PATH, "w", encoding="utf-8") as handle:
    json.dump(speakers, handle, indent=2, ensure_ascii=False)
    handle.write("\n")
print(f"added {new['name']} ({new['id']})")
