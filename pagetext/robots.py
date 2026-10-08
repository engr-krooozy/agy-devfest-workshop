"""Ask a site's robots.txt whether pagetext may fetch a URL."""

from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

ROBOTS_AGENT = "pagetext-robots/0.1"
ROBOTS_TIMEOUT = 5


def is_allowed(url):
    parts = urlsplit(url)
    robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"
    request = Request(robots_url, headers={"User-Agent": ROBOTS_AGENT})
    try:
        with urlopen(request, timeout=ROBOTS_TIMEOUT) as response:
            body = response.read().decode("utf-8", errors="replace")
    except OSError:
        return True  # no robots.txt, or unreachable: allowed
    parser = RobotFileParser()
    parser.parse(body.splitlines())
    return parser.can_fetch(ROBOTS_AGENT, url)
