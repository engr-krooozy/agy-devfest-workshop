"""Check that a list of URLs still resolve."""

from urllib.error import HTTPError

from .fetch import http_request

LINKCHECK_AGENT = "pagetext-linkcheck/0.1 (+devfest)"
LINKCHECK_TIMEOUT = 3


def check_link(url):
    """Return the HTTP status for url, or 0 if it cannot be reached."""
    try:
        with http_request(url, method="HEAD", timeout=LINKCHECK_TIMEOUT, user_agent=LINKCHECK_AGENT) as response:
            return response.status
    except HTTPError as error:
        return error.code
    except OSError:
        return 0


def check_links(urls):
    """Return {url: status} for every url."""
    return {url: check_link(url) for url in urls}
