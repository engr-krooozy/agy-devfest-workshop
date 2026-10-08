"""Fetch a page and print its text.

    python -m pagetext.fetch https://example.com
"""

import sys
import time
from urllib.error import URLError
from urllib.request import Request, urlopen

from .extract import extract_text

USER_AGENT = "pagetext/0.1 (+devfest-abeokuta)"


def http_request(url, method="GET", timeout=10, user_agent=USER_AGENT):
    """Open url and return the response. The one place HTTP calls are made."""
    request = Request(url, method=method, headers={"User-Agent": user_agent})
    return urlopen(request, timeout=timeout)


def fetch(url, timeout=10, retries=3, backoff=0.5, sleep=time.sleep):
    """Return the decoded body of url, using the charset the server declares.

    Falls back to UTF-8 when no charset is sent, and replaces bytes that cannot
    be decoded instead of raising. Network errors are retried up to `retries`
    times, waiting backoff, 2*backoff, 4*backoff... seconds between attempts.
    """
    for attempt in range(retries + 1):
        try:
            with http_request(url, timeout=timeout) as response:
                raw = response.read()
                charset = response.headers.get_content_charset() or "utf-8"
            return raw.decode(charset, errors="replace")
        except URLError:
            if attempt == retries:
                raise
            sleep(backoff * (2 ** attempt))


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 1:
        print("usage: python -m pagetext.fetch URL", file=sys.stderr)
        return 2
    print(extract_text(fetch(argv[0])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
