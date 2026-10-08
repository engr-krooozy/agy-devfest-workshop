"""BUG REPORT, written as tests. These fail on purpose.

Users say: "pagetext prints JavaScript and CSS mixed in with the page text."
Fix the code, not the tests.

    python -m unittest discover -s bugs -v
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pagetext.extract import extract_text  # noqa: E402


class ScriptAndStyleAreNotText(unittest.TestCase):
    def test_script_contents_are_dropped(self):
        html = "<p>Hello</p><script>var secret = 1;</script><p>World</p>"
        self.assertEqual(extract_text(html), "Hello\nWorld")

    def test_style_contents_are_dropped(self):
        html = "<style>p { color: red }</style><p>Visible</p>"
        self.assertEqual(extract_text(html), "Visible")


if __name__ == "__main__":
    unittest.main()
