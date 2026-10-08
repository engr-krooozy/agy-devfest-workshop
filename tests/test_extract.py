import unittest

from pagetext.extract import extract_text


class ExtractTextTests(unittest.TestCase):
    def test_headings_and_paragraphs_become_lines(self):
        html = "<h1>Title</h1><p>Hello   <b>world</b></p>"
        self.assertEqual(extract_text(html), "Title\nHello world")

    def test_list_items_get_their_own_line(self):
        html = "<ul><li>one</li><li>two</li></ul>"
        self.assertEqual(extract_text(html), "one\ntwo")

    def test_empty_input(self):
        self.assertEqual(extract_text(""), "")


if __name__ == "__main__":
    unittest.main()
