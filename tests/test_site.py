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

    def test_dark_mode_toggle_exists_and_is_styled(self):
        with open(os.path.join(SITE, "index.html"), encoding="utf-8") as handle:
            self.assertIn('id="theme-toggle"', handle.read())
        with open(os.path.join(SITE, "styles.css"), encoding="utf-8") as handle:
            self.assertIn('[data-theme="dark"]', handle.read())

    def test_event_name_and_city_are_not_hard_coded(self):
        root = os.path.join(SITE, "..")
        for path in ("site/index.html", "site/app.js", "serve.py"):
            with open(os.path.join(root, path), encoding="utf-8") as handle:
                self.assertNotIn("Your City", handle.read(), f"{path} hard-codes the city")


if __name__ == "__main__":
    unittest.main()
