import unittest
from unittest import mock

from pagetext import robots


class FakeResponse:
    def __init__(self, body):
        self._body = body

    def read(self):
        return self._body.encode()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class RobotsTests(unittest.TestCase):
    def test_disallowed_path(self):
        body = "User-agent: *\nDisallow: /private/\n"
        with mock.patch.object(robots, "http_request", return_value=FakeResponse(body)):
            self.assertFalse(robots.is_allowed("http://x.test/private/a.html"))
            self.assertTrue(robots.is_allowed("http://x.test/index.html"))

    def test_missing_robots_means_allowed(self):
        with mock.patch.object(robots, "http_request", side_effect=OSError):
            self.assertTrue(robots.is_allowed("http://x.test/anything"))


if __name__ == "__main__":
    unittest.main()
