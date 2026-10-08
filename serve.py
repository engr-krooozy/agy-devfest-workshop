#!/usr/bin/env python3
"""Tiny dev server with live reload for the workshop site.

    python3 serve.py [port]        then open http://localhost:8000

The page polls /__version and reloads itself when any file under site/ changes,
so you see the agent's edits appear in the browser the moment they are saved.
"""

import http.server
import json
import os
import socketserver
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")


def event_title():
    with open(os.path.join(ROOT, "data", "event.json"), encoding="utf-8") as handle:
        event = json.load(handle)
    return f"{event['name']} {event['city']} {event['year']}"


def latest_mtime():
    newest = 0.0
    for folder, _dirs, files in os.walk(ROOT):
        for name in files:
            newest = max(newest, os.path.getmtime(os.path.join(folder, name)))
    return str(newest)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if self.path.split("?")[0] == "/__version":
            body = latest_mtime().encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # keep the terminal quiet


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("", port), Handler) as server:
        print(f"{event_title()} dev server")
        print(f"  open  http://localhost:{port}")
        print("  edit any file under site/ and the page reloads itself. Ctrl+C to stop.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print()


if __name__ == "__main__":
    main()
