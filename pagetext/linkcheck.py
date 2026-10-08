"""Check that a list of URLs still resolve."""

from urllib.error import HTTPError
from urllib.request import Request, urlopen

LINKCHECK_AGENT = "pagetext-linkcheck/0.1 (+devfest)"
LINKCHECK_TIMEOUT = 3


def check_link(url):
    """Return the HTTP status for url, or 0 if it cannot be reached."""
    request = Request(url, method="HEAD", headers={"User-Agent": LINKCHECK_AGENT})
    try:
        with urlopen(request, timeout=LINKCHECK_TIMEOUT) as response:
            return response.status
    except HTTPError as error:
        return error.code
    except OSError:
        return 0


def check_links(urls):
    return {url: check_link(url) for url in urls}
