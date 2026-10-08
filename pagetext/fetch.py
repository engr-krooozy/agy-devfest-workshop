"""Fetch a page and print its text.

    python -m pagetext.fetch https://example.com
"""

import sys
from urllib.request import Request, urlopen

from .extract import extract_text

USER_AGENT = "pagetext/0.1 (+devfest-abeokuta)"


def fetch(url, timeout=10):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=timeout) as response:
        raw = response.read()
        charset = response.headers.get_content_charset() or "utf-8"
    return raw.decode(charset, errors="replace")


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 1:
        print("usage: python -m pagetext.fetch URL", file=sys.stderr)
        return 2
    print(extract_text(fetch(argv[0])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
