import os
import unittest

SITE = os.path.join(os.path.dirname(__file__), "..", "site")


class SiteFilesTests(unittest.TestCase):
    def test_index_references_existing_files(self):
        with open(os.path.join(SITE, "index.html"), encoding="utf-8") as handle:
            html = handle.read()
        for asset in ("styles.css", "app.js"):
            self.assertIn(asset, html)
            self.assertTrue(os.path.exists(os.path.join(SITE, asset)), asset)

    def test_page_has_the_sections_the_script_fills(self):
        with open(os.path.join(SITE, "index.html"), encoding="utf-8") as handle:
            html = handle.read()
        for element_id in ("speaker-grid", "timeline", "countdown", "footer"):
            self.assertIn(f'id="{element_id}"', html)


if __name__ == "__main__":
    unittest.main()
