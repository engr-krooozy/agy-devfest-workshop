"""Extended unit and integration tests for the comprehensive DevFest platform."""

import json
import os
import unittest

ROOT = os.path.join(os.path.dirname(__file__), "..")
SITE = os.path.join(ROOT, "site")
DATA = os.path.join(SITE, "data")


def load_json(name):
    with open(os.path.join(DATA, f"{name}.json"), encoding="utf-8") as handle:
        return json.load(handle)


def read_text(path):
    with open(path, encoding="utf-8") as handle:
        return handle.read()


class ExtendedConferenceTests(unittest.TestCase):
    def test_minimum_speakers_and_rich_metadata(self):
        speakers = load_json("speakers")
        self.assertGreaterEqual(len(speakers), 8, "Expected at least 8 speakers")
        for sp in speakers:
            for key in ("id", "name", "role", "company", "topic", "color", "bio", "social"):
                self.assertIn(key, sp, f"Speaker {sp.get('id')} missing {key}")

    def test_multi_day_multi_track_schedule_volume(self):
        schedule = load_json("schedule")
        by_day = {}
        for s in schedule:
            by_day.setdefault(s["day"], []).append(s)
        self.assertGreaterEqual(len(by_day), 2, "Expected at least 2 conference days")
        for day, sessions in by_day.items():
            self.assertGreaterEqual(len(sessions), 6, f"Day {day} must have at least 6 sessions")

    def test_no_hardcoded_your_city_strings(self):
        for rel in ("site/index.html", "site/app.js", "serve.py"):
            content = read_text(os.path.join(ROOT, rel))
            self.assertNotIn("Your City", content, f"Hardcoded 'Your City' found in {rel}")

    def test_comprehensive_sections_and_accessible_modal_in_html(self):
        html = read_text(os.path.join(SITE, "index.html"))
        required_ids = (
            "speaker-grid",
            "timeline",
            "countdown",
            "footer",
            "theme-toggle",
            "stats",
            "tracks",
            "venue",
            "tickets",
            "registration",
            "rsvp-form",
            "attendee-badge",
            "sponsors",
            "faq",
            "coc",
            "modal-container",
        )
        for element_id in required_ids:
            self.assertIn(f'id="{element_id}"', html, f"Missing #{element_id} in index.html")
        self.assertIn('role="dialog"', html)
        self.assertIn('aria-modal="true"', html)

    def test_ics_calendar_and_agenda_features_in_app_js(self):
        js = read_text(os.path.join(SITE, "app.js"))
        for token in (
            "BEGIN:VCALENDAR",
            "BEGIN:VEVENT",
            "END:VCALENDAR",
            "localStorage",
            "findPersonalClashes",
            "Escape",
        ):
            self.assertIn(token, js, f"Expected {token!r} in site/app.js")


if __name__ == "__main__":
    unittest.main()
