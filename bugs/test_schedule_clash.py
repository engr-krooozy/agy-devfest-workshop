"""BUG REPORT, written as tests. These fail on purpose.

Organisers say: "Two talks are scheduled in the Main hall at the same time."
The page even shows a red clash badge. Fix the schedule, not the tests.

    python3 -m unittest discover -s bugs -v
"""

import json
import os
import unittest

SCHEDULE = os.path.join(os.path.dirname(__file__), "..", "site", "data", "schedule.json")


def minutes(time):
    hours, mins = time.split(":")
    return int(hours) * 60 + int(mins)


class NoRoomClashes(unittest.TestCase):
    def test_no_two_sessions_overlap_in_the_same_room(self):
        with open(SCHEDULE, encoding="utf-8") as handle:
            sessions = json.load(handle)
        clashes = []
        for i, a in enumerate(sessions):
            for b in sessions[i + 1:]:
                same_slot = a["day"] == b["day"] and a["room"] == b["room"]
                if same_slot and minutes(a["time"]) < minutes(b["end"]) and minutes(b["time"]) < minutes(a["end"]):
                    clashes.append(f'{a["title"]} vs {b["title"]} ({a["room"]})')
        self.assertEqual(clashes, [], "sessions clash")


if __name__ == "__main__":
    unittest.main()
