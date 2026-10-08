"""Turn HTML into plain text."""

from html.parser import HTMLParser

BLOCK_TAGS = {"p", "div", "h1", "h2", "h3", "h4", "li", "br", "tr", "section", "article"}


class _TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        self.parts.append(data)


def extract_text(html):
    parser = _TextParser()
    parser.feed(html)
    text = "".join(parser.parts)
    lines = [" ".join(line.split()) for line in text.splitlines()]
    return "\n".join(line for line in lines if line)
