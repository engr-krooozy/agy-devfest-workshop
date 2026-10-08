"""Ask a site's robots.txt whether pagetext may fetch a URL."""

from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser

from .fetch import http_request

ROBOTS_AGENT = "pagetext-robots/0.1"
ROBOTS_TIMEOUT = 5


def is_allowed(url):
    """Return True if robots.txt allows fetching url (or there is no robots.txt)."""
    parts = urlsplit(url)
    robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"
    try:
        with http_request(robots_url, timeout=ROBOTS_TIMEOUT, user_agent=ROBOTS_AGENT) as response:
            body = response.read().decode("utf-8", errors="replace")
    except OSError:
        return True  # no robots.txt, or unreachable: allowed
    parser = RobotFileParser()
    parser.parse(body.splitlines())
    return parser.can_fetch(ROBOTS_AGENT, url)
