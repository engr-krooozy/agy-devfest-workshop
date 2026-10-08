"""Guards for the data files the page renders. These must always pass."""

import json
import os
import re
import unittest

DATA = os.path.join(os.path.dirname(__file__), "..", "site", "data")
TIME = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def load(name):
    with open(os.path.join(DATA, f"{name}.json"), encoding="utf-8") as handle:
        return json.load(handle)


class EventTests(unittest.TestCase):
    def test_required_fields(self):
        event = load("event")
        for key in ("name", "city", "year", "date", "venue", "tagline", "accent"):
            self.assertIn(key, event, f"event.json is missing {key!r}")

    def test_date_and_accent_formats(self):
        event = load("event")
        self.assertRegex(event["date"], r"^\d{4}-\d{2}-\d{2}$")
        self.assertRegex(event["accent"], r"^#[0-9a-fA-F]{6}$")


class SpeakerTests(unittest.TestCase):
    def test_required_fields_and_unique_ids(self):
        speakers = load("speakers")
        ids = [s["id"] for s in speakers]
        self.assertEqual(len(ids), len(set(ids)), "speaker ids must be unique")
        for speaker in speakers:
            for key in ("id", "name", "role", "topic", "color"):
                self.assertIn(key, speaker, f"speaker {speaker.get('id')} is missing {key!r}")


class ScheduleTests(unittest.TestCase):
    def test_times_are_valid_and_ordered(self):
        for session in load("schedule"):
            self.assertRegex(session["time"], TIME)
            self.assertRegex(session["end"], TIME)
            self.assertLess(session["time"], session["end"], session["title"])

    def test_speakers_exist(self):
        known = {s["id"] for s in load("speakers")}
        for session in load("schedule"):
            if session["speaker"] is not None:
                self.assertIn(session["speaker"], known, session["title"])

    def test_every_session_has_a_day_and_room(self):
        for session in load("schedule"):
            self.assertIsInstance(session["day"], int)
            self.assertTrue(session["room"])


if __name__ == "__main__":
    unittest.main()
