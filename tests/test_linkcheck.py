import unittest
from unittest import mock
from urllib.error import HTTPError

from pagetext import linkcheck


class FakeResponse:
    status = 200

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class LinkCheckTests(unittest.TestCase):
    def test_ok_link(self):
        with mock.patch.object(linkcheck, "urlopen", return_value=FakeResponse()):
            self.assertEqual(linkcheck.check_link("http://x.test/"), 200)

    def test_http_error_returns_code(self):
        err = HTTPError("http://x.test/", 404, "nf", {}, None)
        with mock.patch.object(linkcheck, "urlopen", side_effect=err):
            self.assertEqual(linkcheck.check_link("http://x.test/"), 404)

    def test_unreachable_returns_zero(self):
        with mock.patch.object(linkcheck, "urlopen", side_effect=OSError):
            self.assertEqual(linkcheck.check_link("http://x.test/"), 0)


if __name__ == "__main__":
    unittest.main()
