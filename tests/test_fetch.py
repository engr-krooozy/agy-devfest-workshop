import unittest
from unittest import mock
from urllib.error import URLError

from pagetext import fetch as fetch_module


class FakeResponse:
    def __init__(self, body, charset=None):
        self._body = body
        self.headers = mock.Mock()
        self.headers.get_content_charset.return_value = charset

    def read(self):
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class FetchTests(unittest.TestCase):
    def test_decodes_utf8_by_default(self):
        response = FakeResponse("héllo".encode("utf-8"))
        with mock.patch.object(fetch_module, "urlopen", return_value=response):
            self.assertEqual(fetch_module.fetch("http://x.test/"), "héllo")

    def test_decodes_non_utf8_charset(self):
        response = FakeResponse("héllo".encode("latin-1"), charset="latin-1")
        with mock.patch.object(fetch_module, "urlopen", return_value=response):
            self.assertEqual(fetch_module.fetch("http://x.test/"), "héllo")

    def test_bad_bytes_are_replaced_not_raised(self):
        response = FakeResponse(b"ok \xff\xfe", charset="utf-8")
        with mock.patch.object(fetch_module, "urlopen", return_value=response):
            self.assertIn("ok", fetch_module.fetch("http://x.test/"))

    def test_sends_user_agent_and_timeout(self):
        response = FakeResponse(b"hi")
        with mock.patch.object(fetch_module, "urlopen", return_value=response) as opened:
            fetch_module.fetch("http://x.test/", timeout=7)
        request = opened.call_args.args[0]
        self.assertEqual(request.get_header("User-agent"), fetch_module.USER_AGENT)
        self.assertEqual(opened.call_args.kwargs["timeout"], 7)

    def test_retries_then_succeeds(self):
        good = FakeResponse(b"finally")
        sleeps = []
        with mock.patch.object(fetch_module, "urlopen", side_effect=[URLError("down"), URLError("down"), good]):
            body = fetch_module.fetch("http://x.test/", backoff=1, sleep=sleeps.append)
        self.assertEqual(body, "finally")
        self.assertEqual(sleeps, [1, 2])

    def test_gives_up_after_retries(self):
        sleeps = []
        with mock.patch.object(fetch_module, "urlopen", side_effect=URLError("down")) as opened:
            with self.assertRaises(URLError):
                fetch_module.fetch("http://x.test/", retries=2, sleep=sleeps.append)
        self.assertEqual(opened.call_count, 3)
        self.assertEqual(len(sleeps), 2)


if __name__ == "__main__":
    unittest.main()
