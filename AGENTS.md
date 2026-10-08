# AGENTS.md: rules for this repo

A one-page DevFest event site. Plain HTML, CSS and JavaScript. No build step.

## Layout
- `site/index.html`, `site/styles.css`, `site/app.js`: the page
- `site/data/*.json`: event, speakers and schedule. The page renders whatever is here
- `serve.py`: dev server with live reload (`python3 serve.py`)

## Commands
- Run the site: `python3 serve.py`, then open http://localhost:8000
- Run tests: `python3 -m unittest discover -s tests -v`
- Known failing on purpose: `python3 -m unittest discover -s bugs -v`

## Rules
- No dependencies, no frameworks, no build tooling. Standard library and plain web only.
- Keep the page working on a phone: small screens must not scroll sideways.
- After any change to `site/data/`, run the tests and report the result.
- New session or speaker data must keep the tests in `tests/` green.
- Do not edit the tests in `bugs/`; fix the data or code instead.
- Prefer reading event details from `site/data/event.json` over typing them into code.
